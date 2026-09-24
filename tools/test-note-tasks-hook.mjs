#!/usr/bin/env node
// Runs the Claude Code PostToolUse hook in plugins/mainmind/hooks exactly as
// Claude Code does — the tool call as JSON on stdin — against fixture tool
// calls, and then the Stop hook after it. The task hook must exit 0 every
// time and print nothing; the note it leaves is what is checked. The Stop hook
// must add its one task line when the list changed since its last reminder,
// and not when it did not.
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, readFileSync, existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const TASKS = join(root, "plugins/mainmind/hooks/note-tasks.mjs");
const STOP = join(root, "plugins/mainmind/hooks/keep-up-to-date.mjs");
const FIXTURES = join(root, "tools/fixtures/note-tasks");
const TRANSCRIPTS = join(root, "tools/fixtures/keep-up-to-date");
const NOW = "2026-09-23T12:00:00Z";
const LATER = "2026-09-23T12:31:00Z"; // past the Stop hook's once-per-window
const LATER_STILL = "2026-09-23T13:02:00Z";

const scratch = mkdtempSync(join(tmpdir(), "note-tasks-test-"));
let n = 0;
// A fresh state folder, project folder and session per case.
function fresh() {
  n += 1;
  const stateDir = join(scratch, `state-${n}`);
  const folder = join(scratch, `project-${n}`);
  mkdirSync(folder, { recursive: true });
  return { stateDir, folder, session: `session-${n}` };
}

function spawn(script, input, stateDir, now = NOW) {
  const result = spawnSync(process.execPath, [script], {
    input,
    encoding: "utf8",
    env: { ...process.env, CLAUDE_PROJECT_DIR: "", MAINMIND_HOOK_NOW: now, MAINMIND_HOOK_STATE_DIR: stateDir },
    timeout: 15000,
  });
  if (result.status !== 0) throw new Error(`${script} exit ${result.status}, stderr: ${result.stderr}`);
  if (result.stderr) throw new Error(`${script} wrote to stderr: ${result.stderr}`);
  return result.stdout;
}

// One tool call through the task hook. It never prints.
function tool(ctx, fixture, overrides = {}) {
  const input = typeof fixture === "string" && fixture.endsWith(".json")
    ? JSON.stringify({ session_id: ctx.session, cwd: ctx.folder, ...JSON.parse(readFileSync(join(FIXTURES, fixture), "utf8")), ...overrides })
    : fixture;
  const stdout = spawn(TASKS, input, ctx.stateDir);
  if (stdout !== "") throw new Error(`the task hook printed ${JSON.stringify(stdout)}`);
}

// The note the task hook left, found by listing rather than by recomputing its
// name, so the test does not share the hook's own path logic.
function note(ctx) {
  const dir = join(ctx.stateDir, "tasks");
  const files = existsSync(dir) ? readdirSync(dir).filter((name) => name.endsWith(".json")) : [];
  if (files.length > 1) throw new Error(`expected one task note, found ${files.length}`);
  return files.length ? JSON.parse(readFileSync(join(dir, files[0]), "utf8")) : null;
}
const rows = (ctx) => (note(ctx)?.tasks || []).map(({ id, title, status }) => ({ id, title, status }));

function same(actual, expected) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`expected ${JSON.stringify(expected)}\n       got ${JSON.stringify(actual)}`);
  }
}

// The Stop hook's decision for this session, as the reason text or "".
function stop(ctx, transcript, now = NOW) {
  const stdout = spawn(STOP, JSON.stringify({
    session_id: ctx.session, transcript_path: join(TRANSCRIPTS, transcript), cwd: ctx.folder,
    hook_event_name: "Stop", stop_hook_active: false, last_assistant_message: "Done.",
  }), ctx.stateDir, now);
  if (stdout === "") return "";
  const decision = JSON.parse(stdout);
  if (decision.decision !== "block") throw new Error(`expected decision block, got ${decision.decision}`);
  if (/\b(save|saved|handoff|hand off|bring back|restore|export|commit|git)\b/i.test(decision.reason)) {
    throw new Error(`reason uses a word people no longer read: ${decision.reason}`);
  }
  return decision.reason;
}
const taskLine = (reason) => reason.split("\n").find((line) => /\bsend it as tasks\b/.test(line)) || null;

const cases = [];
const test = (name, fn) => cases.push([name, fn]);

