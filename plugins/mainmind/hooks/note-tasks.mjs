#!/usr/bin/env node
// Claude Code PostToolUse hook (TodoWrite, TaskCreate, TaskUpdate): note this
// app's current task list for this folder and session, so the Stop hook
// (keep-up-to-date.mjs) can ask the agent to sync it as `tasks`.
//
// Each task is kept as a title, a status in Mainmind's words (todo, doing or
// done) and the id it syncs under. That id always comes from the title, the
// same slug Mainmind itself makes, never from this app: the app's ids
// ("1", "task-1", "setup") restart every session, and Mainmind keeps one task
// per id, so one session's task would overwrite another's. The app's id is
// kept only as a local key, to find the task again when the app updates it.
// Once a task has an id it keeps it, even when renamed, and two tasks whose
// titles slug alike get -2, -3, which also stay theirs.
//
// It must be fast and never get in the way: no network, one small file, no
// output at all, and every doubt, error or unexpected input ends in a silent
// exit 0 that leaves the note as it was. A subagent's own list (input with
// `agent_id`) is not the session's and is ignored. `agent_type` alone is a
// session started with --agent, which is still the session.
//
// Input follows https://code.claude.com/docs/en/hooks (PostToolUse): stdin
// carries `session_id`, `cwd`, `tool_name`, `tool_input` and `tool_response`.
// The three tools' own shapes are not published there, so they are read
// defensively:
// - TodoWrite: `tool_input.todos[]`, each `{content, status, id?}` with status
//   pending, in_progress or completed. It always carries the whole list.
// - TaskCreate: `tool_input.subject` (or `title`, or the first line of
//   `description`) and an optional `status`; the new task's id from
//   `tool_response` (`task.id`, `taskId` or `id`) when it gives one.
// - TaskUpdate: `tool_input.taskId` (or `id`), with `status` (deleted removes
//   the task) and optionally a new `subject` or `title`.
import { readFileSync, writeFileSync, mkdirSync, rmdirSync, renameSync, statSync, rmSync } from "node:fs";
import { createHash, randomBytes } from "node:crypto";
import { join } from "node:path";
import { taskNote, taskIdFrom } from "./state.mjs";

const quietExit = () => { process.exitCode = 0; };
process.on("uncaughtException", quietExit);
process.on("unhandledRejection", quietExit);

const TOOLS = new Set(["TodoWrite", "TaskCreate", "TaskUpdate"]);
// Mainmind's own limits for sync: a title is one line of at most 200
// characters, an id at most 60. The note keeps at most this many tasks.
const TITLE_MAX = 200;
const ID_MAX = 60;
const KEEP = 100;

const STATUS = new Map([
  ["pending", "todo"], ["todo", "todo"], ["open", "todo"], ["not_started", "todo"],
  ["in_progress", "doing"], ["in-progress", "doing"], ["doing", "doing"], ["active", "doing"],
  ["completed", "done"], ["complete", "done"], ["done", "done"],
]);
const REMOVED = new Set(["deleted", "removed"]);

const statusOf = (value) => (typeof value === "string" ? STATUS.get(value.trim().toLowerCase()) : undefined);
const removed = (value) => typeof value === "string" && REMOVED.has(value.trim().toLowerCase());

function titleOf(...values) {
  for (const value of values) {
    if (typeof value !== "string") continue;
    const line = value.split(/\r?\n/).map((part) => part.trim()).find(Boolean);
    if (line) return line.replace(/\s+/g, " ").slice(0, TITLE_MAX).trim();
  }
  return "";
}

const hostKey = (value) => (typeof value === "string" && value.trim() ? value.trim()
  : Number.isSafeInteger(value) ? String(value) : null);

// The id a task syncs under, from its title alone. A title that slugs to a
// bare number gets a word in front (Mainmind takes it, but a number reads as
// a request's); a title with nothing a slug can keep (no Latin letters or
// digits) gets a short hash of itself, the same every time.
function syncIdFor(title) {
  const slug = taskIdFrom(title);
  if (!slug) return `task-${createHash("sha1").update(title).digest("hex").slice(0, 8)}`;
  if (/^\d+$/.test(slug)) return `task-${slug}`.slice(0, ID_MAX);
  return slug;
}
// The local key for a task the app gave no id: its title.
const titleKey = (title) => `title:${syncIdFor(title)}`;

