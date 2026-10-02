#!/usr/bin/env node
// Requirements are literal expectations from the OpenAI skill/package guides,
// exercised through the same command interfaces used by CI and distribution.
import assert from "node:assert/strict";
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync, existsSync, symlinkSync } from "node:fs";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const packageRoot = "plugins/mainmind-codex";
const manifest = JSON.parse(readFileSync(join(root, packageRoot, "plugin.json")));
assert.equal(manifest.extensions["com.openai"].onboardingSkill, "./skills/mainmind-setup/SKILL.md");
const box = mkdtempSync(join(tmpdir(), "mainmind-openai-package-"));
let cases = 0;
try {
  for (const path of ["tools", "skills", "plugins", ".agents"]) cpSync(join(root, path), join(box, path), { recursive: true });
  symlinkSync(join(root, "node_modules"), join(box, "node_modules"), "dir");
  const run = (script, ...args) => spawnSync(process.execPath, [join(box, "tools", script), ...args], { encoding: "utf8" });
  const check = () => run("check-openai-package.mjs");
  assert.equal(check().status, 0, "the real package must pass"); cases++;
  const path = join(box, packageRoot, "plugin.json");
  const original = readFileSync(path, "utf8");
  for (const [label, mutate, error] of [
    ["unsafe public URL", p => { p.extensions["com.openai"].interface.supportURL = "http://example.com"; }, /HTTPS/],
    ["credentials in URL", p => { p.extensions["com.openai"].interface.websiteURL = "https://private:secret@example.com"; }, /credentials/],
    ["directory subtitle limit", p => { p.extensions["com.openai"].interface.shortDescription = "a".repeat(31); }, /30/],
    ["too many prompts", p => { p.extensions["com.openai"].interface.defaultPrompt = ["a", "b", "c", "d"]; }, /three/],
    ["duplicate prompts", p => { p.extensions["com.openai"].interface.defaultPrompt = ["a", "a"]; }, /unique/],
    ["missing setup", p => { p.extensions["com.openai"].onboardingSkill = "./skills/missing/SKILL.md"; }, /included skill/],
    ["escaping setup path", p => { p.extensions["com.openai"].onboardingSkill = "../skills/mainmind-setup/SKILL.md"; }, /relative/],
    ["public hook overlay", p => { p.extensions["com.openai"].hooks = "./hooks/hooks.json"; }, /hooks/],
    ["public app references", p => { p.extensions["com.openai"].apps = "./.app.json"; }, /app references/],
    ["too many capabilities", p => { p.extensions["com.openai"].interface.capabilities = Array(21).fill("read"); }, /20/],
    ["review secrets", p => { p.extensions["com.openai"].review = { test_credentials: "do not ship" }; }, /credentials/],
    ["incomplete review cases", p => { p.extensions["com.openai"].review.test_cases.positive.pop(); }, /5 positive/],
  ]) {
    const p = JSON.parse(original); mutate(p); writeFileSync(path, JSON.stringify(p));
    const result = check(); assert.equal(result.status, 1, label); assert.match(result.stderr, error, label); cases++;
  }
  writeFileSync(path, original);
  const yaml = join(box, packageRoot, "skills/mainmind-setup/agents/openai.yaml");
  const yamlOriginal = readFileSync(yaml, "utf8");
  for (const [value, error] of [
    ["interface: [invalid]\n", /interface/],
    [yamlOriginal.replace("streamable_http", "http"), /transport/],
    [yamlOriginal + "\ninterface: {}\n", /YAML/],
    [yamlOriginal.replace("https://mainmind.app/mcp", "https://other.example/mcp"), /dependency/],
    [yamlOriginal.replace('products: [CHAT, CODEX]', 'products: [OTHER]'), /policy/],
    [yamlOriginal.replace(/default_prompt:.*\n/, 'default_prompt: []\n'), /default_prompt/],
  ]) {
    writeFileSync(yaml, value); const result = check(); assert.equal(result.status, 1); assert.match(result.stderr, error); cases++;
  }
  writeFileSync(yaml, yamlOriginal);
  assert.equal(run("sync-skills.mjs", "--check").status, 0); cases++;
  writeFileSync(yaml, yamlOriginal.replace("Check your Mainmind connection", "Changed metadata"));
  assert.equal(run("sync-skills.mjs", "--check").status, 1, "generated OpenAI metadata drift must fail"); cases++;
  assert.equal(run("sync-skills.mjs").status, 0);
  assert.equal(readFileSync(yaml, "utf8"), yamlOriginal); cases++;
  for (const dest of ["plugins/mainmind/skills", "plugins/mainmind-grok/skills", "plugins/mainmind-mount/skills", "plugins/mainmind-muse/skills"]) {
    assert.equal(existsSync(join(box, dest, "mainmind-setup")), false, "OpenAI setup must stay scoped");
    assert.equal(existsSync(join(box, dest, "sync/agents/openai.yaml")), false, "OpenAI metadata must stay scoped");
  } cases++;
  const shared = join(box, "skills/sync/SKILL.md");
  assert.equal(readFileSync(shared, "utf8"), readFileSync(join(box, packageRoot, "skills/sync/SKILL.md"), "utf8")); cases++;
  assert.equal(check().status, 0); cases++;
  const overlay = join(box, "tools/openai-skills/mainmind-setup/agents/openai.yaml");
  writeFileSync(overlay, "interface: [invalid]\n");
  assert.equal(run("sync-skills.mjs").status, 1, "invalid source metadata must stop distribution");
  assert.equal(readFileSync(yaml, "utf8"), yamlOriginal, "invalid source must not replace the valid copy"); cases++;
  writeFileSync(overlay, yamlOriginal);
  const collision = join(box, "tools/openai-skills/mainmind-setup/SKILL.md");
  // A new shared file with this name would collide with the host-only source.
  cpSync(dirname(collision), join(box, "skills/mainmind-setup"), { recursive: true });
  const collided = run("sync-skills.mjs");
  assert.equal(collided.status, 1); assert.match(collided.stderr, /override a shared skill/); cases++;
} finally { rmSync(box, { recursive: true, force: true }); }
console.log(`PASS ${cases} OpenAI package cases (public contract, skill dependencies and scoped generation)`);
