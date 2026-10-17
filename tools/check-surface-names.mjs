#!/usr/bin/env node
// Skill backticks must name tools the live surface serves.
// https://mainmind.app/api/surface — offline, tools/surface-snapshot.json.
// A retired name fails: boot now; agent_home and agent_session after
// 3 November 2026. A sentence that says not to call it, or that it is gone,
// is not a use. A surface tool named in no skill must be on the allowlist
// with a reason.
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const SURFACE_URL = process.env.MAINMIND_SURFACE_URL || "https://mainmind.app/api/surface";
const SKILL_DIRS = ["skills", "tools/openai-skills"];
const TICK = /`([a-z][a-z0-9_]*)`/g;
const CALL = /(?:^|[\s`"'(])call\s+(?:the\s+)?$/i;
const DENIAL = /\b(no|not|never|without)\b/i;
// The day those two tools go away. "After" means the next UTC date.
const RETIRED_AFTER = "2026-11-03";

const problems = [];
const fail = (message) => problems.push(message);

function skillFiles(directory, out = []) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) skillFiles(path, out);
    else if (entry.name === "SKILL.md") out.push(path);
  }
  return out;
}

function namesFrom(body) {
  const tools = body?.mcp?.tools;
  if (!Array.isArray(tools) || tools.some((tool) => typeof tool?.name !== "string" || !tool.name)) return null;
  return new Set(tools.map((tool) => tool.name));
}

async function surfaceNames() {
  const snapshot = JSON.parse(readFileSync(join(root, "tools/surface-snapshot.json"), "utf8"));
  const snapshotNames = new Set(snapshot.tools);
  let live = null;
  let why = "";
  try {
    const response = await fetch(SURFACE_URL, { signal: AbortSignal.timeout(15000) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    live = namesFrom(await response.json());
    if (!live) throw new Error("response has no mcp.tools");
  } catch (error) {
    why = error.message;
  }
  if (!live) {
    console.log(`surface: committed snapshot ${snapshot.version} (${snapshotNames.size} tools); live unreachable (${why})`);
    return snapshotNames;
  }
  const same = live.size === snapshotNames.size && [...live].every((name) => snapshotNames.has(name));
  if (!same) fail(`surface snapshot is stale (live ${live.size} tools, snapshot ${snapshot.version} has ${snapshotNames.size}). Update tools/surface-snapshot.json.`);
  else console.log(`surface: live matches snapshot ${snapshot.version} (${live.size} tools)`);
  return live;
}

function retired(name, today) {
  if (name === "boot") return true;
  return today > RETIRED_AFTER && (name === "agent_home" || name === "agent_session");
}

function scan(files, surface, today) {
  const referenced = new Set();
  for (const file of files) {
    const text = readFileSync(file, "utf8");
    const where = relative(root, file);
    for (const match of text.matchAll(TICK)) {
      const name = match[1];
      const before = text.slice(Math.max(0, match.index - 80), match.index);
      if (surface.has(name)) referenced.add(name);
      const called = CALL.test(before.slice(-40));
      // Only the words before the name. The next sentence must not excuse it.
      if (retired(name, today) && !DENIAL.test(before)) fail(`${where}: retired tool \`${name}\``);
      else if (called && !surface.has(name) && !retired(name, today)) fail(`${where}: \`${name}\` is not a surface tool`);
    }
  }
  return referenced;
}

function allowlist(surface, referenced) {
  const entries = JSON.parse(readFileSync(join(root, "tools/skill-tool-allowlist.json"), "utf8"));
  if (!Array.isArray(entries)) return fail("skill-tool-allowlist.json must be a list");
  const allowed = new Set();
  for (const entry of entries) {
    const name = entry?.name;
    const reason = typeof entry?.reason === "string" ? entry.reason.trim() : "";
    if (typeof name !== "string" || !reason) fail("every allowlist entry needs a name and a reason");
    else if (!surface.has(name)) fail(`allowlist: ${name} is not on the surface`);
    else if (referenced.has(name)) fail(`allowlist: ${name} is already named in a skill`);
    else if (allowed.has(name)) fail(`allowlist: ${name} is listed twice`);
    else allowed.add(name);
  }
  for (const name of [...surface].sort()) {
    if (!referenced.has(name) && !allowed.has(name)) fail(`surface tool ${name} is neither in a skill nor on the allowlist`);
  }
}

const surface = await surfaceNames();
const files = SKILL_DIRS.flatMap((directory) => skillFiles(join(root, directory)));
allowlist(surface, scan(files, surface, new Date().toISOString().slice(0, 10)));
if (problems.length) {
  for (const problem of problems) console.error(`FAIL ${problem}`);
  process.exit(1);
}
console.log(`PASS surface names in ${files.length} source skills`);