// Mainmind refuses a sync that names one id twice; two titles that slug alike
// get -2, -3.
function uniqueId(id, taken) {
  if (!taken.has(id)) return id;
  for (let n = 2; n < 1000; n += 1) {
    const suffix = `-${n}`;
    const candidate = `${id.slice(0, ID_MAX - suffix.length).replace(/-+$/, "")}${suffix}`;
    if (!taken.has(candidate)) return candidate;
  }
  return null;
}

function fresh(key, title, status, taken) {
  if (!title) return null;
  const id = uniqueId(syncIdFor(title), taken);
  if (!id) return null;
  taken.add(id);
  return { key: key ?? titleKey(title), id, title, status };
}

// TodoWrite carries the whole list. Each todo is matched to the task it was
// last time, so it keeps that task's id: by the app's id when it has one,
// otherwise by title (the same status first, when two share a title). Only
// then are ids handed to what is new, so a new task never takes one that is
// already in use.
function fromTodoWrite(tasks, todos) {
  const wanted = [];
  for (const todo of todos) {
    if (!todo || typeof todo !== "object" || removed(todo.status)) continue;
    const title = titleOf(todo.content, todo.subject, todo.title, todo.activeForm);
    if (title) wanted.push({ key: hostKey(todo.id), title, status: statusOf(todo.status) || "todo" });
  }
  const left = [...tasks];
  const take = (find) => {
    const at = left.findIndex(find);
    return at < 0 ? null : left.splice(at, 1)[0];
  };
  const matched = wanted.map((want) => (want.key
    ? take((item) => item.key === want.key)
    : take((item) => item.key.startsWith("title:") && item.title === want.title && item.status === want.status)
      ?? take((item) => item.key.startsWith("title:") && item.title === want.title)));
  const taken = new Set(matched.filter(Boolean).map((item) => item.id));
  const next = [];
  wanted.forEach((want, i) => {
    const before = matched[i];
    const made = before
      ? { ...before, title: want.title, status: want.status }
      : fresh(want.key, want.title, want.status, taken);
    if (made) next.push(made);
  });
  return next;
}

