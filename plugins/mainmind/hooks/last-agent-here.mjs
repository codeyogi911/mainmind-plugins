#!/usr/bin/env node
// Claude Code SessionStart hook: when this folder last ran as a Mainmind
// agent, tell the model so, in one line, so it can sync as that agent and pick
// up where it left off without the person having to say which.
//
// It reads only the note the Stop hook (keep-up-to-date.mjs) leaves per
// folder. No note, an unreadable note, a note about another folder, or a
// resumed session (which already has its own history): it prints nothing.
// Whether to actually pick up is the model's call (the mainmind-boot skill):
// a plain coding or question session is never interrupted with agent talk.
//
// It must be fast and never fail a session: no network, one small file read,
// and every doubt ends in a silent exit 0.
//
// Input and output follow https://code.claude.com/docs/en/hooks (SessionStart):
// stdin carries `session_id`, `cwd`, `hook_event_name` and `source`
// (startup, resume, clear or compact); stdout
// `{"hookSpecificOutput":{"hookEventName":"SessionStart","additionalContext":…}}`
// adds the context.
import { readFileSync } from "node:fs";
import { AGENT_SLUG, folderNote } from "./state.mjs";

const quietExit = () => { process.exitCode = 0; };
process.on("uncaughtException", quietExit);
process.on("unhandledRejection", quietExit);

function main() {
  let input;
  try { input = JSON.parse(readFileSync(0, "utf8")); } catch { return; }
  if (!input || typeof input !== "object") return;
  if (input.source === "resume") return;

  // The same folder the Stop hook noted: the project, then the session's cwd.
  const note = folderNote(process.env.CLAUDE_PROJECT_DIR || input.cwd);
  if (!note) return;
  let last;
  try { last = JSON.parse(readFileSync(note.path, "utf8")); } catch { return; }
  if (!last || last.folder !== note.folder) return;
  const agent = typeof last.agent === "string" ? last.agent : "";
  if (!AGENT_SLUG.test(agent)) return;

  const additionalContext = `Last time here you were ${agent}. ` +
    `Sync as ${agent} and pick up where you left off. ` +
    `(Only when the person's first message is about ${agent}'s work; otherwise say nothing about it.)`;
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: { hookEventName: "SessionStart", additionalContext },
  }));
}

process.exitCode = 0;
try { main(); } catch { /* never throw into the person's session */ }
