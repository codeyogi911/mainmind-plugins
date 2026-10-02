#!/usr/bin/env node
// Public OpenAI package requirements. This is a source/distribution gate,
// not proof of directory approval, connection, skill activation or host UI.
// https://developers.openai.com/plugins/deploy/submission
// https://developers.openai.com/plugins/deploy/submission-errors
// https://developers.openai.com/plugins/build/skills
import { readFileSync, readdirSync, existsSync, lstatSync } from "node:fs";
import { dirname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { validateOpenaiSkillMetadata } from "./openai-skill-metadata.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const packageRoot = join(root, "plugins/mainmind-codex");
const failures = [];
const fail = message => failures.push(message);
const json = path => JSON.parse(readFileSync(path, "utf8"));
const object = value => value && Object.getPrototypeOf(value) === Object.prototype;
const string = value => typeof value === "string" && value.trim().length > 0;
const bounded = (value, limit, label) => {
  if (!string(value) || [...value].length > limit) fail(`${label}: expected nonempty text within ${limit} characters`);
};
function https(value, limit, label) {
  if (!string(value) || value.length > limit) { fail(`${label}: expected HTTPS URL within ${limit} characters`); return; }
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || !url.hostname) fail(`${label}: must use HTTPS`);
    if (url.username || url.password) fail(`${label}: must not contain credentials`);
  } catch { fail(`${label}: invalid HTTPS URL`); }
}
function includedSkill(path, label) {
  if (typeof path !== "string" || !/^\.\/skills\/[a-z0-9]+(?:-[a-z0-9]+)*\/SKILL\.md$/.test(path)) {
    fail(`${label}: expected ./-relative included skill path`); return;
  }
  const target = resolve(packageRoot, path);
  if (!target.startsWith(packageRoot + sep) || !existsSync(target) || !lstatSync(target).isFile()) {
    fail(`${label}: must refer to an included skill`);
  }
}

const manifest = json(join(packageRoot, "plugin.json"));
bounded(manifest.description, 4000, "description");
bounded(manifest.author?.name, 120, "author.name");
if (manifest.author?.email !== undefined) bounded(manifest.author.email, 320, "author.email");
if (manifest.author?.url !== undefined) https(manifest.author.url, 2048, "author.url");
if (manifest.homepage !== undefined) https(manifest.homepage, 2048, "homepage");
const extension = manifest.extensions?.["com.openai"];
if (!object(extension)) fail("extensions.com.openai: expected object");
const ui = extension?.interface || {};
for (const [key, limit] of [["displayName", 30], ["shortDescription", 30], ["longDescription", 4000], ["developerName", 80]]) {
  bounded(ui[key], limit, `interface.${key}`);
}
for (const key of ["websiteURL", "supportURL", "privacyPolicyURL", "termsOfServiceURL"]) https(ui[key], 1024, `interface.${key}`);
if (!Array.isArray(ui.capabilities) || ui.capabilities.length > 20) fail("interface.capabilities: expected an array with at most 20 entries");
else ui.capabilities.forEach(value => bounded(value, 120, "interface.capabilities entry"));
if (ui.defaultPrompt !== undefined) {
  const prompts = Array.isArray(ui.defaultPrompt) ? ui.defaultPrompt : [ui.defaultPrompt];
  if (!prompts.length || prompts.length > 3) fail("interface.defaultPrompt: expected one to three prompts");
  if (new Set(prompts).size !== prompts.length) fail("interface.defaultPrompt: prompts must be unique");
  for (const prompt of prompts) {
    bounded(prompt, 128, "interface.defaultPrompt entry");
    if (typeof prompt === "string" && /@/.test(prompt)) fail("interface.defaultPrompt: omit app @mentions");
  }
}
// The native local hook capability is separate from today's public ZIP path.
for (const overlay of [manifest, extension || {}]) {
  if ("hooks" in overlay) fail("public package: lifecycle hooks cannot currently be submitted");
  if ("apps" in overlay) fail("public package: app references cannot currently be submitted");
  for (const key of ["skills", "mcpServers"]) if (key in overlay) fail(`portable package: ${key} declarations cannot change auto-discovery; use canonical root paths`);
}
for (const path of [".app.json", "hooks", ".codex-plugin"]) if (existsSync(join(packageRoot, path))) fail(`public package: unsupported ${path}`);
includedSkill(extension?.onboardingSkill, "onboardingSkill");
if (extension?.onboardingSkill !== "./skills/mainmind-setup/SKILL.md") fail("onboardingSkill: use the bounded Mainmind setup skill");
if (extension?.review) {
  for (const key of ["test_credentials", "reviewer_instructions"]) if (key in extension.review) fail("review: credentials and reviewer instructions belong in the secure dashboard");
  const cases = extension.review.test_cases;
  for (const [kind, count] of [["positive", 5], ["negative", 3]]) {
    if (!Array.isArray(cases?.[kind]) || cases[kind].length !== count) { fail(`review: expected ${count} ${kind} cases`); continue; }
    for (const test of cases[kind]) {
      if (!object(test)) { fail("review: each test case must be an object"); continue; }
      for (const field of ["description", "prompt", "tools_triggered", "expected_behavior"]) if (!string(test[field])) fail(`review: test case ${field} must be nonempty text`);
    }
  }
}
const marketplace = json(join(root, ".agents/plugins/marketplace.json"));
const entry = marketplace.plugins?.find(p => p.name === "mainmind");
if (entry?.policy?.installation !== "AVAILABLE" || entry?.policy?.authentication !== "ON_INSTALL") fail("marketplace: preserve available installation and on-install authentication policy");

const canonicalNames = readdirSync(join(root, "skills"), { withFileTypes: true }).filter(e => e.isDirectory()).map(e => e.name);
const openaiNames = [...canonicalNames, "mainmind-setup"].sort();
for (const destination of ["plugins/mainmind-codex/skills", ".agents/skills"]) {
  const dir = join(root, destination);
  const names = readdirSync(dir, { withFileTypes: true }).filter(e => e.isDirectory()).map(e => e.name).sort();
  if (JSON.stringify(names) !== JSON.stringify(openaiNames)) fail(`${destination}: expected shared skills plus OpenAI setup`);
  for (const name of names) {
    const path = join(dir, name, "agents/openai.yaml");
    const label = `${destination}/${name}/agents/openai.yaml`;
    if (!existsSync(path) || !lstatSync(path).isFile()) { fail(`${label}: missing regular file`); continue; }
    validateOpenaiSkillMetadata(readFileSync(path, "utf8")).forEach(problem => fail(`${label}: ${problem}`));
  }
}
if (failures.length) {
  failures.forEach(message => console.error(`FAIL ${message}`)); process.exit(1);
}
console.log(`PASS OpenAI public package contract and ${openaiNames.length} skills on both OpenAI surfaces (host acceptance remains separate)`);