// The new list, or null to leave the note as it is.
function apply(tasks, tool, input, response) {
  if (tool === "TodoWrite") return Array.isArray(input.todos) ? fromTodoWrite(tasks, input.todos) : null;

  const answer = response && typeof response === "object" ? response : {};
  const fromText = typeof response === "string" ? response.match(/(?:#|\btask\s+#?)(\d+)\b/i)?.[1] : null;
  const ids = new Set(tasks.map((item) => item.id));

  if (tool === "TaskCreate") {
    const title = titleOf(input.subject, input.title, input.description);
    const key = hostKey(answer.task?.id) ?? hostKey(answer.taskId) ?? hostKey(answer.id)
      ?? hostKey(fromText) ?? hostKey(input.taskId) ?? hostKey(input.id);
    if (key && tasks.some((item) => item.key === key)) return null; // already noted
    const made = fresh(key, title, statusOf(input.status) || "todo", ids);
    return made ? [...tasks, made] : null;
  }

  if (tool === "TaskUpdate") {
    const key = hostKey(input.taskId) ?? hostKey(input.task_id) ?? hostKey(input.id);
    const title = titleOf(input.subject, input.title);
    let at = key ? tasks.findIndex((item) => item.key === key) : -1;
    // A task made without an id the hook could see is keyed by its title.
    if (at < 0 && title) at = tasks.findIndex((item) => item.key === titleKey(title));
    if (removed(input.status)) return at < 0 ? null : tasks.filter((_, i) => i !== at);
    if (at < 0) {
      // A task this note never saw created: keep it only if it says what it is.
      if (!key) return null;
      const made = fresh(key, title, statusOf(input.status) || "todo", ids);
      return made ? [...tasks, made] : null;
    }
    // The id stays what it was, so a renamed task is still the same task.
    const updated = {
      ...tasks[at], key: key ?? tasks[at].key,
      status: statusOf(input.status) || tasks[at].status, title: title || tasks[at].title,
    };
    return tasks.map((item, i) => (i === at ? updated : item));
  }
  return null;
}

function readTasks(note) {
  try {
    const saved = JSON.parse(readFileSync(note.path, "utf8"));
    if (saved?.folder !== note.folder || saved?.session !== note.session || !Array.isArray(saved.tasks)) return [];
    return saved.tasks.filter((item) => item && typeof item.key === "string" && typeof item.id === "string"
      && typeof item.title === "string" && ["todo", "doing", "done"].includes(item.status));
  } catch { return []; }
}

// Two calls can land at once (several tasks made in one turn). A lock folder
// keeps one read-change-write at a time. It holds a token naming its holder,
// so a holder only ever removes its own lock. A lock older than STALE_MS is
// left over from a hook that was killed: it is first renamed out of the way
// under a name of its own, and only what was renamed is removed. Waiting lasts
// longer than a lock takes to go stale, so a stale lock is always taken over.
const STALE_MS = 2000;
const WAIT_MS = 2500;
function withLock(path, fn) {
  const lock = `${path}.lock`;
  const token = `${process.pid}-${randomBytes(6).toString("hex")}`;
  const pause = new Int32Array(new SharedArrayBuffer(4));
  const until = Date.now() + WAIT_MS;
  while (Date.now() < until) {
    try {
      mkdirSync(lock);
    } catch (error) {
      if (error?.code !== "EEXIST") return;
      try {
        if (Date.now() - statSync(lock).mtimeMs > STALE_MS) {
          const aside = `${lock}.stale-${token}`;
          renameSync(lock, aside);
          rmSync(aside, { recursive: true, force: true });
          continue;
        }
      } catch { /* gone already, or someone else took it over */ }
      Atomics.wait(pause, 0, 0, 10);
      continue;
    }
    try {
      writeFileSync(join(lock, "holder"), token);
      fn();
    } finally {
      try {
        if (readFileSync(join(lock, "holder"), "utf8") === token) {
          rmSync(join(lock, "holder"));
          rmdirSync(lock);
        }
      } catch { /* taken over already: not ours to remove */ }
    }
    return;
  }
}

function main() {
  let input;
  try { input = JSON.parse(readFileSync(0, "utf8")); } catch { return; }
  if (!input || typeof input !== "object" || !TOOLS.has(input.tool_name)) return;
  // A subagent keeps its own list; it is not the session's.
  if (input.agent_id != null) return;
  const toolInput = input.tool_input;
  if (!toolInput || typeof toolInput !== "object" || Array.isArray(toolInput)) return;

  // The project folder, not wherever the session has cd'd to, is "here".
  const note = taskNote(process.env.CLAUDE_PROJECT_DIR || input.cwd, input.session_id);
  if (!note) return;
  const now = process.env.MAINMIND_HOOK_NOW ? Date.parse(process.env.MAINMIND_HOOK_NOW) : Date.now();

  mkdirSync(note.dir, { recursive: true, mode: 0o700 });
  withLock(note.path, () => {
    const before = readTasks(note);
    const after = apply(before, input.tool_name, toolInput, input.tool_response);
    if (!after || JSON.stringify(after) === JSON.stringify(before)) return;
    const kept = after.length > KEEP ? after.slice(-KEEP) : after;
    const temp = `${note.path}.${process.pid}.tmp`;
    try {
      writeFileSync(temp, JSON.stringify({
        folder: note.folder, session: note.session, at: Number.isFinite(now) ? now : Date.now(), tasks: kept,
      }), { mode: 0o600 });
      renameSync(temp, note.path);
    } catch { try { rmSync(temp, { force: true }); } catch { /* nothing left */ } }
  });
}

process.exitCode = 0;
try { main(); } catch { /* never throw into the person's session */ }
