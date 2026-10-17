#!/usr/bin/env node
// Skill backticks must name tools on the committed snapshot
// (tools/surface-snapshot.json). That file is the CI gate: a typo, a retired
// name, or an allowlist error fails `npm run check`.
//
// A difference between https://mainmind.app/api/surface and the snapshot is a
// WARNING. `npm run check` does not set a strict mode, so that warning never
// fails the check and never turns pull-request CI red when the live surface
// changes. MAINMIND_SURFACE_STRICT=1 fails when a tool a skill names is
// missing from the live surface. An extra live tool stays a warning in that
// mode too. The weekly workflow .github/workflows/surface-drift.yml runs the
// strict comparison. If the live surface cannot be read in strict mode, the
// comparison fails because it could not be made.
//
// Retired names: `boot` always; `agent_home` and `agent_session` after
// 3 November 2026 (the next UTC date, so 4 November onward). A mention is
// not a use when its sentence says not to call it (no, not, never, without),
// says it goes away on 3 November 2026, or names `agent_home` as the field
// on a `sync` answer (including `sync` returned (`agent_home`)).
//
// A backtick is a tool token when it matches [a-z][a-z0-9_]*. Call, Use,
// and markdown bold introduce a name. Call flags every unknown name. Use
// and bold flag an unknown name only when it contains an underscore.
//
// Known limits, left on purpose: a single-word typo after Use or in bold
// (`strt`) stays quiet. An "a or b" list (`no_home` or `no_agent_md`) stays
// quiet, because those names are fields.
//
// MAINMIND_SURFACE_URL overrides the live URL. MAINMIND_SURFACE_TODAY is
// YYYY-MM-DD. MAINMIND_SURFACE_EXTRA is an extra directory of SKILL.md
// files, scanned along with the source skills.
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const SURFACE_URL = process.env.MAINMIND_SURFACE_URL || "https://mainmind.app/api/surface";
const SKILL_DIRS = ["skills", "tools/openai-skills"];
const TICK = /`([a-z][a-z0-9_]*)`/g;
const CALL = /(?:^|[\s`"'(])call\s+(?:the\s+)?$/i;
const USE = /(?:^|[\s`"'(])use\s+(?:the\s+)?$/i;
const DENIAL = /\b(no|not|never|without)\b/i;
const GOES_AWAY = /goes away on 3 November 2026/;
// The day those two tools go away. "After" means the next UTC date.
const RETIRED_AFTER = "2026-11-03";

const problems = [];
const fail = (message) => problems.push(message);
const strict = process.env.MAINMIND_SURFACE_STRICT === "1";

function skillFiles(directory, out = []) {
  let entries;
  try {
    entries = readdirSync(directory, { withFileTypes: true });
  } catch (error) {
    fail(`cannot read ${directory}: ${error.message}`);
    return out;
  }
  for (const entry of entries) {
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

function loadSnapshot() {
  const snapshot = JSON.parse(readFileSync(join(root, "tools/surface-snapshot.json"), "utf8"));
  const tools = snapshot?.tools;
  if (!Array.isArray(tools) || tools.some((name) => typeof name !== "string" || !name)) {
    console.error("FAIL tools/surface-snapshot.json must list tool names");
    process.exit(1);
  }
  return { version: snapshot.version || "unknown", names: new Set(tools) };
}

async function fetchLive() {
  try {
    const response = await fetch(SURFACE_URL, { signal: AbortSignal.timeout(15000) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const live = namesFrom(await response.json());
    if (!live) throw new Error("response has no mcp.tools");
    return { live, why: "" };
  } catch (error) {
    return { live: null, why: error.message };
  }
}

function retired(name, today) {
  if (name === "boot") return true;
  return today > RETIRED_AFTER && (name === "agent_home" || name === "agent_session");
}

function clauseAround(text, index, length) {
  const before = text.slice(0, index);
  const breaks = [before.lastIndexOf("\n\n"), before.lastIndexOf("."), before.lastIndexOf("?"), before.lastIndexOf("!")];
  let start = 0;
  for (const at of breaks) {
    if (at < 0) continue;
    const next = before.slice(at, at + 2) === "\n\n" ? at + 2 : at + 1;
    if (next > start) start = next;
  }
  if (index - start > 220) start = index - 220;
  const after = text.slice(index + length);
  const cuts = [after.indexOf("\n\n"), after.indexOf("."), after.indexOf("?"), after.indexOf("!")].filter((at) => at >= 0);
  const end = Math.min(cuts.length ? Math.min(...cuts) : after.length, 220);
  return text.slice(start, index + length + end);
}

function notAUse(name, clause) {
  if (DENIAL.test(clause)) return true;
  if (GOES_AWAY.test(clause)) return true;
  if (name !== "agent_home" || !/`sync`/.test(clause)) return false;
  return /\bfield\b/.test(clause) || /`sync` returned \(`agent_home`\)/.test(clause);
}

function introduced(text, index, name) {
  const before = text.slice(Math.max(0, index - 40), index);
  if (CALL.test(before)) return true;
  const underscored = name.includes("_");
  if (USE.test(before) && underscored) return true;
  if (!underscored || index < 2) return false;
  const starsBefore = text.slice(index - 2, index) === "**";
  const starsAfter = text.slice(index + name.length + 2, index + name.length + 4) === "**";
  return starsBefore && starsAfter;
}

function lineOf(text, index) {
  return text.slice(0, index).split("\n").length;
}

function scan(files, surface, today) {
  const referenced = new Set();
  for (const file of files) {
    const text = readFileSync(file, "utf8");
    const where = relative(root, file);
    for (const match of text.matchAll(TICK)) {
      const name = match[1];
      const clause = clauseAround(text, match.index, match[0].length);
      if (surface.has(name)) referenced.add(name);
      const whereName = `${where}:${lineOf(text, match.index)}`;
      if (retired(name, today)) {
        if (!notAUse(name, clause)) fail(`${whereName}: retired tool \`${name}\``);
      } else if (!surface.has(name) && introduced(text, match.index, name)) {
        fail(`${whereName}: \`${name}\` is not a surface tool`);
      }
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

function driftText(live, snapshot) {
  const missing = [...snapshot.names].filter((name) => !live.has(name)).sort();
  const extra = [...live].filter((name) => !snapshot.names.has(name)).sort();
  if (!missing.length && !extra.length) return "";
  const parts = [`live has ${live.size} tools, snapshot ${snapshot.version} has ${snapshot.names.size}`];
  if (missing.length) parts.push(`missing from live: ${missing.join(", ")}`);
  if (extra.length) parts.push(`only on live: ${extra.join(", ")}`);
  return parts.join("; ");
}

function reportLive(live, why, snapshot, referenced) {
  if (!live) {
    const message = `live surface unreachable (${why})`;
    if (strict) fail(`strict: ${message}`);
    else console.log(`surface: committed snapshot ${snapshot.version} (${snapshot.names.size} tools); ${message}`);
    return;
  }
  const drift = driftText(live, snapshot);
  if (!drift) {
    console.log(`surface: live matches snapshot ${snapshot.version} (${live.size} tools)`);
    return;
  }
  const namedGone = [...referenced].filter((name) => !live.has(name)).sort();
  if (strict && namedGone.length) {
    fail(`strict: ${namedGone.join(", ")} named in a skill but missing from the live surface (${drift})`);
    return;
  }
  console.warn(`WARNING surface drift: ${drift}`);
}

const today = process.env.MAINMIND_SURFACE_TODAY || new Date().toISOString().slice(0, 10);
if (!/^\d{4}-\d{2}-\d{2}$/.test(today)) {
  console.error(`FAIL MAINMIND_SURFACE_TODAY must be YYYY-MM-DD, got ${process.env.MAINMIND_SURFACE_TODAY}`);
  process.exit(1);
}

const snapshot = loadSnapshot();
const { live, why } = await fetchLive();
const files = SKILL_DIRS.flatMap((directory) => skillFiles(join(root, directory)));
if (process.env.MAINMIND_SURFACE_EXTRA) files.push(...skillFiles(process.env.MAINMIND_SURFACE_EXTRA));
const referenced = scan(files, snapshot.names, today);
allowlist(snapshot.names, referenced);
reportLive(live, why, snapshot, referenced);

if (problems.length) {
  for (const problem of problems) console.error(`FAIL ${problem}`);
  process.exit(1);
}
console.log(`PASS surface names in ${files.length} source skills`);
