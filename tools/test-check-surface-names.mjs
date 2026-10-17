#!/usr/bin/env node
// Probes for the surface-name gate. A local server stands in for
// https://mainmind.app/api/surface so the cases stay offline.
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const CHECK = join(root, "tools/check-surface-names.mjs");
const snapshot = JSON.parse(readFileSync(join(root, "tools/surface-snapshot.json"), "utf8"));
const scratch = mkdtempSync(join(tmpdir(), "surface-probe-"));
let fixtureCount = 0;

function fixture(body) {
  const dir = join(scratch, String((fixtureCount += 1)));
  mkdirSync(dir);
  writeFileSync(join(dir, "SKILL.md"), body);
  return dir;
}

const routes = new Map([
  ["/match", snapshot.tools],
  ["/missing-sync", snapshot.tools.filter((name) => name !== "sync")],
  ["/extra", [...snapshot.tools, "brand_new_tool"]],
  ["/missing-allowlisted", snapshot.tools.filter((name) => name !== "archive_space")],
]);

const server = createServer((request, response) => {
  const names = routes.get(new URL(request.url, "http://127.0.0.1").pathname);
  if (!names) {
    response.writeHead(404);
    response.end("missing");
    return;
  }
  response.writeHead(200, { "content-type": "application/json" });
  response.end(JSON.stringify({ mcp: { tools: names.map((name) => ({ name })) } }));
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const base = `http://127.0.0.1:${server.address().port}`;

function run(env) {
  const childEnv = { ...process.env };
  delete childEnv.MAINMIND_SURFACE_STRICT;
  delete childEnv.MAINMIND_SURFACE_TODAY;
  delete childEnv.MAINMIND_SURFACE_EXTRA;
  delete childEnv.MAINMIND_SURFACE_URL;
  Object.assign(childEnv, env);
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [CHECK], { env: childEnv });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => { stdout += chunk; });
    child.stderr.on("data", (chunk) => { stderr += chunk; });
    const timer = setTimeout(() => { child.kill(); }, 20000);
    child.on("close", (status) => {
      clearTimeout(timer);
      resolve({ status, stdout, stderr });
    });
  });
}

function textOf(result) {
  return `${result.stdout}\n${result.stderr}`;
}

function assert(condition, result, message) {
  if (!condition) throw new Error(`${message}\nstdout: ${result.stdout}\nstderr: ${result.stderr}`);
}

const cases = [];
const test = (name, fn) => cases.push([name, fn]);
const matched = { MAINMIND_SURFACE_URL: `${base}/match` };

test("live matching the snapshot passes with no warning", async () => {
  const result = await run(matched);
  assert(result.status === 0, result, "expected exit 0");
  assert(/live matches snapshot/.test(result.stdout), result, "expected a live match");
  assert(!/WARNING|FAIL/.test(textOf(result)), result, "expected a clean pass");
});

test("a skill-named tool missing from live is a warning and still passes", async () => {
  const result = await run({ MAINMIND_SURFACE_URL: `${base}/missing-sync` });
  assert(result.status === 0, result, "drift must not fail npm run check");
  assert(/WARNING surface drift:/.test(result.stderr), result, "expected a WARNING");
  assert(/missing from live: sync/.test(result.stderr), result, "expected sync in the warning");
  assert(!/FAIL/.test(textOf(result)), result, "a warning must not be a failure");
});

test("strict mode fails when a skill-named tool disappears from live", async () => {
  const result = await run({ MAINMIND_SURFACE_URL: `${base}/missing-sync`, MAINMIND_SURFACE_STRICT: "1" });
  assert(result.status !== 0, result, "expected a strict failure");
  assert(/FAIL strict: sync named in a skill but missing from the live surface/.test(result.stderr), result, "expected sync named in the failure");
});

test("an extra live tool is a warning in strict mode too", async () => {
  const result = await run({ MAINMIND_SURFACE_URL: `${base}/extra`, MAINMIND_SURFACE_STRICT: "1" });
  assert(result.status === 0, result, "an extra live tool must not fail strict mode");
  assert(/WARNING surface drift:/.test(result.stderr), result, "expected a WARNING");
  assert(/only on live: brand_new_tool/.test(result.stderr), result, "expected the extra tool in the warning");
});

test("a tool no skill names can leave the live surface without a strict failure", async () => {
  const result = await run({ MAINMIND_SURFACE_URL: `${base}/missing-allowlisted`, MAINMIND_SURFACE_STRICT: "1" });
  assert(result.status === 0, result, "an allowlisted-only tool is not a skill-named disappearance");
  assert(/WARNING surface drift:/.test(result.stderr) && /archive_space/.test(result.stderr), result, "expected a warning naming archive_space");
});

test("strict mode fails when the live surface cannot be read", async () => {
  const result = await run({ MAINMIND_SURFACE_URL: "http://127.0.0.1:9", MAINMIND_SURFACE_STRICT: "1" });
  assert(result.status !== 0, result, "expected a strict failure");
  assert(/FAIL strict: live surface unreachable/.test(result.stderr), result, "expected an unreachable failure");
});

