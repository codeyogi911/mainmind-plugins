// Where the Mainmind hooks keep their small local notes, shared by the Stop
// hook, the SessionStart hook and the PostToolUse hook that follows this
// app's task list.
//
// Three kinds of note:
// - per session: when the Stop hook last reminded this session to sync, and
//   which task list that reminder carried;
// - per folder: which agent this folder last ran as, so the next session here
//   can pick up as that agent;
// - per folder and session: this app's current task list (note-tasks.mjs
//   writes it, the Stop hook reads it).
//
// Nothing here throws. A folder that cannot be made or trusted is null, and a
// caller treats null as "nothing to remember".
import { mkdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { createHash } from "node:crypto";

// A profile slug as Mainmind hands it out. Anything else in a note is not
// trusted, never printed and never acted on.
export const AGENT_SLUG = /^[a-z0-9](?:[a-z0-9_-]{0,78}[a-z0-9])?$/i;

export function stateDir() {
  const dir = process.env.MAINMIND_HOOK_STATE_DIR
    || (process.env.CLAUDE_PLUGIN_DATA && join(process.env.CLAUDE_PLUGIN_DATA, "keep-up-to-date"));
  if (dir) return dir;
  // The shared temp folder is a last resort: keep a folder per user, and trust
  // it only if this user owns it, so no one else can plant a note that
  // silences the reminder or names an agent.
  const uid = typeof process.getuid === "function" ? process.getuid() : null;
  const shared = join(tmpdir(), `mainmind-keep-up-to-date-${uid ?? "user"}`);
  try {
    mkdirSync(shared, { recursive: true, mode: 0o700 });
    if (uid !== null && statSync(shared).uid !== uid) return null;
  } catch { return null; }
  return shared;
}

export function sessionNote(sessionId) {
  if (typeof sessionId !== "string" || !sessionId) return null;
  const dir = stateDir();
  if (!dir) return null;
  return { dir, path: join(dir, `${sessionId.replace(/[^A-Za-z0-9_-]/g, "_")}.json`) };
}

// One note per folder, named by a hash of its absolute path. The note repeats
// the path, so a reader can check it is about this folder and no other.
export function folderNote(cwd) {
  if (typeof cwd !== "string" || !cwd) return null;
  const dir = stateDir();
  if (!dir) return null;
  const folder = resolve(cwd);
  const name = createHash("sha256").update(folder).digest("hex").slice(0, 32);
  return { dir: join(dir, "folders"), path: join(dir, "folders", `${name}.json`), folder };
}

// One task list per folder and session, named by a hash of both. The note
// repeats them, so a reader can check it is about this folder and session.
export function taskNote(cwd, sessionId) {
  if (typeof cwd !== "string" || !cwd || typeof sessionId !== "string" || !sessionId) return null;
  const dir = stateDir();
  if (!dir) return null;
  const folder = resolve(cwd);
  const name = createHash("sha256").update(`${folder}\0${sessionId}`).digest("hex").slice(0, 32);
  return { dir: join(dir, "tasks"), path: join(dir, "tasks", `${name}.json`), folder, session: sessionId };
}

// The same stable id Mainmind gives a task that comes without one
// (taskIdFrom in the server's agent-tasks.js): the same title is the same
// task on the next sync.
export const TASK_ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export function taskIdFrom(title) {
  return String(title || "").toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "").slice(0, 60).replace(/-+$/, "") || null;
}
