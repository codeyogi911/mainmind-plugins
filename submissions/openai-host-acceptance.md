# Installed Codex acceptance

On 2026-10-02, Codex CLI 0.159.3 installed Mainmind 0.16.1 from the local
candidate marketplace through the supported plugin commands. The plugin was
enabled. The existing connection and authentication were retained; no new
credentials, permissions, OAuth scopes or subscriptions were requested.

Each test used `codex exec --ephemeral --skip-git-repo-check --sandbox read-only`
in an empty temporary directory, outside this repository. This prevents the
repository's `.agents/skills` from standing in for installed skill loading.
The prompts restricted the run to the existing read-only `whoami` operation.

## Observed results

- Explicit `$mainmind-setup`: the trace read the installed cache's
  `skills/mainmind-setup/SKILL.md` successfully. The required `whoami` tool was
  unavailable. The turn completed with zero MCP tool calls.
- Plain-language connection question: one run selected the installed setup
  skill, while another selected the installed `mainmind-boot` skill. Both
  stopped with zero MCP tool calls. Implicit selection is therefore variable;
  `$mainmind-setup` is the documented Codex entry point for this bounded check.
- The first implicit setup reply omitted the settings recovery sentence.
  The source now explicitly requires both sentences in the final reply. The
  final explicit test loaded that updated installed file and returned:

> The existing read-only `whoami` tool is unavailable, so I stopped without
> making any Mainmind calls. I can’t check your Mainmind space from this app
> yet. Check the connection in the plugin’s settings.

The final setup source and installed file had identical SHA-256:
`01471d2bae7a78a66234231bd750e009801944b610d8f15da8c299263ceb340d`.
Private CLI event traces were inspected for skill paths, completed turns and
MCP calls; they are retained outside the package and are not public artifacts.

## Coverage limits

This proves installed skill loading and an honest unavailable-tool response in
Codex CLI. It does not prove connected identity, that all server tools are
available, reliable implicit selection, ChatGPT desktop/mobile behavior, event
delivery, the eight directory review scenarios, or directory approval.

The smallest remaining identity acceptance step is to expose the existing
read-only `whoami` tool in the authorized host connection and repeat
`$mainmind-setup`, checking its returned identity/space without follow-on writes.
The existing server/tool-discovery owner is handling that dependency. The
[directory checklist](openai-directory.md) retains the separate publication work.
