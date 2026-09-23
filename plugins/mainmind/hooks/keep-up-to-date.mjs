#!/usr/bin/env node
// Claude Code Stop hook: keep a Mainmind agent up to date even when the model
// forgets to.
//
// The keep-my-agent-up-to-date skill tells the agent to hand off where it
// stopped after each finished piece of work and when the person winds down.
// This hook is the safety net for when it does not. It reads the session
// transcript and, only in a session that booted as a Mainmind agent, asks the
// model once to hand off before it stops.
//
// It must never get in the way: every doubt, error or unreadable input ends in
// a silent exit 0, which lets the session stop normally. It never blocks twice
// in a row (Claude Code sets `stop_hook_active` while it is continuing because
// of a Stop hook), and it keeps a small per-session note so it asks at most
// once per STALE_AFTER_MS window even across turns.
//
// Input and output follow https://code.claude.com/docs/en/hooks (Stop):
// stdin carries `session_id`, `transcript_path` and `stop_hook_active`; stdout
// `{"decision":"block","reason":…}` keeps Claude working with `reason` as its
// instruction. No dependencies, so it runs from the installed plugin as is.
import { readFileSync, writeFileSync, mkdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

// With no handoff yet, this many substantive tool calls since boot is enough
// work to be worth a journal entry.
const FIRST_HANDOFF_AFTER = 6;
// With a handoff already written, a newer one is due once it is this old and
// there has been work since.
const STALE_AFTER_MS = 30 * 60 * 1000;

// Calls that are the agent looking after itself, not work for the person.
const HOUSEKEEPING = /__(boot|agent_home|agent_session|whoami|release_notes)$/;
const HOUSEKEEPING_TOOLS = new Set(["TodoWrite", "ToolSearch"]);
// The skill reads a handoff back to check it landed; reads straight after a
// handoff are that check, not new work.
const READ_BACK = /__read_node$/;

const quietExit = () => { process.exitCode = 0; };
process.on("uncaughtException", quietExit);
process.on("unhandledRejection", quietExit);

function resultText(content) {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";
  return content.map((part) => (typeof part?.text === "string" ? part.text : "")).join("\n");
}

// A handoff the server refused comes back as an ordinary result whose receipt
// says so, not only as an error.
const REFUSED = /"state"\s*:\s*"refused"/;

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
        calls.push({ id: part.id, name: part.name, input: part.input || {}, at: Date.parse(entry.timestamp) });
      } else if (part?.type === "tool_result"
        && (part.is_error === true || REFUSED.test(resultText(part.content)))) {
        failed.add(part.tool_use_id);
      }
    }
  }
  return calls.map((call) => ({ ...call, failed: failed.has(call.id) }));
}

// Pure decision, so the rules can be read in one place. Returns the agent slug
// to remind about, or null to let the session stop.
function needsHandoff(transcript, now) {
  const calls = toolCalls(transcript);
  // The agent this session is acting as now: after "Continue with A" and then
  // "Continue with B", that is B.
  let bootIndex = -1;
  calls.forEach((call, i) => {
    if (/__boot$/.test(call.name) && typeof call.input.agent === "string" && call.input.agent.trim()) bootIndex = i;
  });
  if (bootIndex < 0) return null;
  const agent = calls[bootIndex].input.agent.trim();

  let handoffIndex = -1;
  for (let i = bootIndex + 1; i < calls.length; i += 1) {
    const call = calls[i];
    if (/__agent_home$/.test(call.name) && call.input.action === "handoff" && !call.failed) handoffIndex = i;
  }

  const since = handoffIndex < 0 ? bootIndex : handoffIndex;
  const housekeeping = (call) => HOUSEKEEPING.test(call.name) || HOUSEKEEPING_TOOLS.has(call.name);
  let after = calls.slice(since + 1);
  if (handoffIndex >= 0) {
    let checked = 0;
    while (checked < after.length && (READ_BACK.test(after[checked].name) || housekeeping(after[checked]))) checked += 1;
    after = after.slice(checked);
  }
  const work = after.filter((call) => !housekeeping(call)).length;

  if (handoffIndex < 0) return work >= FIRST_HANDOFF_AFTER ? agent : null;
  const handedOffAt = calls[handoffIndex].at;
  if (!Number.isFinite(handedOffAt)) return null;
  return work >= 1 && now - handedOffAt > STALE_AFTER_MS ? agent : null;
}

function reasonFor(agent) {
  return `Mainmind: ${agent} is not up to date with this session's work yet. ` +
    "Before you stop, quietly follow the keep-my-agent-up-to-date steps: remember anything new " +
    "with agent_home remember, hand off where you stopped with agent_home handoff, and read both back. " +
    "Do not tell the person about it. Only if something could not be kept, say that once, plainly, " +
    "and that you will try again. Then stop as you were going to.";
}

function stateFile(sessionId) {
  if (typeof sessionId !== "string" || !sessionId) return null;
  const file = `${sessionId.replace(/[^A-Za-z0-9_-]/g, "_")}.json`;
  const dir = process.env.MAINMIND_HOOK_STATE_DIR
    || (process.env.CLAUDE_PLUGIN_DATA && join(process.env.CLAUDE_PLUGIN_DATA, "keep-up-to-date"));
  if (dir) return { dir, path: join(dir, file) };
  // The shared temp folder is a last resort: keep a folder per user, and trust
  // it only if this user owns it, so no one else can plant a note that
  // silences the reminder.
  const uid = typeof process.getuid === "function" ? process.getuid() : null;
  const shared = join(tmpdir(), `mainmind-keep-up-to-date-${uid ?? "user"}`);
  try {
    mkdirSync(shared, { recursive: true, mode: 0o700 });
    if (uid !== null && statSync(shared).uid !== uid) return null;
  } catch { return null; }
  return { dir: shared, path: join(shared, file) };
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
  const agent = needsHandoff(transcript, now);
  if (!agent) return;

  const state = stateFile(input.session_id);
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
