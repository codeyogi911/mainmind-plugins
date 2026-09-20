#!/usr/bin/env node
// Three ecosystems read three different manifests describing one mount, and
// each ecosystem spells that mount's transport differently. Nothing but this
// check stops them disagreeing, and a disagreement is invisible until a
// marketplace reviewer or a user's client hits it.
//
// Every rule below cites the spec it enforces, because the interesting failures
// here are not typos — they are keys that look right, validate nowhere, and are
// silently ignored by the client that was supposed to read them.
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path) => JSON.parse(readFileSync(join(root, path), "utf8"));

const MOUNT_URL = "https://mainmind.app/mcp";
const REPOSITORY = "https://github.com/codeyogi911/mainmind-plugins";
const AGENT_PLUGINS_SCHEMA = "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json";
const AGENT_PLUGINS_MCP_SCHEMA = "https://agent-plugins.org/schemas/1.0.0/mcp.schema.json";
const failures = [];
const fail = (message) => failures.push(message);

const marketplace = read(".claude-plugin/marketplace.json");
const claude = read("plugins/mainmind/.claude-plugin/plugin.json");
const agentPlugins = read("plugins/mainmind-mount/plugin.json");
const grok = read("plugins/mainmind-grok/.grok-plugin/plugin.json");
const pkg = read("package.json");

// One version across everything, so "which version am I running" has one
// answer. The Claude Code marketplace carries it on the PLUGIN ENTRY, not in
// `metadata`: `metadata` documents only `pluginRoot`, so a version parked there
// pins nothing and is simply ignored.
// https://code.claude.com/docs/en/plugin-marketplaces
const marketplaceEntry = (marketplace.plugins || []).find((entry) => entry.name === "mainmind");
if (!marketplaceEntry) fail(".claude-plugin/marketplace.json: no plugins[] entry named mainmind");
if (marketplace.metadata && "version" in marketplace.metadata) {
  fail(".claude-plugin/marketplace.json: metadata.version is not a documented field — move it to the plugin entry");
}
const versions = new Set([
  marketplaceEntry?.version, claude.version, agentPlugins.version, grok.version, pkg.version,
]);
if (versions.size !== 1) fail(`versions disagree: ${[...versions].join(", ")}`);

// Both marketplaces require a stated licence and a reachable source. These
// fields were deliberately absent while the source was private; they are the
// reason it could not be listed.
for (const [label, manifest] of [
  ["plugins/mainmind", claude],
  ["plugins/mainmind-mount (agent-plugins)", agentPlugins],
  ["plugins/mainmind-grok (grok)", grok],
]) {
  if (manifest.license !== "MIT") fail(`${label}: license is ${JSON.stringify(manifest.license)}, expected "MIT"`);
  if (manifest.repository !== REPOSITORY) fail(`${label}: repository is ${JSON.stringify(manifest.repository)}, expected ${REPOSITORY}`);
  if (!manifest.description?.trim()) fail(`${label}: no description`);
  if (!manifest.author?.name) fail(`${label}: no author name`);
}

// The two mount manifests describe one plugin; their user-facing text must not
// drift apart, even though their keywords may differ by marketplace vocabulary.
if (agentPlugins.name !== grok.name) fail(`mount manifests name it ${agentPlugins.name} and ${grok.name}`);
if (agentPlugins.description !== grok.description) fail("mount manifests carry different descriptions");

// The Agent Plugins manifest is validated by a published JSON Schema with
// `"required": ["$schema", "name"]` and, at the root, `additionalProperties:
// false`. So an unknown key is a hard validation failure rather than harmless
// decoration — in particular there is no `skills` or `mcpServers` key here:
// skills are discovered from `skills/<name>/SKILL.md`, and the mount lives in
// the sibling `mcp.json`. https://agent-plugins.org/specification
const AGENT_PLUGINS_KEYS = new Set([
  "$schema", "name", "version", "description", "author",
  "homepage", "repository", "license", "keywords", "extensions",
]);
if (agentPlugins.$schema !== AGENT_PLUGINS_SCHEMA) {
  fail(`plugins/mainmind-mount/plugin.json: $schema is ${JSON.stringify(agentPlugins.$schema)}, expected the 1.0.0 const ${AGENT_PLUGINS_SCHEMA}`);
}
for (const key of Object.keys(agentPlugins)) {
  if (!AGENT_PLUGINS_KEYS.has(key)) {
    fail(`plugins/mainmind-mount/plugin.json: "${key}" is not in the Agent Plugins schema, whose root is additionalProperties:false — it fails validation rather than being ignored`);
  }
}
for (const key of Object.keys(agentPlugins.author || {})) {
  if (!["name", "email", "url"].includes(key)) {
    fail(`plugins/mainmind-mount/plugin.json: author."${key}" is not in the schema's closed author object`);
  }
}

