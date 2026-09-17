#!/usr/bin/env node
// Three ecosystems read three different manifests describing one plugin, and
// two more files describe one MCP server in two transport spellings. Nothing
// but this check stops them disagreeing, and a disagreement is invisible until
// a marketplace reviewer or a user's client hits it.
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path) => JSON.parse(readFileSync(join(root, path), "utf8"));

const MOUNT_URL = "https://mainmind.app/mcp";
const REPOSITORY = "https://github.com/codeyogi911/mainmind-plugins";
const failures = [];
const fail = (message) => failures.push(message);

const marketplace = read(".claude-plugin/marketplace.json");
const claude = read("plugins/mainmind/.claude-plugin/plugin.json");
const agentPlugins = read("plugins/mainmind-mount/plugin.json");
const grok = read("plugins/mainmind-mount/.grok-plugin/plugin.json");
const pkg = read("package.json");

// One version across everything, so "which version am I running" has one answer.
const versions = new Set([
  marketplace.metadata?.version, claude.version, agentPlugins.version, grok.version, pkg.version,
]);
if (versions.size !== 1) fail(`versions disagree: ${[...versions].join(", ")}`);

// Both marketplaces require a stated licence and a reachable source. These
// fields were deliberately absent while the source was private; they are the
// reason it could not be listed.
for (const [label, manifest] of [
  ["plugins/mainmind", claude],
  ["plugins/mainmind-mount (agent-plugins)", agentPlugins],
  ["plugins/mainmind-mount (grok)", grok],
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

// Two transport spellings of the same server. Change one, change the other.
const transports = [
  ["plugins/mainmind/.mcp.json", "http"],
  ["plugins/mainmind-mount/.mcp.json", "http"],
  ["plugins/mainmind-mount/mcp.json", "streamable-http"],
];
for (const [path, expected] of transports) {
  const server = read(path).mcpServers?.mainmind;
  if (!server) { fail(`${path}: no mcpServers.mainmind entry`); continue; }
  if (server.url !== MOUNT_URL) fail(`${path}: url is ${server.url}, expected ${MOUNT_URL}`);
  if (server.type !== expected) fail(`${path}: type is ${server.type}, expected ${expected}`);
}

// A marketplace entry pointing at a directory with no manifest installs nothing.
for (const entry of marketplace.plugins || []) {
  const manifest = join(entry.source.replace(/^\.\//, ""), ".claude-plugin/plugin.json");
  if (!existsSync(join(root, manifest))) fail(`marketplace entry ${entry.name}: ${manifest} does not exist`);
}

// Claude Code loads a plugin's skills from this path; if it is wrong the plugin
// installs and silently teaches nothing, which is the failure this repo exists
// to stop.
if (claude.skills !== "./skills/") fail(`plugins/mainmind: skills is ${JSON.stringify(claude.skills)}, expected "./skills/"`);
if (!existsSync(join(root, "plugins/mainmind/skills"))) fail("plugins/mainmind/skills does not exist; run npm run sync");

if (failures.length) {
  for (const failure of failures) console.error(`FAIL ${failure}`);
  process.exit(1);
}
console.log(`PASS manifests agree (version ${claude.version}, MIT, ${MOUNT_URL})`);
