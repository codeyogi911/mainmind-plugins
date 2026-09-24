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
import { readFileSync, existsSync, readdirSync } from "node:fs";
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
// Cursor lists a plugin from its own marketplace file, and its template's
// validator requires each listed directory to carry `.cursor-plugin/plugin.json`
// whose name matches the entry. https://github.com/cursor/plugin-template
const CURSOR_MARKETPLACE = ".cursor-plugin/marketplace.json";
const CURSOR_MANIFEST = "plugins/mainmind-mount/.cursor-plugin/plugin.json";
const cursorMarketplace = existsSync(join(root, CURSOR_MARKETPLACE)) ? read(CURSOR_MARKETPLACE) : null;
const cursor = existsSync(join(root, CURSOR_MANIFEST)) ? read(CURSOR_MANIFEST) : null;

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
  ...(grok ? [grok.version] : []), ...(cursor ? [cursor.version] : []),
]);
if (versions.size !== 1) fail(`versions disagree: ${[...versions].join(", ")}`);

// Both marketplaces require a stated licence and a reachable source. These
// fields were deliberately absent while the source was private; they are the
// reason it could not be listed.
for (const [label, manifest] of [
  ["plugins/mainmind", claude],
  ["plugins/mainmind-mount (agent-plugins)", agentPlugins],
  ...(grok ? [["plugins/mainmind-grok (grok)", grok]] : []),
  ...(cursor ? [["plugins/mainmind-mount (cursor)", cursor]] : []),
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

// Cursor, and Cursor's Grok Bot, find Mainmind through this file: an admin's
// Import from Repo reads it, and so does a Cursor Marketplace submission.
if (!cursorMarketplace) fail(`${CURSOR_MARKETPLACE} is missing: Cursor cannot import this repository without it`);
if (!cursor) fail(`${CURSOR_MANIFEST} is missing: Cursor lists only a plugin directory that carries it`);
if (cursorMarketplace) {
  if (!/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(cursorMarketplace.name || "")) fail(`${CURSOR_MARKETPLACE}: name must be lowercase kebab-case`);
  if (!cursorMarketplace.owner?.name) fail(`${CURSOR_MARKETPLACE}: owner.name is required`);
  const entries = cursorMarketplace.plugins || [];
  if (entries.length !== 1 || entries[0].source !== "./plugins/mainmind-mount") {
    fail(`${CURSOR_MARKETPLACE}: expected one entry with source ./plugins/mainmind-mount`);
  }
  for (const entry of entries) {
    const manifest = join(String(entry.source).replace(/^\.\//, ""), ".cursor-plugin/plugin.json");
    if (!existsSync(join(root, manifest))) { fail(`cursor marketplace entry ${entry.name}: ${manifest} does not exist`); continue; }
    const listed = read(manifest);
    if (listed.name !== entry.name) fail(`cursor marketplace entry ${entry.name}: ${manifest} is named ${JSON.stringify(listed.name)}`);
  }
}
if (cursor?.logo && !existsSync(join(root, "plugins/mainmind-mount", cursor.logo))) {
  fail(`${CURSOR_MANIFEST}: logo ${cursor.logo} does not exist`);
}
if (!existsSync(join(root, "plugins/mainmind-mount/skills"))) fail("plugins/mainmind-mount/skills does not exist; run npm run sync");

// Claude Code loads a plugin's skills from this path; if it is wrong the plugin
// installs and silently teaches nothing, which is the failure this repo exists
// to stop.
if (claude.skills !== "./skills/") fail(`plugins/mainmind: skills is ${JSON.stringify(claude.skills)}, expected "./skills/"`);
if (!existsSync(join(root, "plugins/mainmind/skills"))) fail("plugins/mainmind/skills does not exist; run npm run sync");

// The hooks that keep an agent synced when the model forgets to: a Stop hook
// that asks the model to sync before it stops, a SessionStart hook that names
// the agent a folder last ran as, and a PostToolUse hook that follows this
// app's task list so the Stop hook can ask for it as `tasks`. Claude Code discovers
// `hooks/hooks.json` at the plugin root by convention; naming that same file
// again in plugin.json's `hooks` field would register it twice.
// https://code.claude.com/docs/en/plugins-reference#hooks
const HOOKS = "plugins/mainmind/hooks/hooks.json";
const HOOK_SCRIPTS = {
  Stop: "keep-up-to-date.mjs",
  SessionStart: "last-agent-here.mjs",
  PostToolUse: "note-tasks.mjs",
};
// Every tool Claude Code keeps its task list with; a missing one means those
// tasks never reach the agent.
const TASK_TOOLS = ["TodoWrite", "TaskCreate", "TaskUpdate"];
if ("hooks" in claude) fail(`plugins/mainmind: plugin.json declares "hooks"; ${HOOKS} is discovered by convention and would load twice`);
for (const script of [...Object.values(HOOK_SCRIPTS), "state.mjs"]) {
  if (!existsSync(join(root, "plugins/mainmind/hooks", script))) fail(`plugins/mainmind/hooks/${script} is missing`);
}
if (!existsSync(join(root, HOOKS))) {
  fail(`${HOOKS} is missing: without it an agent in Claude Code is only kept synced when the model remembers`);
} else {
  const hooks = read(HOOKS).hooks || {};
  for (const [event, script] of Object.entries(HOOK_SCRIPTS)) {
    const commands = (hooks[event] || []).flatMap((group) => group.hooks || []);
    const command = commands.find((hook) => hook.type === "command" && hook.command?.includes(`\${CLAUDE_PLUGIN_ROOT}/hooks/${script}`));
    if (!command) { fail(`${HOOKS}: no ${event} command running \${CLAUDE_PLUGIN_ROOT}/hooks/${script}`); continue; }
    // A host without node must start and stop sessions as if no hook existed.
    if (!command.command.startsWith("command -v node >/dev/null 2>&1 || exit 0;")) {
      fail(`${HOOKS}: the ${event} command does not exit 0 when node is missing`);
    }
  }
  const start = (hooks.SessionStart || []).flatMap((group) => group.hooks || []);
  if (start.some((hook) => !(hook.timeout <= 10))) fail(`${HOOKS}: a SessionStart hook must time out within 10 seconds; it runs before the person can type`);
  // The task hook runs after every task-list change, so it is quick and silent.
  const taskGroup = (hooks.PostToolUse || []).find((group) =>
    (group.hooks || []).some((hook) => hook.command?.includes(`\${CLAUDE_PLUGIN_ROOT}/hooks/${HOOK_SCRIPTS.PostToolUse}`)));
  if (taskGroup) {
    const matched = String(taskGroup.matcher || "").split("|");
    for (const tool of TASK_TOOLS) if (!matched.includes(tool)) fail(`${HOOKS}: the PostToolUse matcher does not name ${tool}`);
    for (const hook of taskGroup.hooks || []) {
      if (!(hook.timeout <= 10)) fail(`${HOOKS}: the PostToolUse task hook must time out within 10 seconds`);
      if (!/>\/dev\/null 2>&1 \|\| true$/.test(hook.command || "")) fail(`${HOOKS}: the PostToolUse task hook must print nothing and never fail`);
    }
  }
}

// The agent skills were renamed to the words people say. A stale copy under an
// old name would load beside the new one and teach the old words.
for (const retired of ["save-my-agent", "bring-back-my-agent", "move-my-agent-in", "keep-my-agent-up-to-date"]) {
  for (const base of ["skills", ".agents/skills", "plugins/mainmind/skills", "plugins/mainmind-mount/skills",
    "plugins/mainmind-grok/skills", "plugins/mainmind-muse/skills"]) {
    if (existsSync(join(root, base, retired))) fail(`${base}/${retired} exists: that skill was renamed`);
  }
}

// Keeping an agent up to date is the agent's job. Nothing people read may tell
// them to ask for it.
const peopleRead = ["README.md", "plugins/mainmind-grok/README.md", "plugins/mainmind-muse/README.md",
  "plugins/mainmind-muse/SUBMISSION.md",
  ...readdirSync(join(root, "skills")).map((name) => `skills/${name}/SKILL.md`)];
for (const path of peopleRead) {
  // "say" then a quoted save or bring-back phrase, in any quote style; "Never
  // say" is the rule itself, and "says" is a trigger the skill listens for.
  if (existsSync(join(root, path)) && /(?<!never\s)\bsay\s+\\?["“'‘](?:save|bring)\b/i.test(text(path))) {
    fail(`${path} tells people to say save or bring back; the agent syncs itself`);
  }
  // Sync is the one word now; a page naming the old skill teaches the old one.
  if (existsSync(join(root, path)) && text(path).includes("keep-my-agent-up-to-date")) {
    fail(`${path} names keep-my-agent-up-to-date; that skill is now sync`);
  }
}

// Listing descriptions are what a person reads before installing. They speak
// the person's words (EXPERIENCE.md at the Mainmind repository root), never
// the plumbing.
const PLUMBING = /\b(commits?|git|checkouts?|projections?|ledgers?|boot|OAuth|mount(ed|s)?|harness(es)?)\b/i;
for (const [label, description] of [
  [".claude-plugin/marketplace.json metadata", marketplace.metadata?.description],
  [".claude-plugin/marketplace.json mainmind entry", marketplaceEntry?.description],
  ["plugins/mainmind", claude.description],
  ["plugins/mainmind-mount (agent-plugins)", agentPlugins.description],
  ...(grok ? [["plugins/mainmind-grok (grok)", grok.description]] : []),
  ...(cursor ? [["plugins/mainmind-mount (cursor)", cursor.description]] : []),
  ...(cursorMarketplace ? [
    [`${CURSOR_MARKETPLACE} metadata`, cursorMarketplace.metadata?.description],
    ...(cursorMarketplace.plugins || []).map((entry) => [`${CURSOR_MARKETPLACE} ${entry.name} entry`, entry.description]),
  ] : []),
]) {
  const word = typeof description === "string" && description.match(PLUMBING)?.[0];
  if (word) fail(`${label}: description says "${word}"; people read it, so say what they get instead`);
}

if (failures.length) {
  for (const failure of failures) console.error(`FAIL ${failure}`);
  process.exit(1);
}
console.log(`PASS manifests agree (version ${claude.version}, MIT, ${MOUNT_URL})`);