// The Grok manifest is metadata only. It declares no server, no skill and no
// command: Grok discovers those by convention from `.mcp.json` and
// `skills/<name>/SKILL.md` at the plugin root. A key that looks like a
// declaration here is silently ignored, which is worse than rejected.
// https://github.com/xai-org/plugin-marketplace/blob/main/CONTRIBUTING.md
for (const key of ["mcpServers", "mcp", "skills", "commands", "agents", "hooks"]) {
  if (key in grok) {
    fail(`plugins/mainmind-grok/.grok-plugin/plugin.json: "${key}" is metadata-only territory — Grok discovers that by convention and will ignore this key`);
  }
}

// Three spellings of one server, and they are NOT interchangeable. Claude Code
// and Grok take `"http"`; the Agent Plugins mcp schema's enum is
// `stdio | streamable-http | sse`, so `"http"` fails validation there. Change
// one, change the others — and never merge the files, whose names differ only
// by a leading dot.
const transports = [
  ["plugins/mainmind/.mcp.json", "http", null],
  ["plugins/mainmind-grok/.mcp.json", "http", null],
  ["plugins/mainmind-mount/mcp.json", "streamable-http", AGENT_PLUGINS_MCP_SCHEMA],
];
for (const [path, expected, schema] of transports) {
  const file = read(path);
  if (schema && file.$schema !== schema) {
    fail(`${path}: $schema is ${JSON.stringify(file.$schema)}, expected ${schema}`);
  }
  const server = file.mcpServers?.mainmind;
  if (!server) { fail(`${path}: no mcpServers.mainmind entry`); continue; }
  if (server.url !== MOUNT_URL) fail(`${path}: url is ${server.url}, expected ${MOUNT_URL}`);
  if (server.type !== expected) fail(`${path}: type is ${server.type}, expected ${expected}`);
}

// The Grok plugin's `.mcp.json` must sit at the plugin ROOT, beside
// `.grok-plugin/`, not inside it — Grok looks for it at the root and finds
// nothing otherwise.
if (existsSync(join(root, "plugins/mainmind-grok/.grok-plugin/.mcp.json"))) {
  fail("plugins/mainmind-grok: .mcp.json belongs at the plugin root, not inside .grok-plugin/");
}
// xAI's contributing guide requires a README beside the manifest.
if (!existsSync(join(root, "plugins/mainmind-grok/README.md"))) {
  fail("plugins/mainmind-grok: no README.md — xAI's marketplace requires one");
}

// A marketplace entry pointing at a directory with no manifest installs nothing.
for (const entry of marketplace.plugins || []) {
  const manifest = join(entry.source.replace(/^\.\//, ""), ".claude-plugin/plugin.json");
  if (!existsSync(join(root, manifest))) fail(`marketplace entry ${entry.name}: ${manifest} does not exist`);
}

// Claude Code loads a plugin's skills from this path; if it is wrong the plugin
// installs and silently teaches nothing, which is the failure this repo exists
// to stop. Every plugin must actually carry the skills directory its ecosystem
// reads, whether it names it or discovers it.
if (claude.skills !== "./skills/") fail(`plugins/mainmind: skills is ${JSON.stringify(claude.skills)}, expected "./skills/"`);
for (const path of ["plugins/mainmind/skills", "plugins/mainmind-mount/skills", "plugins/mainmind-grok/skills"]) {
  if (!existsSync(join(root, path))) fail(`${path} does not exist; run npm run sync`);
}

if (failures.length) {
  for (const failure of failures) console.error(`FAIL ${failure}`);
  process.exit(1);
}
console.log(`PASS manifests agree (version ${claude.version}, MIT, ${MOUNT_URL})`);
