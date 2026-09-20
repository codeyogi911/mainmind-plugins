#!/usr/bin/env node
// Four ecosystems, four different ideas of what a plugin is, and one mount URL
// that has to be identical in every one of them. Nothing but this check stops
// them disagreeing, and a disagreement is invisible until a marketplace
// reviewer or a user's client hits it.
//
// Only files a real client reads are checked here. A file no client reads
// cannot be kept honest by a gate — it can only be kept, and look supported.
// Which files those are is decided from each vendor's own published guide and
// from plugins they already ship, not from what looks consistent across our
// own directories; the two disagree more often than not.
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
// Read defensively: if this file is missing, the required-files check below is
// what should say so, not a Node stack trace from this line.
const GROK_MANIFEST = "plugins/mainmind-grok/.grok-plugin/plugin.json";
const grok = existsSync(join(root, GROK_MANIFEST)) ? read(GROK_MANIFEST) : null;
const pkg = read("package.json");

// One version across everything, so "which version am I running" has one
// answer. Claude Code carries it on the PLUGIN ENTRY: `metadata` documents only
// `pluginRoot`, so a version parked there pins nothing and is ignored.
// https://code.claude.com/docs/en/plugin-marketplaces
const marketplaceEntry = (marketplace.plugins || []).find((entry) => entry.name === "mainmind");
if (!marketplaceEntry) fail(".claude-plugin/marketplace.json: no plugins[] entry named mainmind");
if (marketplace.metadata && "version" in marketplace.metadata) {
  fail(".claude-plugin/marketplace.json: metadata.version pins nothing — it belongs on the plugin entry");
}
const versions = new Set([
  marketplaceEntry?.version, claude.version, agentPlugins.version, pkg.version,
  ...(grok ? [grok.version] : []),
]);
if (versions.size !== 1) fail(`versions disagree: ${[...versions].join(", ")}`);

// Both marketplaces require a stated licence and a reachable source. These
// fields were deliberately absent while the source was private; they are the
// reason it could not be listed.
for (const [label, manifest] of [
  ["plugins/mainmind", claude],
  ["plugins/mainmind-mount (agent-plugins)", agentPlugins],
  ...(grok ? [["plugins/mainmind-grok (grok)", grok]] : []),
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

// Every JSON spelling of the same server, and they are NOT interchangeable.
// The Agent Plugins mcp schema enumerates `stdio | streamable-http | sse` and
// rejects "http" outright. Claude Code takes "http", and so does the `.mcp.json`
// Grok reads at a plugin root — that keyword is not stated on any xAI page, so
// it follows the plugin xAI already ships in its own catalogue
// (getsentry/plugin-grok). Note the filenames: Grok's carries a leading dot and
// the Agent Plugins one does not, which is exactly why they are separate
// directories rather than one.
const transports = [
  ["plugins/mainmind/.mcp.json", "http"],
  ["plugins/mainmind-mount/mcp.json", "streamable-http"],
  ["plugins/mainmind-grok/.mcp.json", "http"],
];
for (const [path, expected] of transports) {
  const server = read(path).mcpServers?.mainmind;
  if (!server) { fail(`${path}: no mcpServers.mainmind entry`); continue; }
  if (server.url !== MOUNT_URL) fail(`${path}: url is ${server.url}, expected ${MOUNT_URL}`);
  if (server.type !== expected) fail(`${path}: type is ${server.type}, expected ${expected}`);
}

// Grok Build reads TOML, not a manifest. The entry has to be there and it has
// to name the same mount, or the file teaches a wrong setup by example.
// Read the table, not the file: a `url` line anywhere in a TOML document
// satisfies a whole-file match while belonging to some other server.
const grokToml = text("plugins/mainmind-grok/config.toml");
const grokTable = grokToml.split(/^\[/m).find((block) => block.startsWith("mcp_servers.mainmind]"));
if (!grokTable) {
  fail("plugins/mainmind-grok/config.toml: no [mcp_servers.mainmind] table");
} else if (!grokTable.split("\n").slice(1).some((line) => line.trim() === `url = "${MOUNT_URL}"`)) {
  fail(`plugins/mainmind-grok/config.toml: [mcp_servers.mainmind] has no url = "${MOUNT_URL}" line`);
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

// Grok's manifest is metadata only: it declares no server, no skill and no
// command, because Grok discovers those by convention from `.mcp.json` and
// `skills/<name>/SKILL.md` at the plugin root. A declaration key here is
// silently ignored, which is worse than rejected.
// https://github.com/xai-org/plugin-marketplace/blob/main/CONTRIBUTING.md
for (const key of ["mcpServers", "mcp", "skills", "commands", "agents", "hooks"]) {
  if (grok && key in grok) {
    fail(`plugins/mainmind-grok/.grok-plugin/plugin.json: "${key}" is ignored — Grok discovers that by convention, it is not declared`);
  }
}

// Manifest formats no host publishes. A file like this puts a route in front of
// users that their client never reads, which is a failure this repository has
// shipped in both directions now: once by inventing a manifest, once by
// deleting a real one on the belief that it was invented.
for (const invented of [
  "plugins/mainmind-mount/.grok-plugin/plugin.json",
  "plugins/mainmind-grok/plugin.json",
  "plugins/mainmind-grok/mcp.json",
  "plugins/mainmind-muse/plugin.json",
  "plugins/mainmind-muse/connector.json",
  "plugins/mainmind-muse/mcp.json",
]) {
  if (existsSync(join(root, invented))) {
    fail(`${invented} exists: no client reads that path — see the Layout section of README.md`);
  }
}

// The other half of the one-dot trap: the file can be named right and filed
// wrong. Grok reads `.mcp.json` at the plugin root, not inside `.grok-plugin/`,
// which holds the catalogue file.
if (existsSync(join(root, "plugins/mainmind-grok/.grok-plugin/.mcp.json"))) {
  fail("plugins/mainmind-grok/.grok-plugin/.mcp.json exists: .mcp.json belongs at the plugin root — .grok-plugin/ holds the catalogue file");
}

// xAI's contributing guide states the two files a local plugin must carry.
for (const required of [
  "plugins/mainmind-grok/.grok-plugin/plugin.json",
  "plugins/mainmind-grok/README.md",
]) {
  if (!existsSync(join(root, required))) {
    fail(`${required} is missing: xAI's marketplace requires a README.md and a valid .grok-plugin/plugin.json`);
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
