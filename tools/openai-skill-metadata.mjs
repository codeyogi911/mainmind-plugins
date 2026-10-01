// Host metadata only: this file does not define an agent runtime or authority.
// https://developers.openai.com/plugins/deploy/submission-errors#skill-agent-metadata-errors
import { parseDocument } from "yaml";

const object = value => value && Object.getPrototypeOf(value) === Object.prototype;
const string = value => typeof value === "string" && value.trim().length > 0;
export function validateOpenaiSkillMetadata(text) {
  let metadata;
  try {
    const document = parseDocument(text, { schema: "core", uniqueKeys: true });
    if (document.errors.length || document.warnings.length) throw new Error("invalid YAML");
    metadata = document.toJS({ maxAliasCount: 0 });
  } catch { return ["invalid YAML"]; }
  if (!object(metadata)) return ["YAML must be a mapping"];
  const problems = [];
  if (!object(metadata.interface)) problems.push("interface must be a mapping");
  else {
    for (const key of ["display_name", "short_description"]) if (!string(metadata.interface[key])) problems.push(`interface.${key} must be nonempty text`);
    if ("default_prompt" in metadata.interface && !string(metadata.interface.default_prompt)) problems.push("interface.default_prompt must be nonempty text");
  }
  if (!object(metadata.policy) || Object.keys(metadata.policy).some(key => !["products", "allow_implicit_invocation"].includes(key)) ||
      !Array.isArray(metadata.policy.products) || !metadata.policy.products.length || new Set(metadata.policy.products).size !== metadata.policy.products.length ||
      metadata.policy.products.some(p => !["CHAT", "CODEX"].includes(p)) || typeof metadata.policy.allow_implicit_invocation !== "boolean") {
    problems.push("invalid OpenAI policy");
  }
  if (!object(metadata.dependencies) || Object.keys(metadata.dependencies).some(key => key !== "tools") || !Array.isArray(metadata.dependencies.tools) || metadata.dependencies.tools.length !== 1) {
    problems.push("expected one Mainmind dependency");
  } else {
    const tool = metadata.dependencies.tools[0];
    if (!object(tool) || tool.type !== "mcp" || tool.value !== "mainmind" || !string(tool.description) || tool.url !== "https://mainmind.app/mcp") problems.push("incorrect Mainmind dependency");
    if (tool?.transport !== "streamable_http") problems.push("dependency transport must be streamable_http");
  }
  return problems;
}