test("an unreachable live surface does not fail the snapshot gate", async () => {
  const result = await run({ MAINMIND_SURFACE_URL: "http://127.0.0.1:9" });
  assert(result.status === 0, result, "offline CI must pass on the snapshot");
  assert(/live surface unreachable/.test(result.stdout), result, "expected the offline note");
  assert(!/FAIL|WARNING/.test(textOf(result)), result, "offline is not drift and not a failure");
});

test("real skills pass on 2026-11-04, including continue-with-my-agent:36", async () => {
  const result = await run({ ...matched, MAINMIND_SURFACE_TODAY: "2026-11-04" });
  assert(result.status === 0, result, "dated field and goes-away mentions must pass");
  assert(!/continue-with-my-agent/.test(result.stderr), result, "line 36 must not be reported");
  assert(!/FAIL/.test(textOf(result)), result, "expected no failures");
});

test("the sync answer field and the goes-away sentence are not uses on 4 Nov", async () => {
  const dir = fixture(
    [
      "From the home `sync` returned (`agent_home`):",
      "From the home `sync` returned, in its `agent_home` field (the `agent_home`",
      "tool goes away on 3 November 2026, and `sync` replaces it):",
      "Do not call `agent_session`. It goes away on 3 November 2026.",
      "",
    ].join("\n"),
  );
  const result = await run({ ...matched, MAINMIND_SURFACE_TODAY: "2026-11-04", MAINMIND_SURFACE_EXTRA: dir });
  assert(result.status === 0, result, "those sentences are not uses");
  assert(!/retired tool/.test(textOf(result)), result, "expected no retired-tool failure");
});

test("calling agent_home still fails on 4 Nov and still passes on 3 Nov", async () => {
  const dir = fixture("Call `agent_home` to store it.\n");
  const after = await run({ ...matched, MAINMIND_SURFACE_TODAY: "2026-11-04", MAINMIND_SURFACE_EXTRA: dir });
  assert(after.status !== 0, after, "expected a retired-tool failure");
  assert(/SKILL\.md:1: retired tool `agent_home`/.test(after.stderr), after, "expected line 1");
  const on = await run({ ...matched, MAINMIND_SURFACE_TODAY: "2026-11-03", MAINMIND_SURFACE_EXTRA: dir });
  assert(on.status === 0, on, "3 November is still allowed");
});

test("the next sentence does not excuse a call, and a denial does", async () => {
  const dir = fixture("Call `boot` now.\nThere is no `boot` tool.\nCall `boot`?\nThere is no `boot` tool.\n");
  const result = await run({ ...matched, MAINMIND_SURFACE_EXTRA: dir });
  assert(result.status !== 0, result, "expected the call to fail");
  assert(/SKILL\.md:1: retired tool `boot`/.test(result.stderr), result, "expected line 1");
  assert(/SKILL\.md:3: retired tool `boot`/.test(result.stderr), result, "a question mark ends the sentence");
  assert(!/SKILL\.md:2:/.test(result.stderr), result, "the denial on line 2 is not a use");
  assert(!/SKILL\.md:4:/.test(result.stderr), result, "the denial on line 4 is not a use");
});

test("Use and bold flag underscored unknowns; single words and or-lists stay quiet", async () => {
  const dir = fixture(
    [
      "Use `not_a_tool` here.",
      "Use `parent` here.",
      "Use `strt` here.",
      "Call `strt` here.",
      "**`not_a_tool`**",
      "**`missing`**",
      "`no_home` or `no_agent_md`",
      "Call `not_a_tool` here.",
      "",
    ].join("\n"),
  );
  const result = await run({ ...matched, MAINMIND_SURFACE_EXTRA: dir });
  assert(result.status !== 0, result, "expected introduced names to fail");
  for (const line of [1, 4, 5, 8]) {
    assert(new RegExp(`SKILL\\.md:${line}:`).test(result.stderr), result, `expected a failure on line ${line}`);
  }
  for (const line of [2, 3, 6, 7]) {
    assert(!new RegExp(`SKILL\\.md:${line}:`).test(result.stderr), result, `line ${line} must stay quiet`);
  }
});

test("a bad MAINMIND_SURFACE_TODAY fails", async () => {
  const result = await run({ ...matched, MAINMIND_SURFACE_TODAY: "4 Nov 2026" });
  assert(result.status !== 0, result, "expected a date failure");
  assert(/MAINMIND_SURFACE_TODAY must be YYYY-MM-DD/.test(result.stderr), result, "expected the date message");
});

let failures = 0;
for (const [name, fn] of cases) {
  try {
    await fn();
    console.log(`PASS ${name}`);
  } catch (error) {
    failures += 1;
    console.error(`FAIL ${name}: ${error.message}`);
  }
}
server.close();
rmSync(scratch, { recursive: true, force: true });
if (failures) {
  console.error(`\n${failures} of ${cases.length} surface probe(s) failed`);
  process.exit(1);
}
console.log(`PASS ${cases.length} surface probes`);
