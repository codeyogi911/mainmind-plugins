#!/usr/bin/env node
// Emit the standalone Grok plugin repository.
//
// xAI's catalogue entry addresses a plugin as `source.url` — a public
// repository pinned to a full commit sha — with NO path component. Every
// shipped entry points at a repository whose *root* is the plugin. So
// `plugins/mainmind-grok` cannot be listed from inside this repository, and
// the alternative is vendoring the files into xAI's own repo under
// `external_plugins/`, which makes them a copy nobody here updates.
//
// Generating a repository keeps one source. `skills/` stays canonical here and
// is copied outward, exactly as it is for the four in-repo plugins; the
// generated tree is an artifact, never edited by hand.
//
//   node tools/build-grok-plugin-repo.mjs --out <dir>
//   node tools/build-grok-plugin-repo.mjs --out <dir> --check
//
// `--check` exits non-zero when the tree at <dir> disagrees with what this
// would emit, so a stale generated repository cannot be pinned by accident.
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync, rmSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE = "plugins/mainmind-grok";
const check = process.argv.includes("--check");
const outIndex = process.argv.indexOf("--out");
const out = outIndex > -1 ? process.argv[outIndex + 1] : null;
if (!out) {
  console.error("usage: build-grok-plugin-repo.mjs --out <dir> [--check]");
  process.exit(2);
}

function walk(dir, base = dir, acc = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) walk(path, base, acc);
    else if (entry.isFile()) acc.push(relative(base, path));
  }
  return acc;
}

// Everything the plugin directory already carries, plus the licence, which a
// catalogue submission requires and which lives at this repository's root.
const files = new Map();
for (const file of walk(join(root, SOURCE))) {
  files.set(file, readFileSync(join(root, SOURCE, file)));
}
files.set("LICENSE", readFileSync(join(root, "LICENSE")));

// The generated repository says what it is, so nobody edits it in place.
const manifest = JSON.parse(files.get(join(".grok-plugin", "plugin.json")).toString());
files.set("GENERATED.md", Buffer.from(
  `# Generated\n\n` +
  `This repository is emitted from [codeyogi911/mainmind-plugins](https://github.com/codeyogi911/mainmind-plugins)\n` +
  `by \`tools/build-grok-plugin-repo.mjs\`, from \`${SOURCE}/\` and the canonical\n` +
  `\`skills/\`. Version ${manifest.version}.\n\n` +
  `**Do not edit these files here.** Edit them in that repository and\n` +
  `regenerate; \`--check\` fails when this tree has drifted, so a hand edit is\n` +
  `found rather than silently overwritten.\n\n` +
  `It exists because an xAI catalogue entry pins a repository root and carries\n` +
  `no path component, so a plugin in a subdirectory cannot be listed.\n`,
));

if (!files.has(".mcp.json") || !files.has(join(".grok-plugin", "plugin.json")) || !files.has("README.md")) {
  console.error(`FAIL ${SOURCE} is missing .mcp.json, .grok-plugin/plugin.json or README.md`);
  process.exit(1);
}

if (check) {
  if (!existsSync(out)) {
    console.error(`DRIFT ${out} does not exist; run without --check to emit it`);
    process.exit(1);
  }
  let drifted = 0;
  const present = new Set(walk(out).filter((f) => !f.startsWith(".git" + "/")));
  for (const [file, body] of files) {
    const target = join(out, file);
    const current = existsSync(target) && statSync(target).isFile() ? readFileSync(target) : null;
    present.delete(file);
    if (current && current.equals(body)) continue;
    console.error(`DRIFT ${file} ${current ? "differs from" : "is missing from"} the generated tree`);
    drifted += 1;
  }
  for (const extra of present) {
    console.error(`DRIFT ${extra} is in the generated tree with no counterpart in ${SOURCE}/`);
    drifted += 1;
  }
  if (drifted) {
    console.error(`\n${drifted} file(s) out of date. Regenerate with: node tools/build-grok-plugin-repo.mjs --out ${out}`);
    process.exit(1);
  }
  console.log(`PASS ${files.size} file(s) in ${out} match ${SOURCE}/ at version ${manifest.version}`);
} else {
  for (const existing of existsSync(out) ? walk(out) : []) {
    if (existing.startsWith(".git" + "/")) continue;
    if (!files.has(existing)) rmSync(join(out, existing));
  }
  for (const [file, body] of files) {
    const target = join(out, file);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, body);
  }
  console.log(`Emitted ${files.size} file(s) into ${out} at version ${manifest.version}`);
  console.log(`Next: commit that tree, push it, and pin the catalogue entry to the resulting full commit sha.`);
}
