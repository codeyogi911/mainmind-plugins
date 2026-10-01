#!/usr/bin/env node
// One canonical skill set, and every place that has to carry it.
//
// `skills/` is the source. Claude Code reads a plugin's own `skills/`
// directory, the Agent Plugins plugin reads its own, the Codex, Grok and Muse
// packages carry their own for the hosts that can use them, and Codex also
// reads `.agents/skills` at the root of a repository it is working in — so
// the same SKILL.md has to exist in every one of those places, and nothing
// about the formats lets them share a directory.
//
// Copying is the honest answer; drift is the risk. `--check` is the gate: it
// fails when a destination disagrees with the source, so a skill edited in the
// wrong copy cannot merge.
import { readdirSync, readFileSync, writeFileSync, mkdirSync, rmSync, rmdirSync, existsSync, statSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { SKILL_ROOTS, validateSkillFrontmatter } from "./skill-frontmatter.mjs";
import { validateOpenaiSkillMetadata } from "./openai-skill-metadata.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE = "skills";
const DESTINATIONS = SKILL_ROOTS.filter((path) => path !== SOURCE);
// OpenAI host metadata/setup lives separately from the shared workflows.
// Merge these sources only into the portable OpenAI package and repo skills.
const OPENAI_SOURCE = "tools/openai-skills";
const OPENAI_DESTINATIONS = new Set(["plugins/mainmind-codex/skills", ".agents/skills"]);

// A renamed skill leaves its old directory behind once its files are gone;
// an empty skill directory still looks like a skill to a person browsing, and
// the retired-name check in check-manifests.mjs would fail on it.
function pruneEmpty(dir, keep) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) pruneEmpty(join(dir, entry.name), false);
  }
  if (!keep && readdirSync(dir).length === 0) rmdirSync(dir);
}

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
const openaiDir = join(root, OPENAI_SOURCE);
const openaiFiles = existsSync(openaiDir) ? walk(openaiDir).sort() : [];
for (const file of openaiFiles) {
  if (files.includes(file)) {
    console.error(`FAIL ${OPENAI_SOURCE}/${file} would override a shared skill; keep one source of truth`);
    process.exit(1);
  }
}
if (!files.length) {
  console.error(`${SOURCE}/ holds no files; refusing to empty every destination.`);
  process.exit(1);
}

// A skill is only loadable if its frontmatter names it. Check the source once,
// here, rather than discovering it in a client that silently ignores the file.
const problems = [];
for (const file of openaiFiles.filter(file => file.endsWith("agents/openai.yaml"))) {
  for (const problem of validateOpenaiSkillMetadata(readFileSync(join(openaiDir, file), "utf8"))) {
    problems.push(`${OPENAI_SOURCE}/${file}: ${problem}`);
  }
}
for (const [source, paths] of [[SOURCE, files], [OPENAI_SOURCE, openaiFiles]]) for (const file of paths) {
  if (!file.endsWith("SKILL.md")) continue;
  const text = readFileSync(join(root, source, file), "utf8");
  const directory = dirname(file).split(/[\\/]/).at(-1);
  for (const problem of validateSkillFrontmatter(text, directory)) {
    problems.push(`${source}/${file}: ${problem}`);
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

  const wanted = OPENAI_DESTINATIONS.has(destination) ? [...files, ...openaiFiles] : files;
  for (const file of wanted) {
    const source = openaiFiles.includes(file) ? OPENAI_SOURCE : SOURCE;
    const from = readFileSync(join(root, source, file));
    const to = join(target, file);
    const current = existsSync(to) && statSync(to).isFile() ? readFileSync(to) : null;
    if (current && current.equals(from)) continue;
    if (check) {
      console.error(`DRIFT ${destination}/${file} ${current ? "differs from" : "is missing from"} ${source}/${file}`);
      drifted += 1;
      continue;
    }
    mkdirSync(dirname(to), { recursive: true });
    writeFileSync(to, from);
  }

  for (const file of existing) {
    if (wanted.includes(file)) continue;
    if (check) {
      console.error(`DRIFT ${destination}/${file} has no counterpart in its skill sources`);
      drifted += 1;
      continue;
    }
    rmSync(join(target, file));
  }
  if (!check && existsSync(target)) pruneEmpty(target, true);
}

if (check) {
  if (drifted) {
    console.error(`\n${drifted} file(s) out of sync. Edit ${SOURCE}/ and run: npm run sync`);
    process.exit(1);
  }
  console.log(`PASS ${files.length} shared files across ${DESTINATIONS.length} destinations; ${openaiFiles.length} OpenAI files across ${OPENAI_DESTINATIONS.size} destinations`);
} else {
  console.log(`Synced ${files.length} shared files into ${DESTINATIONS.length} destinations; ${openaiFiles.length} OpenAI files into ${OPENAI_DESTINATIONS.size} destinations`);
}
