#!/usr/bin/env node
// Four ecosystems, four different ideas of what a plugin is, and one mount URL
// that has to be identical in every one of them. Nothing but this check stops
// them disagreeing, and a disagreement is invisible until a marketplace
// reviewer or a user's client hits it.
//
// Only files a real client reads are checked here. A file no client reads
// cannot be kept honest by a gate — it can only be kept, and look supported.
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path) => JSON.parse(readFileSync(join(root, path), "utf8"));
const text = (path) => readFileSync(join(root, path), "utf8");

const MOUNT_URL = "https://mainmind.app/mcp";
const REPOSITORY = "https://github.com/codeyogi911/mainmind-plugins";
const failures = [];
const fail = (message) => failures.push(message);

const marketplace = read(".claude-plugin/marketplace.json");
const claude = read("plugins/mainmind/.claude-plugin/plugin.json");
const agentPlugins = read("plugins/mainmind-mount/plugin.json");
const pkg = read("package.json");

// One version across everything, so "which version am I running" has one answer.
const versions = new Set([
  marketplace.metadata?.version, claude.version, agentPlugins.version, pkg.version,
]);
if (versions.size !== 1) fail(`versions disagree: ${[...versions].join(", ")}`);

// Both marketplaces require a stated licence and a reachable source. These
// fields were deliberately absent while the source was private; they are the
// reason it could not be listed.
for (const [label, manifest] of [
  ["plugins/mainmind", claude],
  ["plugins/mainmind-mount (agent-plugins)", agentPlugins],
]) {
  if (manifest.license !== "MIT") fail(`${label}: license is ${JSON.stringify(manifest.license)}, expected "MIT"`);
  if (manifest.repository !== REPOSITORY) fail(`${label}: repository is ${JSON.stringify(manifest.repository)}, expected ${REPOSITORY}`);
  if (!manifest.description?.trim()) fail(`${label}: no description`);
  if (!manifest.author?.name) fail(`${label}: no author name`);
}

// The Agent Plugins schema requires $schema and name, and carries no property
// for skills or MCP servers — the sibling mcp.json is how a server is declared.
if (!agentPlugins.$schema?.startsWith("https://agent-plugins.org/schemas/")) {
  fail("plugins/mainmind-mount: $schema must name an agent-plugins.org schema; it is required by that spec");
}

// Every JSON spelling of the same server. Change one, change them all.
// Claude Code wants "http"; the Agent Plugins schema and the plain MCP config
// that Grok and Muse take want "streamable-http". Same server either way.
const transports = [
  ["plugins/mainmind/.mcp.json", "http"],
  ["plugins/mainmind-mount/mcp.json", "streamable-http"],
  ["plugins/mainmind-grok/mcp.json", "streamable-http"],
  ["plugins/mainmind-muse/mcp.json", "streamable-http"],
];
for (const [path, expected] of transports) {
  const server = read(path).mcpServers?.mainmind;
  if (!server) { fail(`${path}: no mcpServers.mainmind entry`); continue; }
  if (server.url !== MOUNT_URL) fail(`${path}: url is ${server.url}, expected ${MOUNT_URL}`);
  if (server.type !== expected) fail(`${path}: type is ${server.type}, expected ${expected}`);
}

// Grok Build reads TOML, not a manifest. The entry has to be there and it has
// to name the same mount, or the file teaches a wrong setup by example.
const grokToml = text("plugins/mainmind-grok/config.toml");
if (!/^\[mcp_servers\.mainmind\]$/m.test(grokToml)) {
  fail("plugins/mainmind-grok/config.toml: no [mcp_servers.mainmind] table");
}
if (!new RegExp(`^url = "${MOUNT_URL}"$`, "m").test(grokToml)) {
  fail(`plugins/mainmind-grok/config.toml: no url = "${MOUNT_URL}" line`);
}

// A published surface nobody can follow is worse than one we did not publish.
// Every package carries the steps for its own host, and the skills.
for (const surface of ["mainmind-grok", "mainmind-muse"]) {
  if (!existsSync(join(root, `plugins/${surface}/README.md`))) fail(`plugins/${surface}: no README.md`);
  if (!existsSync(join(root, `plugins/${surface}/skills`))) fail(`plugins/${surface}/skills does not exist; run npm run sync`);
}
if (!existsSync(join(root, "plugins/mainmind-muse/SUBMISSION.md"))) {
  fail("plugins/mainmind-muse: no SUBMISSION.md; the directory listing is the point of that package");
}

// Neither Grok nor Muse publishes a plugin manifest format. Inventing one puts
// a file in front of users that their client will never read, which is exactly
// the failure this repository already shipped once.
for (const invented of [
  "plugins/mainmind-mount/.grok-plugin/plugin.json",
  "plugins/mainmind-grok/plugin.json",
  "plugins/mainmind-muse/plugin.json",
  "plugins/mainmind-muse/connector.json",
]) {
  if (existsSync(join(root, invented))) {
    fail(`${invented} exists: no such manifest format is published for that host — see plugins/${invented.split("/")[1]}/README.md`);
  }
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
