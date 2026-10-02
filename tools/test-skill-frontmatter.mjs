#!/usr/bin/env node
import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync, copyFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { SKILL_ROOTS, validateSkillFrontmatter } from "./skill-frontmatter.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const skill = (metadata, body = "# Harmless test\n") => `---\n${metadata}\n---\n\n${body}`;
const metadata = (description, name = "test-skill") => `name: ${name}\ndescription: ${description}`;
let cases = 0;
for (const name of ["continue-everywhere", "continue-with-my-agent"]) {
  const before = readFileSync(join(root, "tools/fixtures/skill-frontmatter", `${name}-before.md`), "utf8");
  assert.ok(validateSkillFrontmatter(before, name).some((error) => error.includes("angle bracket")), `${name} before must fail`);
  const after = readFileSync(join(root, "skills", name, "SKILL.md"), "utf8");
  assert.deepEqual(validateSkillFrontmatter(after, name), [], `${name} after must pass`);
  cases += 2;
}

for (const [label, frontmatter, expected] of [
  ["opening angle bracket", metadata('"Move <name"'), "angle bracket"],
  ["closing angle bracket", metadata('"Move name>"'), "angle bracket"],
  ["escaped bracket in YAML", metadata('"Move \\u003cname"'), "angle bracket"],
  ["custom metadata opening bracket", metadata("Valid") + '\nmetadata:\n  note: "Move <name"', "angle bracket"],
  ["nested metadata closing bracket", metadata("Valid") + '\nmetadata:\n  nested:\n    note: "Move name>"', "angle bracket"],
  ["metadata array bracket", metadata("Valid") + '\nmetadata:\n  notes: ["Move <name>"]', "angle bracket"],
  ["metadata key bracket", metadata("Valid") + '\nmetadata:\n  "<name>": Valid', "angle bracket"],
  ["YAML set metadata bracket", metadata("Valid") + '\nmetadata: !!set\n  "<name>": null', "angle bracket"],
  ["YAML ordered map metadata bracket", metadata("Valid") + '\nmetadata: !!omap\n  - "<name>": Valid', "angle bracket"],
  ["optional field bracket", metadata("Valid") + '\ncompatibility: "Use <app>"', "angle bracket"],
  ["empty description", metadata('""'), "non-empty string"],
  ["blank description", metadata('"   "'), "non-empty string"],
  ["missing description", "name: test-skill", "non-empty string"],
  ["null description", metadata("null"), "non-empty string"],
  ["number description", metadata("123"), "non-empty string"],
  ["boolean description", metadata("true"), "non-empty string"],
  ["array description", metadata("[one, two]"), "non-empty string"],
  ["mapping description", metadata("{one: two}"), "non-empty string"],
  ["long description", metadata(JSON.stringify("a".repeat(1025))), "1024 characters"],
  ["malformed YAML", metadata('"unterminated'), "invalid YAML"],
  ["duplicate key", metadata("Valid") + "\ndescription: Again", "invalid YAML"],
  ["custom tag", metadata("!!js/function 'function() {}'"), "invalid YAML"],
  ["alias expansion", "name: &name test-skill\ndescription: *name", "invalid YAML"],
  ["non-mapping YAML", "- test-skill", "YAML mapping"],
  ["empty name", metadata("Valid", '""'), "non-empty string"],
  ["non-string name", metadata("Valid", "123"), "non-empty string"],
  ["uppercase name", metadata("Valid", "Test-skill"), "lowercase"],
  ["leading hyphen", metadata("Valid", "-test-skill"), "internal hyphens"],
  ["trailing hyphen", metadata("Valid", "test-skill-"), "internal hyphens"],
  ["consecutive hyphens", metadata("Valid", "test--skill"), "internal hyphens"],
  ["XML name", metadata("Valid", "<name>"), "angle bracket"],
  ["long name", metadata("Valid", "a".repeat(65)), "64 characters"],
  ["reserved name", metadata("Valid", "claude-helper"), "reserved word"],
  ["directory mismatch", metadata("Valid", "another-name"), "does not match"],
]) {
  const errors = validateSkillFrontmatter(skill(frontmatter), "test-skill");
  assert.ok(errors.some((error) => error.includes(expected)), `${label}: ${errors.join("; ")}`);
  cases += 1;
}
assert.ok(validateSkillFrontmatter("name: test-skill\ndescription: Valid", "test-skill").includes("no frontmatter block"));
assert.ok(validateSkillFrontmatter("---\nname: test-skill\ndescription: Valid\n---junk", "test-skill").includes("no frontmatter block"));
cases += 2;

