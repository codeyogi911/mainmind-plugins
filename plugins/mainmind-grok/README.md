# Mainmind for Grok

Mount a [Mainmind](https://mainmind.app) organization into Grok, and give the
session the habits a mount alone cannot teach it.

You sign in as yourself over OAuth. This plugin ships no secrets, no tokens and
no vendored credentials; your live role in the organization decides which tools
the session ever sees.

## Install

Grok loads plugins from `./.grok/plugins/`, `~/.grok/plugins/`, marketplace
installs under `~/.grok/plugins/marketplaces/`, any path listed under
`[plugins] paths` in `~/.grok/config.toml`, and `--plugin-dir <PATH>`. Copy or
symlink this directory into one of them, or point `--plugin-dir` at it.

You can skip the plugin entirely and add the mount as a plain remote MCP server
— you then get the tools but none of the skills:

```sh
grok mcp add --transport http "mainmind-<organization>" "https://mainmind.app/mcp/<organization>"
```

## What it contains

| Path | What Grok does with it |
|---|---|
| `.grok-plugin/plugin.json` | metadata only — name, version, author, licence |
| `.mcp.json` | the mount, as one `streamable-http` server declared with `"type": "http"` |
| `skills/<name>/SKILL.md` | discovered by convention; nothing declares them |

The manifest is **metadata only**. It declares no MCP server, no skill and no
command: Grok finds those by convention from the fixed paths above, so adding
an `mcpServers` or `skills` key to it would be silently ignored rather than
wired up.

## The transport keyword differs from the Cursor plugin

`plugins/mainmind-mount` next door declares the same endpoint for
[Agent Plugins](https://agent-plugins.org) clients, and its schema spells the
transport `streamable-http`. Grok's `.mcp.json` wants `"type": "http"` for the
same server. That is why the two plugins are separate directories rather than
one directory holding both `mcp.json` and `.mcp.json`: filenames that differ by
a leading dot, carrying values that must not match, is a trap rather than a
saving. `npm run check` asserts both spellings from the repository root.

## Verifying it works

Ask the connected session for `whoami`, then `boot`. A healthy tool list is not
success; a verified identity and a named commit are.

## Licence

MIT. See [LICENSE](../../LICENSE).
