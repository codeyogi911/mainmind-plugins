// Where the Mainmind hooks keep their small local notes, shared by the Stop
// hook (which writes them) and the SessionStart hook (which reads them).
//
// Two kinds of note:
// - per session: when the Stop hook last reminded this session to sync;
// - per folder: which agent this folder last ran as, so the next session here
//   can pick up as that agent.
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
