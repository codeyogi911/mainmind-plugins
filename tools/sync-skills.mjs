#!/usr/bin/env node
// One canonical skill set, and every place that has to carry it.
//
// `skills/` is the source. Claude Code reads a plugin's own `skills/`
// directory, the Agent Plugins plugin reads its own, the Grok and Muse
// packages carry their own for the hosts that can use them, and Codex reads
// `.agents/skills` at the root of whatever repository it is working in — so
// the same SKILL.md has to exist in every one of those places, and nothing
// about the formats lets them share a directory.
//
// Copying is the honest answer; drift is the risk. `--check` is the gate: it
// fails when a destination disagrees with the source, so a skill edited in the
// wrong copy cannot merge.
import { readdirSync, readFileSync, writeFileSync, mkdirSync, rmSync, existsSync, statSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE = "skills";
const DESTINATIONS = [
  "plugins/mainmind/skills",
  "plugins/mainmind-mount/skills",
  "plugins/mainmind-grok/skills",
  "plugins/mainmind-muse/skills",
  ".agents/skills",
];

function walk(dir, base = dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) walk(path, base, out);
    else if (entry.isFile()) out.push(relative(base, path));
  }
  return out;
}

const sourceDir = join(root, SOURCE);
if (!existsSync(sourceDir)) {
  console.error(`${SOURCE}/ does not exist; there is nothing to sync.`);
  process.exit(1);
}
const files = walk(sourceDir).sort();
if (!files.length) {
  console.error(`${SOURCE}/ holds no files; refusing to empty every destination.`);
  process.exit(1);
}

// A skill is only loadable if its frontmatter names it. Check the source once,
// here, rather than discovering it in a client that silently ignores the file.
const problems = [];
for (const file of files) {
  if (!file.endsWith("SKILL.md")) continue;
  const text = readFileSync(join(sourceDir, file), "utf8");
  const frontmatter = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!frontmatter) { problems.push(`${SOURCE}/${file}: no frontmatter block`); continue; }
  for (const key of ["name", "description"]) {
    if (!new RegExp(`^${key}:\\s*\\S`, "m").test(frontmatter[1])) {
      problems.push(`${SOURCE}/${file}: frontmatter has no ${key}`);
    }
  }
  const named = frontmatter[1].match(/^name:\s*(.+)$/m)?.[1].trim();
  const directory = file.split("/")[0];
  if (named && named !== directory) {
    problems.push(`${SOURCE}/${file}: frontmatter name "${named}" does not match its directory "${directory}"`);
  }
}
if (problems.length) {
  for (const problem of problems) console.error(`FAIL ${problem}`);
  process.exit(1);
}

const check = process.argv.includes("--check");
let drifted = 0;

for (const destination of DESTINATIONS) {
  const target = join(root, destination);
  const existing = existsSync(target) ? walk(target).sort() : [];

  for (const file of files) {
    const from = readFileSync(join(sourceDir, file));
    const to = join(target, file);
    const current = existsSync(to) && statSync(to).isFile() ? readFileSync(to) : null;
    if (current && current.equals(from)) continue;
    if (check) {
      console.error(`DRIFT ${destination}/${file} ${current ? "differs from" : "is missing from"} ${SOURCE}/${file}`);
      drifted += 1;
      continue;
    }
    mkdirSync(dirname(to), { recursive: true });
    writeFileSync(to, from);
  }

  for (const file of existing) {
    if (files.includes(file)) continue;
    if (check) {
      console.error(`DRIFT ${destination}/${file} has no counterpart in ${SOURCE}/`);
      drifted += 1;
      continue;
    }
    rmSync(join(target, file));
  }
}

if (check) {
  if (drifted) {
    console.error(`\n${drifted} file(s) out of sync. Edit ${SOURCE}/ and run: npm run sync`);
    process.exit(1);
  }
  console.log(`PASS ${files.length} skill file(s) identical across ${DESTINATIONS.length} destinations`);
} else {
  console.log(`Synced ${files.length} skill file(s) into ${DESTINATIONS.join(", ")}`);
}
