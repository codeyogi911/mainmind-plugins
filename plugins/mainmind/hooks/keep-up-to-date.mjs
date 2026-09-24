#!/usr/bin/env node
// Claude Code Stop hook: keep a Mainmind agent synced even when the model
// forgets to.
//
// The sync skill tells the agent to sync what it learns as it learns it, and
// where it stopped after each finished piece of work and when the person winds
// down. This hook is the safety net for when it does not. It reads the session
// transcript and, only in a session acting as a Mainmind agent, asks the model
// once to sync before it stops.
//
// It also notes which agent this folder last ran as, so the SessionStart hook
// (last-agent-here.mjs) can offer to pick up as that agent next time.
//
// It must never get in the way: every doubt, error or unreadable input ends in
// a silent exit 0, which lets the session stop normally. It never blocks twice
// in a row (Claude Code sets `stop_hook_active` while it is continuing because
// of a Stop hook), and it keeps a small per-session note so it asks at most
// once per STALE_AFTER_MS window even across turns.
//
// Input and output follow https://code.claude.com/docs/en/hooks (Stop):
// stdin carries `session_id`, `transcript_path`, `cwd` and `stop_hook_active`;
// stdout `{"decision":"block","reason":…}` keeps Claude working with `reason`
// as its instruction. No dependencies, so it runs from the installed plugin as
// is.
import { readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { AGENT_SLUG, folderNote, sessionNote } from "./state.mjs";

// With nothing synced yet, this many substantive tool calls since the agent
// was picked up is enough work to be worth a journal entry.
const FIRST_HANDOFF_AFTER = 6;
// With where it stopped already synced, a newer entry is due once it is this
// old and there has been work since.
const STALE_AFTER_MS = 30 * 60 * 1000;

// Calls that are the agent looking after itself, not work for the person.
const HOUSEKEEPING = /__(boot|sync|agent_home|agent_session|whoami|release_notes)$/;
const HOUSEKEEPING_TOOLS = new Set(["TodoWrite", "ToolSearch"]);
// The skill reads a journal entry back to check it landed; reads straight
// after one are that check, not new work.
const READ_BACK = /__read_node$/;

const quietExit = () => { process.exitCode = 0; };
process.on("uncaughtException", quietExit);
process.on("unhandledRejection", quietExit);

function resultText(content) {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";
  return content.map((part) => (typeof part?.text === "string" ? part.text : "")).join("\n");
}

// A write the server refused comes back as an ordinary result whose receipt
// says so, not only as an error. A sync that kept only part of what it was
// sent says "Synced, except: …"; where it stopped may be the part it did not
// keep, so it does not count.
const REFUSED = /"state"\s*:\s*"refused"|^\s*Synced, except\b/m;

function toolCalls(transcript) {
  const calls = [];
  const failed = new Set();
  for (const line of transcript.split("\n")) {
    if (!line.trim()) continue;
    let entry;
    try { entry = JSON.parse(line); } catch { continue; }
    const content = entry?.message?.content;
    if (!Array.isArray(content)) continue;
    for (const part of content) {
      if (part?.type === "tool_use" && typeof part.name === "string") {
        const input = part.input && typeof part.input === "object" ? part.input : {};
        calls.push({ id: part.id, name: part.name, input, at: Date.parse(entry.timestamp) });
      } else if (part?.type === "tool_result"
        && (part.is_error === true || REFUSED.test(resultText(part.content)))) {
        failed.add(part.tool_use_id);
      }
    }
  }
  return calls.map((call) => ({ ...call, failed: failed.has(call.id) }));
}

// The agent a call picks up as: `boot` or `sync` with `agent`.
function pickedUpAs(call) {
  if (!/__(boot|sync)$/.test(call.name)) return null;
  const agent = typeof call.input.agent === "string" ? call.input.agent.trim() : "";
  return agent || null;
}

// A call that syncs where the agent stopped: `sync` with `stopped`, or the
// older `agent_home` handoff. One that failed or was refused does not count.
function syncsWhereItStopped(call) {
  if (call.failed) return false;
  if (/__sync$/.test(call.name)) return Boolean(call.input.stopped && typeof call.input.stopped === "object");
  return /__agent_home$/.test(call.name) && call.input.action === "handoff";
}

const housekeeping = (call) => HOUSEKEEPING.test(call.name) || HOUSEKEEPING_TOOLS.has(call.name);

// The agent this session is acting as now, and the call where it was picked
// up. After "Continue with A" and then "Continue with B", that is B. Picking
// up the same agent again (every sync with `agent` does) keeps the first.
function actingAs(calls) {
  let agent = null;
  let start = -1;
  calls.forEach((call, i) => {
    const picked = pickedUpAs(call);
    if (picked && picked !== agent) { agent = picked; start = i; }
  });
  return { agent, start };
}

// Pure decision, so the rules can be read in one place. Returns the agent slug
// to remind about, or null to let the session stop.
function needsSync(calls, { agent, start }, now) {
  if (!agent) return null;

  let handoffIndex = -1;
  for (let i = start; i < calls.length; i += 1) if (syncsWhereItStopped(calls[i])) handoffIndex = i;

  const since = handoffIndex < 0 ? start : handoffIndex;
  let after = calls.slice(since + 1);
  if (handoffIndex >= 0) {
    let checked = 0;
    while (checked < after.length && (READ_BACK.test(after[checked].name) || housekeeping(after[checked]))) checked += 1;
    after = after.slice(checked);
  }
  const work = after.filter((call) => !housekeeping(call)).length;

  if (handoffIndex < 0) return work >= FIRST_HANDOFF_AFTER ? agent : null;
  const syncedAt = calls[handoffIndex].at;
  if (!Number.isFinite(syncedAt)) return null;
  return work >= 1 && now - syncedAt > STALE_AFTER_MS ? agent : null;
}

function reasonFor(agent) {
  return `Mainmind: ${agent} is not synced with this session's work yet. ` +
    `Before you stop, quietly follow the sync skill: call sync as ${agent} with anything new it learned ` +
    "and with stopped (where you stopped, what is next), then check the home it returns shows them. " +
    "If this connection has no sync tool yet, use agent_home instead. " +
    "Do not tell the person about it. Only if something could not be kept, say that once, plainly, " +
    "and that you will try again. Then stop as you were going to.";
}

// Remember which agent this folder last ran as, for the SessionStart hook. A
// session here that did real work as no agent means the folder last ran as
// no agent, so the note goes.
function noteFolder(cwd, calls, agent, now) {
  const note = folderNote(cwd);
  if (!note) return;
  try {
    if (agent && AGENT_SLUG.test(agent)) {
      mkdirSync(note.dir, { recursive: true, mode: 0o700 });
      writeFileSync(note.path, JSON.stringify({ folder: note.folder, agent, at: now }));
    } else if (!agent && calls.filter((call) => !housekeeping(call)).length >= FIRST_HANDOFF_AFTER) {
      rmSync(note.path, { force: true });
    }
  } catch { /* the next session simply starts without the hint */ }
}

function main() {
  let input;
  try { input = JSON.parse(readFileSync(0, "utf8")); } catch { return; }
  if (!input || typeof input !== "object" || input.stop_hook_active === true) return;
  if (typeof input.transcript_path !== "string" || !input.transcript_path) return;

  let transcript;
  try { transcript = readFileSync(input.transcript_path, "utf8"); } catch { return; }

  const now = process.env.MAINMIND_HOOK_NOW ? Date.parse(process.env.MAINMIND_HOOK_NOW) : Date.now();
  if (!Number.isFinite(now)) return;
  const calls = toolCalls(transcript);
  const acting = actingAs(calls);
  noteFolder(input.cwd, calls, acting.agent, now);

  const agent = needsSync(calls, acting, now);
  if (!agent) return;

  const state = sessionNote(input.session_id);
  if (state) {
    try {
      const last = JSON.parse(readFileSync(state.path, "utf8")).remindedAt;
      if (Number.isFinite(last) && now - last < STALE_AFTER_MS) return;
    } catch { /* no note yet */ }
    try {
      mkdirSync(state.dir, { recursive: true });
      writeFileSync(state.path, JSON.stringify({ remindedAt: now, agent }));
    } catch { /* stop_hook_active still prevents a loop */ }
  }

  process.stdout.write(JSON.stringify({ decision: "block", reason: reasonFor(agent) }));
}

// Let the process end on its own rather than process.exit(): on macOS a pipe
// write is asynchronous and an early exit can cut the decision short.
process.exitCode = 0;
try { main(); } catch { /* never throw into the person's session */ }
