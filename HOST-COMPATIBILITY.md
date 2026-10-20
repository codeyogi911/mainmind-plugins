# Host compatibility and evidence

Checked against the linked primary guides on **20 October 2026**. These are
package and setup contracts, not live-host acceptance. Use the tools enabled
in the actual session; a product name, installed plugin or configured server
is not evidence that this task can reach Mainmind.

## Check the session before working

1. Reuse the existing Mainmind installation and connection. Do not replace
   configuration or add a second server for the same address.
2. Discover the actual Mainmind tools in this task. For a connection check,
   use the existing read-only `whoami` and verify its identity and space.
   Installation, authentication, discovery and a successful call are separate
   observations. If the required tool is missing, report that boundary; do
   not guess a tool name or substitute another account.
3. Inspect the session's permitted shell, filesystem and Git capabilities.
   If they are available and the task calls for a checkout, follow the shared
   startup skill. Otherwise use the exposed Mainmind tools. Local desktop
   configuration does not establish access in a cloud or remote task.
4. After reconnecting, reload or rediscover through the host's supported
   controls, then recheck identity before continuing. Retain the task's work
   and receipts. Retry a read after the connection recovers; inspect the
   original receipt and destination before retrying an uncertain write with
   its original idempotency key. Do not widen access to make discovery pass.

A saved profile, reported activity, recent contact or a retained message is
not proof that an exact app session received it. Callback acceptance,
consumer acknowledgment and a reply are separate observations. Say which
one was observed, and keep unavailable or unverified delivery explicit.
Installing these packages does not create profiles, schedule work, subscribe
to events or enable an idle receiver.

## The host contracts differ

| Host | Package/configuration in this repository | What still needs host evidence |
|---|---|---|
| ChatGPT and Codex | `plugins/mainmind-codex`: root Agent Plugins 1.0.0 `plugin.json`, inline `extensions.com.openai`, root `mcp.json` with `streamable-http`, shared skills plus read-only setup. Codex's catalogue is `.agents/plugins/marketplace.json`. | Installed skill loading and an honest unavailable-tool reply were tested on Codex CLI 0.159.3; connected success, current ChatGPT loading and directory publication remain unverified. A local CLI configuration is not cloud access. |
| Claude Code | `plugins/mainmind`: `.claude-plugin/plugin.json`; components outside that directory; root `.mcp.json` explicitly `type: http`. Hooks use `CLAUDE_PLUGIN_ROOT`. | Static hook fixtures are not a live receiving channel. Validate the package with the installed CLI and test the intended runtime and connection. |
| Cursor | `plugins/mainmind-mount`: portable root manifest/skills/MCP and a native `.cursor-plugin/plugin.json` selecting `cursor-mcp.json`. | Native components have their own contract. Cursor expands `CURSOR_PLUGIN_ROOT`; do not substitute portable `PLUGIN_ROOT` or `PLUGIN_DATA` in native commands. These packages add no native hooks or receivers. |
| Grok Build | `plugins/mainmind-grok`: `.grok-plugin/plugin.json`, root `.mcp.json` with `http`, convention-discovered skills; `config.toml` is a connection-only alternative. | Plugin loading, sign-in and tool discovery must be checked in Build. This format does not establish Grok Bot or Grok web support. |
| Grok Bot | Source includes portable skills, but no verified Bot-specific Mainmind loading, authentication or receiver contract. | Current xAI docs describe persistent cloud computers and account integrations. Do not present Grok Build or Cursor setup as verified Bot setup. Its documented event routines do not prove arbitrary Mainmind MCP wake-up. |
| Grok web / API | The Grok README separately describes web connector setup and the API's credential limitations. | A web connector does not install the Build skills. Never pass a person's token to an API runner. |
| Muse | `plugins/mainmind-muse` carries shared skill material and a submission dossier, without a published native manifest in this source. | Custom connector authentication, actual skill activation and directory publication remain unverified. Inspect actual execution tools rather than assuming them from the name. |
| Other clients | Portable `plugins/mainmind-mount` targets Agent Plugins 1.0.0; direct remote MCP is a separate option where the client supports it. | No Hermes, Gemini, OpenCode or Pi-specific package is shipped here. A generic schema match does not prove a particular host can load or authenticate it. |

OpenAI's public-directory package excludes lifecycle hooks and app references.
A legacy compatibility manifest is not merged with the portable manifest; this
package uses the portable form and needs no extra overlay. Directory imports
are snapshots: after a package or server definition changes, use the documented
update/rescan flow and test in a new conversation. Existing conversations or a
local edit do not prove the imported tools changed.

## Events are not interchangeable

**OpenAI MCP Events** uses negotiated protocol `2026-07-28`, persistent
authorized subscriptions and verified signed HTTPS callbacks. Its documented
surfaces are Work chats on the web, Work chats on desktop with Cloud selected,
and dots. A generic CLI idle receiver is not established by those docs.
A successful callback acknowledges receipt; processing is asynchronous.

**Claude Code Channels** is a separate channel-server capability and opt-in
path. Claude's v2 MCP runtime does **not register a channel server** that
negotiates `2026-07-28`, because that revision cannot carry its channel
messages. A server on an earlier supported handshake follows the separate
channel contract. Do not apply OpenAI's revision requirement to a Claude
channel or change someone's protocol settings as a packaging repair.
Custom channels require the supported local/interactive activation and policy;
these packages install no channel server. Neither a normal remote HTTP server
nor Claude's existing Stop reminder is a channel receiver.

**Grok Bot routines and account integrations** have their own triggers and
access. They are not evidence of a custom Mainmind delivery subscription or
consumer acknowledgment. Mainmind delivery remains unverified on any host
until the actual supported receiver and an end-to-end receipt are observed.
Do not install monitors, background runners or new integrations to fill that
gap as part of plugin setup.

## Primary references

- [OpenAI portable plugins](https://developers.openai.com/plugins/build/plugins),
  [skills](https://developers.openai.com/plugins/build/skills),
  [MCP Events](https://developers.openai.com/plugins/build/mcp-events), and
  [connect and rescan](https://developers.openai.com/plugins/deploy/connect-chatgpt).
- [Claude plugin layout and validation](https://code.claude.com/docs/en/plugins-reference),
  [HTTP MCP and client runtimes](https://code.claude.com/docs/en/mcp), and
  [Channels reference](https://code.claude.com/docs/en/channels-reference).
- [Cursor plugin reference](https://prod.cursor.com/docs/reference/plugins),
  [MCP](https://cursor.com/docs/mcp), and [hooks](https://cursor.com/docs/hooks).
- [Grok Build plugins](https://docs.x.ai/build/features/skills-plugins-marketplaces),
  [Build MCP](https://docs.x.ai/build/features/mcp-servers),
  [Grok Bot](https://docs.x.ai/grok-bot),
  [Bot skills and routines](https://docs.x.ai/grok-bot/skills-routines-and-automations),
  and [Grok web connectors](https://docs.x.ai/grok/connectors).
- [Agent Plugins MCP servers](https://agent-plugins.org/plugin-authors/mcp-servers).
  Muse's source dossier links its platform material and marks the unpublished
  format and authentication boundary; it supplies no verified manifest schema.

No minimum host version is declared by these package manifests. Their version
identifies this source release; it is not a guarantee of host support. Keep
actual host versions, identity checks, available tools and untested branches
with acceptance evidence, separately from static package checks.
