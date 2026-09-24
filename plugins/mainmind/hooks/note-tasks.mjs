#!/usr/bin/env node
// Claude Code PostToolUse hook (TodoWrite, TaskCreate, TaskUpdate): note this
// app's current task list for this folder and session, so the Stop hook
// (keep-up-to-date.mjs) can ask the agent to sync it as `tasks`.
//
// Each task is kept as a title, a status in Mainmind's words (todo, doing or
// done) and a stable id: the app's own id when it is one Mainmind accepts and
// is more than a counter, otherwise the same slug of the title Mainmind itself
// makes. A counter ("1", "2") restarts every session, and would make one
// session's task overwrite another's.
//
// It must be fast and never get in the way: no network, one small file, no
// output at all, and every doubt, error or unexpected input ends in a silent
// exit 0 that leaves the note as it was.
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
import { taskNote, taskIdFrom, TASK_ID } from "./state.mjs";

const quietExit = () => { process.exitCode = 0; };
process.on("uncaughtException", quietExit);
process.on("unhandledRejection", quietExit);

const TOOLS = new Set(["TodoWrite", "TaskCreate", "TaskUpdate"]);
// Mainmind's own limits (agent-tasks.js): a title is one line of at most 200
// characters. The note keeps at most this many tasks.
const TITLE_MAX = 200;
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

// The id Mainmind will keep this task under.
function syncId(key, title) {
  if (key && key.length <= 60 && TASK_ID.test(key) && !/^\d+$/.test(key)) return key;
  return taskIdFrom(title);
}

// Mainmind refuses a sync that names one id twice; two titles that slug alike
// get -2, -3.
function uniqueId(id, taken) {
  if (!taken.has(id)) return id;
  for (let n = 2; n < 1000; n += 1) {
    const suffix = `-${n}`;
    const candidate = `${id.slice(0, 60 - suffix.length).replace(/-+$/, "")}${suffix}`;
    if (!taken.has(candidate)) return candidate;
  }
  return null;
}

function task(key, title, status, taken) {
  if (!title) return null;
  const base = syncId(key, title);
  const id = base && uniqueId(base, taken);
  if (!id) return null;
  taken.add(id);
  return { key: key ?? id, id, title, status };
}

// The new list, or null to leave the note as it is.
function apply(tasks, tool, input, response) {
  if (tool === "TodoWrite") {
    if (!Array.isArray(input.todos)) return null;
    const taken = new Set();
    const next = [];
    for (const todo of input.todos) {
      if (!todo || typeof todo !== "object" || removed(todo.status)) continue;
      const title = titleOf(todo.content, todo.subject, todo.title, todo.activeForm);
      const made = task(hostKey(todo.id), title, statusOf(todo.status) || "todo", taken);
      if (made) next.push(made);
    }
    return next;
  }

  const answer = response && typeof response === "object" ? response : {};
  const fromText = typeof response === "string" ? response.match(/(?:#|\btask\s+#?)(\d+)\b/i)?.[1] : null;

  if (tool === "TaskCreate") {
    const title = titleOf(input.subject, input.title, input.description);
    const key = hostKey(answer.task?.id) ?? hostKey(answer.taskId) ?? hostKey(answer.id)
      ?? hostKey(fromText) ?? hostKey(input.taskId) ?? hostKey(input.id);
    const rest = tasks.filter((item) => !key || item.key !== key);
    const made = task(key, title, statusOf(input.status) || "todo", new Set(rest.map((item) => item.id)));
    return made ? [...rest, made] : null;
  }

  if (tool === "TaskUpdate") {
    const key = hostKey(input.taskId) ?? hostKey(input.task_id) ?? hostKey(input.id);
    if (!key) return null;
    const at = tasks.findIndex((item) => item.key === key);
    if (removed(input.status)) return at < 0 ? null : tasks.filter((_, i) => i !== at);
    const title = titleOf(input.subject, input.title);
    if (at < 0) {
      // A task this note never saw created: keep it only if it says what it is.
      const made = task(key, title, statusOf(input.status) || "todo", new Set(tasks.map((item) => item.id)));
      return made ? [...tasks, made] : null;
    }
    // The id stays what it was, so a renamed task is still the same task.
    const updated = { ...tasks[at], status: statusOf(input.status) || tasks[at].status, title: title || tasks[at].title };
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
// keeps one read-change-write at a time; a lock older than two seconds is
// left over from a hook that was killed and is taken over.
function withLock(path, fn) {
  const lock = `${path}.lock`;
  const pause = new Int32Array(new SharedArrayBuffer(4));
  for (let tries = 0; tries < 100; tries += 1) {
    try { mkdirSync(lock); } catch (error) {
      if (error?.code !== "EEXIST") return;
      try { if (Date.now() - statSync(lock).mtimeMs > 2000) rmdirSync(lock); } catch { /* gone already */ }
      Atomics.wait(pause, 0, 0, 10);
      continue;
    }
    try { fn(); } finally { try { rmdirSync(lock); } catch { /* nothing to undo */ } }
    return;
  }
}

function main() {
  let input;
  try { input = JSON.parse(readFileSync(0, "utf8")); } catch { return; }
  if (!input || typeof input !== "object" || !TOOLS.has(input.tool_name)) return;
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
