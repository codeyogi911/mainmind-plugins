#!/usr/bin/env node
import { readdirSync, readFileSync } from "node:fs";
import { basename, dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { SKILL_ROOTS, validateSkillFrontmatter } from "./skill-frontmatter.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
let checked = 0;
const problems = [];
function walk(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) walk(path);
    else if (entry.isFile() && entry.name === "SKILL.md") {
      checked += 1;
      for (const problem of validateSkillFrontmatter(readFileSync(path, "utf8"), basename(dirname(path)))) {
        problems.push(`${relative(root, path)}: ${problem}`);
      }
    }
  }
}
for (const path of SKILL_ROOTS) walk(join(root, path));
if (problems.length) {
  for (const problem of problems) console.error(`FAIL ${problem}`);
  process.exit(1);
}
console.log(`PASS metadata for ${checked} shipped skills across ${SKILL_ROOTS.length} roots`);
