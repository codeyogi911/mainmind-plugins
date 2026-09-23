#!/usr/bin/env node
// Runs the Claude Code Stop hook in plugins/mainmind/hooks exactly as Claude
// Code does — JSON on stdin, decision on stdout — against fixture transcripts,
// one case per way out of the script. The hook must exit 0 every time; it may
// only differ in whether it prints a block decision.
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const HOOK = join(root, "plugins/mainmind/hooks/keep-up-to-date.mjs");
const FIXTURES = join(root, "tools/fixtures/keep-up-to-date");
const NOW = "2026-09-23T12:00:00Z"; // the fixtures' timestamps count back from here

const stateDir = mkdtempSync(join(tmpdir(), "keep-up-to-date-test-"));
let session = 0;

function run({ fixture, stdin, stopHookActive = false, sessionId, now = NOW }) {
  const input = stdin ?? JSON.stringify({
    session_id: sessionId ?? `session-${(session += 1)}`,
    transcript_path: fixture === undefined ? undefined : join(FIXTURES, fixture),
    cwd: root,
    hook_event_name: "Stop",
    stop_hook_active: stopHookActive,
    last_assistant_message: "Done.",
  });
  const result = spawnSync(process.execPath, [HOOK], {
    input,
    encoding: "utf8",
    env: { ...process.env, MAINMIND_HOOK_NOW: now, MAINMIND_HOOK_STATE_DIR: stateDir },
    timeout: 15000,
  });
  return { status: result.status, stdout: result.stdout, stderr: result.stderr };
}

const cases = [];
const test = (name, fn) => cases.push([name, fn]);
const ALLOWS = "allow";
const BLOCKS = "block";

function expect(result, outcome) {
  if (result.status !== 0) throw new Error(`exit ${result.status}, stderr: ${result.stderr}`);
  if (result.stderr) throw new Error(`wrote to stderr: ${result.stderr}`);
  if (outcome === ALLOWS) {
    if (result.stdout !== "") throw new Error(`expected no output, got ${result.stdout}`);
    return;
  }
  let decision;
  try { decision = JSON.parse(result.stdout); } catch { throw new Error(`expected a JSON decision, got ${JSON.stringify(result.stdout)}`); }
  if (decision.decision !== "block") throw new Error(`expected decision block, got ${decision.decision}`);
  if (!/keep-my-agent-up-to-date/.test(decision.reason) || !/job-hunter/.test(decision.reason)) {
    throw new Error(`reason does not name the steps and the agent: ${decision.reason}`);
  }
  if (!/Do not tell the person/.test(decision.reason)) throw new Error("reason does not keep the update quiet");
}

// Ways out before the transcript is read.
test("stop_hook_active: never blocks twice in a row", () => expect(run({ fixture: "no-handoff-yet.jsonl", stopHookActive: true }), ALLOWS));
test("stdin is not JSON", () => expect(run({ stdin: "not json" }), ALLOWS));
test("stdin is empty", () => expect(run({ stdin: "" }), ALLOWS));
test("stdin is JSON but not an object", () => expect(run({ stdin: "42" }), ALLOWS));
test("no transcript_path", () => expect(run({}), ALLOWS));
test("transcript unreadable", () => expect(run({ fixture: "does-not-exist.jsonl" }), ALLOWS));
test("clock unreadable", () => expect(run({ fixture: "no-handoff-yet.jsonl", now: "not a time" }), ALLOWS));

// Sessions that are not a Mainmind agent.
test("never booted", () => expect(run({ fixture: "no-boot.jsonl" }), ALLOWS));
test("booted without an agent", () => expect(run({ fixture: "boot-without-agent.jsonl" }), ALLOWS));

// No handoff yet.
test("under the threshold of work since boot", () => expect(run({ fixture: "few-calls.jsonl" }), ALLOWS));
test("only the agent looking after itself", () => expect(run({ fixture: "housekeeping-only.jsonl" }), ALLOWS));
test("enough work since boot and no handoff", () => expect(run({ fixture: "no-handoff-yet.jsonl" }), BLOCKS));
test("a handoff that failed does not count", () => expect(run({ fixture: "failed-handoff.jsonl" }), BLOCKS));
test("a handoff the server refused does not count", () => expect(run({ fixture: "refused-handoff.jsonl" }), BLOCKS));
test("the agent booted last is the one reminded", () => expect(run({ fixture: "switched-agent.jsonl" }), BLOCKS));
test("malformed transcript lines are skipped", () => expect(run({ fixture: "malformed-lines.jsonl" }), BLOCKS));

// A handoff already written.
test("recent handoff, work since", () => expect(run({ fixture: "recent-handoff.jsonl" }), ALLOWS));
test("old handoff, no work since", () => expect(run({ fixture: "stale-handoff-idle.jsonl" }), ALLOWS));
test("old handoff, only its read-back since", () => expect(run({ fixture: "stale-handoff-read-back.jsonl" }), ALLOWS));
test("old handoff, work since", () => expect(run({ fixture: "stale-handoff.jsonl" }), BLOCKS));

// At most once per window in one session, even across turns.
test("asks once per session window, then lets it stop", () => {
  expect(run({ fixture: "no-handoff-yet.jsonl", sessionId: "repeat" }), BLOCKS);
  expect(run({ fixture: "no-handoff-yet.jsonl", sessionId: "repeat" }), ALLOWS);
  expect(run({ fixture: "no-handoff-yet.jsonl", sessionId: "repeat", now: "2026-09-23T12:31:00Z" }), BLOCKS);
});

let failures = 0;
for (const [name, fn] of cases) {
  try { fn(); console.log(`PASS ${name}`); } catch (error) { failures += 1; console.error(`FAIL ${name}: ${error.message}`); }
}
rmSync(stateDir, { recursive: true, force: true });
if (failures) {
  console.error(`\n${failures} of ${cases.length} hook case(s) failed`);
  process.exit(1);
}
console.log(`PASS ${cases.length} keep-up-to-date hook cases`);
