#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { basename, dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { SKILL_ROOTS, validateSkillFrontmatter } from "./skill-frontmatter.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
// Tools Mainmind removed. A call to one only gets a sentence back saying what
// to use instead, so a skill that still names one sends the agent the long way
// round. Matched in backticks. note, why and agent_home are left out: sync
// still takes a task's note and answers with agent_home, and "why" names a section.
const RETIRED_TOOLS = [
  "agent_session",
  "find_process", "read_node", "list_nodes", "explain_node", "page_history", "what_changed", "what_points_here",
  "keep_page", "deposit_record", "deposit_gap", "deposit_work_note", "deposit_lesson",
  "list_notes", "retract_note", "harvest_notes", "under_strain", "space_health",
  "move_files_to_storage", "save_source_file", "source_file_status",
];
const retired = new RegExp("`(" + RETIRED_TOOLS.join("|") + ")`", "g");
function retiredNames(text, path) {
  for (const [, name] of text.matchAll(retired)) problems.push(`${relative(root, path)}: names the removed tool ${name}`);
}
let checked = 0;
const problems = [];
function walk(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) walk(path);
    else if (entry.isFile() && entry.name === "SKILL.md") {
      checked += 1;
      retiredNames(readFileSync(path, "utf8"), path);
      for (const problem of validateSkillFrontmatter(readFileSync(path, "utf8"), basename(dirname(path)))) {
        problems.push(`${relative(root, path)}: ${problem}`);
      }
    }
  }
}
for (const path of SKILL_ROOTS) walk(join(root, path));
const agents = join(root, "plugins/mainmind/agents");
if (existsSync(agents)) for (const name of readdirSync(agents)) retiredNames(readFileSync(join(agents, name), "utf8"), join(agents, name));
if (problems.length) {
  for (const problem of problems) console.error(`FAIL ${problem}`);
  process.exit(1);
}
console.log(`PASS metadata for ${checked} shipped skills across ${SKILL_ROOTS.length} roots`);