for (const frontmatter of [
  metadata("Valid description"),
  metadata('"Valid description"', '"test-skill"'),
  metadata(JSON.stringify("a".repeat(1024))),
  metadata(JSON.stringify("😀".repeat(1024))),
  metadata("Valid", "a".repeat(64)),
  "name: test-skill\ndescription: >-\n  A folded description\n  that remains valid.",
  "name: test-skill\ndescription: |\n  A literal description\n  that remains valid.",
]) {
  const name = frontmatter.startsWith(`name: ${"a".repeat(64)}\n`) ? "a".repeat(64) : "test-skill";
  assert.deepEqual(validateSkillFrontmatter(skill(frontmatter, "Keep <slug>, <name> and XML in the body.\n"), name), []);
  cases += 1;
}
assert.deepEqual(validateSkillFrontmatter(skill(metadata("Valid")).replaceAll("\n", "\r\n"), "test-skill"), []);
cases += 1;

// Exercise the real distribution gate in a disposable checkout. Invalid
// source metadata must stop copying before any destination can be created;
// valid metadata must reach every destination, with its body intact.
const sandbox = mkdtempSync(join(tmpdir(), "mainmind-frontmatter-"));
try {
  mkdirSync(join(sandbox, "tools"));
  symlinkSync(join(root, "node_modules"), join(sandbox, "node_modules"), "dir");
  for (const file of ["sync-skills.mjs", "skill-frontmatter.mjs", "openai-skill-metadata.mjs", "check-skills.mjs"]) {
    copyFileSync(join(root, "tools", file), join(sandbox, "tools", file));
  }
  const name = "continue-with-my-agent";
  const source = join(sandbox, "skills", name, "SKILL.md");
  mkdirSync(dirname(source), { recursive: true });
  writeFileSync(source, readFileSync(join(root, "tools/fixtures/skill-frontmatter", `${name}-before.md`)));
  const run = (script, ...args) => spawnSync(process.execPath, [join(sandbox, "tools", script), ...args], { encoding: "utf8" });
  const invalid = run("sync-skills.mjs");
  assert.equal(invalid.status, 1);
  assert.match(invalid.stderr, /forbidden angle bracket/);
  assert.equal(existsSync(join(sandbox, "plugins")), false, "invalid source must not be distributed");
  const valid = readFileSync(join(root, "skills", name, "SKILL.md"), "utf8");
  writeFileSync(source, valid);
  assert.equal(run("sync-skills.mjs").status, 0);
  for (const destination of SKILL_ROOTS) {
    assert.equal(readFileSync(join(sandbox, destination, name, "SKILL.md"), "utf8"), valid);
  }
  assert.equal(run("check-skills.mjs").status, 0);
  const copy = join(sandbox, "plugins/mainmind/skills", name, "SKILL.md");
  writeFileSync(copy, valid.replace(/^description:.*$/m, 'description: "invalid > metadata"'));
  assert.equal(run("check-skills.mjs").status, 1, "shipped metadata must be checked too");
  assert.equal(run("sync-skills.mjs", "--check").status, 1, "copy drift must fail");
  cases += 4;
} finally {
  rmSync(sandbox, { recursive: true, force: true });
}
console.log(`PASS ${cases} skill frontmatter cases (invalid before, valid after, safe YAML and metadata limits)`);
