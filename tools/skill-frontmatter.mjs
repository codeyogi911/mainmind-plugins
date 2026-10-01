// Claude's metadata constraints apply to the shared source and every shipped
// copy. Parse YAML, not matching lines: quoted and folded values must receive
// the same checks, and malformed/non-string metadata must never pass.
// https://claude.com/docs/skills/how-to
// https://agentskills.io/specification#name-field
// https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview#skill-structure
// The Complete Guide to Building Skills for Claude also forbids < and > in
// frontmatter. Check decoded metadata, leaving body templates untouched.
import { parseDocument } from "yaml";

export const SKILL_ROOTS = [
  "skills",
  "plugins/mainmind/skills",
  "plugins/mainmind-codex/skills",
  "plugins/mainmind-mount/skills",
  "plugins/mainmind-grok/skills",
  "plugins/mainmind-muse/skills",
  ".agents/skills",
];

export function validateSkillFrontmatter(text, directory) {
  const block = text.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!block) return ["no frontmatter block"];
  let metadata;
  try {
    const document = parseDocument(block[1], { schema: "core", uniqueKeys: true });
    // Unknown tags are warnings in YAML; they are not valid skill metadata.
    const errors = [...document.errors, ...document.warnings];
    if (errors.length) return errors.map((error) => `invalid YAML: ${error.message}`);
    // Metadata needs no aliases. Disallow expansion rather than trusting a
    // frontmatter document to allocate an arbitrary amount of memory.
    metadata = document.toJS({ maxAliasCount: 0 });
  } catch (error) {
    return [`invalid YAML: ${error.message}`];
  }
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return ["frontmatter must be a YAML mapping"];
  }

  const problems = [];
  function checkAngles(value, path) {
    if (typeof value === "string") {
      if (/[<>]/.test(value)) problems.push(`${path} contains a forbidden angle bracket`);
    } else if (Array.isArray(value)) {
      value.forEach((item, index) => checkAngles(item, `${path}[${index}]`));
    } else if (value instanceof Set) {
      for (const item of value) checkAngles(item, `${path} item`);
    } else if (value instanceof Map) {
      for (const [key, item] of value) {
        checkAngles(key, `${path} key`);
        checkAngles(item, `${path} value`);
      }
    } else if (value && typeof value === "object") {
      for (const [key, item] of Object.entries(value)) {
        checkAngles(key, `${path} key`);
        checkAngles(item, `${path} ${key}`);
      }
    }
  }
  checkAngles(metadata, "frontmatter");
  for (const [key, limit] of [["name", 64], ["description", 1024]]) {
    const value = metadata[key];
    if (typeof value !== "string" || !value.trim()) {
      problems.push(`frontmatter ${key} must be a non-empty string`);
      continue;
    }
    if ([...value].length > limit) problems.push(`frontmatter ${key} exceeds ${limit} characters`);
  }
  if (typeof metadata.name === "string") {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(metadata.name)) {
      problems.push("frontmatter name must use lowercase letters and numbers with single internal hyphens");
    }
    if (/anthropic|claude/.test(metadata.name)) problems.push("frontmatter name contains a reserved word");
    if (metadata.name !== directory) {
      problems.push(`frontmatter name "${metadata.name}" does not match its directory "${directory}"`);
    }
  }
  return problems;
}