// The task hook on its own.
test("a TodoWrite call leaves the list, in Mainmind's words", () => {
  const ctx = fresh();
  tool(ctx, "todowrite.json");
  const saved = note(ctx);
  if (saved.folder !== ctx.folder || saved.session !== ctx.session) throw new Error("the note does not name its folder and session");
  same(rows(ctx), [
    { id: "read-the-job-board", title: "Read the job board", status: "done" },
    { id: "draft-the-cover-letter-for-razorpay", title: "Draft the cover letter for Razorpay", status: "doing" },
    { id: "shortlist-three-remote-roles", title: "Shortlist three remote roles", status: "todo" },
  ]);
});
test("a later TodoWrite replaces the list", () => {
  const ctx = fresh();
  tool(ctx, "todowrite.json");
  tool(ctx, "todowrite-changed.json");
  same(rows(ctx).map((row) => row.status), ["done", "done", "doing"]);
});
test("the app's id is kept only when it is a real id; a counter or junk becomes the title's slug", () => {
  const ctx = fresh();
  tool(ctx, "todowrite-host-ids.json");
  same(rows(ctx), [
    { id: "fix-the-flaky-login-test", title: "Fix the flaky login test", status: "todo" },
    { id: "cover-letter", title: "Draft the cover letter", status: "doing" },
    { id: "book-the-interview", title: "Book the interview", status: "done" },
    { id: "line-one", title: "Line one", status: "todo" },
  ]);
});
test("TaskCreate and TaskUpdate follow one task by the app's id", () => {
  const ctx = fresh();
  tool(ctx, "taskcreate.json");
  tool(ctx, "taskcreate-second.json");
  same(rows(ctx), [
    { id: "write-the-launch-post", title: "Write the launch post", status: "todo" },
    { id: "check-the-pricing-page", title: "Check the pricing page", status: "todo" },
  ]);
  tool(ctx, "taskupdate-doing.json");
  same(rows(ctx)[0].status, "doing");
  tool(ctx, "taskupdate-done-renamed.json");
  // Renamed, the task keeps its id: it is still the same task.
  same(rows(ctx)[0], { id: "write-the-launch-post", title: "Write and post the launch post", status: "done" });
  tool(ctx, "taskupdate-deleted.json");
  same(rows(ctx).map((row) => row.id), ["write-the-launch-post"]);
});
test("an update to a task never seen, with no title, changes nothing", () => {
  const ctx = fresh();
  tool(ctx, "taskcreate.json");
  const before = JSON.stringify(note(ctx));
  tool(ctx, "taskupdate-unknown.json");
  same(JSON.stringify(note(ctx)), before);
});
test("another folder or another session starts its own list", () => {
  const ctx = fresh();
  tool(ctx, "todowrite.json");
  tool({ ...ctx, session: "someone-else" }, "taskcreate.json");
  const files = readdirSync(join(ctx.stateDir, "tasks")).filter((name) => name.endsWith(".json"));
  if (files.length !== 2) throw new Error(`expected two notes, found ${files.length}`);
});
for (const [name, input] of [
  ["stdin is not JSON", "not json"],
  ["stdin is empty", ""],
  ["stdin is JSON but not an object", "42"],
  ["tool_input is missing", JSON.stringify({ session_id: "x", cwd: "/tmp", tool_name: "TodoWrite" })],
  ["no session", JSON.stringify({ cwd: "/tmp", tool_name: "TodoWrite", tool_input: { todos: [] } })],
]) {
  test(`${name}: silent, no note`, () => {
    const ctx = fresh();
    tool(ctx, input);
    if (note(ctx)) throw new Error("a note was written");
  });
}
for (const fixture of ["other-tool.json", "todos-not-a-list.json"]) {
  test(`${fixture}: silent, no note`, () => {
    const ctx = fresh();
    tool(ctx, fixture);
    if (note(ctx)) throw new Error("a note was written");
  });
}
test("an unreadable note is started over, not trusted", () => {
  const ctx = fresh();
  tool(ctx, "todowrite.json");
  const dir = join(ctx.stateDir, "tasks");
  const [file] = readdirSync(dir);
  spawnSync("sh", ["-c", `printf 'not json' > '${join(dir, file)}'`]);
  tool(ctx, "taskcreate.json");
  same(rows(ctx).map((row) => row.id), ["write-the-launch-post"]);
});

// The Stop hook reads the note.
test("a list, in a session acting as an agent, adds the task line to the reminder", () => {
  const ctx = fresh();
  tool(ctx, "todowrite.json");
  const line = taskLine(stop(ctx, "no-handoff-yet.jsonl"));
  if (!line) throw new Error("no task line");
  for (const expected of ['"Draft the cover letter for Razorpay" (doing, id draft-the-cover-letter-for-razorpay)',
    '"Shortlist three remote roles" (todo, id shortlist-three-remote-roles)', '"Read the job board" (done, id read-the-job-board)',
    "done ones marked done"]) {
    if (!line.includes(expected)) throw new Error(`task line lacks ${expected}: ${line}`);
  }
  if (line.indexOf("(doing") > line.indexOf("(todo") || line.indexOf("(todo") > line.indexOf("(done")) {
    throw new Error(`task line is not doing, then to do, then done: ${line}`);
  }
});
test("an unchanged list adds nothing to the next reminder; a changed one adds the line again", () => {
  const ctx = fresh();
  tool(ctx, "todowrite.json");
  if (!taskLine(stop(ctx, "no-handoff-yet.jsonl"))) throw new Error("no task line the first time");
  const again = stop(ctx, "no-handoff-yet.jsonl", LATER);
  if (!again) throw new Error("expected the reminder itself");
  if (taskLine(again)) throw new Error(`an unchanged list added a line: ${again}`);
  tool(ctx, "todowrite-changed.json");
  const changed = taskLine(stop(ctx, "no-handoff-yet.jsonl", LATER_STILL));
  if (!changed || !changed.includes('"Draft the cover letter for Razorpay" (done')) throw new Error(`no line for the changed list: ${changed}`);
});
test("no list: the reminder is as before", () => {
  const ctx = fresh();
  const reason = stop(ctx, "no-handoff-yet.jsonl");
  if (!reason || taskLine(reason)) throw new Error(`expected the plain reminder, got ${reason}`);
});
test("a list in a session that is no agent: no reminder at all", () => {
  const ctx = fresh();
  tool(ctx, "todowrite.json");
  same(stop(ctx, "no-boot.jsonl"), "");
});
test("another session's list is not this one's", () => {
  const ctx = fresh();
  tool({ ...ctx, session: "someone-else" }, "todowrite.json");
  if (taskLine(stop(ctx, "no-handoff-yet.jsonl"))) throw new Error("another session's list was named");
});

let failures = 0;
for (const [name, fn] of cases) {
  try { fn(); console.log(`PASS ${name}`); } catch (error) { failures += 1; console.error(`FAIL ${name}: ${error.message}`); }
}
rmSync(scratch, { recursive: true, force: true });
if (failures) {
  console.error(`\n${failures} of ${cases.length} task hook case(s) failed`);
  process.exit(1);
}
console.log(`PASS ${cases.length} note-tasks hook cases`);
