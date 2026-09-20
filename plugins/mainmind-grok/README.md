# Mainmind on Grok

Three surfaces, three setups, one mount. Grok reaches Mainmind the way it
reaches any connector: as a remote MCP server over the public internet, with
authorization completed in a browser. Nothing here ships a secret.

**There is no Grok plugin manifest.** xAI documents connectors and MCP server
entries, not a plugin package format, so this directory carries the two files
Grok actually reads and the steps for the surface that has no file at all. An
earlier version of this repository published a `.grok-plugin/plugin.json`; no
Grok surface read it, and it named no server, so it has been removed rather
than left to look like a supported route.

## Grok on web, iOS and Android

No file. Open **[grok.com/connectors](https://grok.com/connectors)**, choose
**New Connector**, then **Custom**, enter the mount URL, and complete
Mainmind's authorization in the flow Grok opens.

```text
https://mainmind.app/mcp
```

Grok discovers the tools the server exposes and offers them in conversation
alongside the built-in and catalog connectors. The server must be reachable
over the public internet, which Mainmind is.

On Grok Business and Enterprise a team admin with **Team Read-Write** adds the
connector in the cloud console first; members then connect their own accounts
at grok.com/connectors. One admin adding it is not the same as each member
being signed in — every person still authorizes as themselves.

## Grok Build, the coding agent

Either add it on the command line:

```sh
grok mcp add --transport http mainmind https://mainmind.app/mcp
```

…or merge [`config.toml`](./config.toml) into `~/.grok/config.toml` for your
user, or `.grok/config.toml` for one project. Complete the browser flow Grok
opens on first use.

Grok Build also reads Cursor's `.cursor/mcp.json`. If you already configured
Cursor on this host, look for the entry you have before adding a second one.

This is the surface where the skills in [`skills/`](./skills) earn their place:
Grok Build has a shell and a filesystem, so it can hold a checkout, and the
mount alone cannot tell it that. See the repository README for why.

## A bot you build on the xAI API

The xAI API's remote MCP tool takes `server_url`, `server_label` and a static
`authorization` bearer. That surface runs no OAuth, so a plugin is the wrong
shape for it and neither file here applies.

Register a machine member instead — `invite_member` with `kind: machine` — and
give the runner that member's own credential. Never Mainmind's deployment
credential, and never a person's token. Start with `allowed_tools` naming the
read set and widen it once the bot behaves.

## Verifying it works

Ask the connected session for `whoami`, then `boot`. A healthy tool list is not
success; a verified identity and a named commit are.

## Sources

- [Grok connectors](https://docs.x.ai/grok/connectors)
- [Connector management](https://docs.x.ai/grok/connector-management)
- [Grok Build MCP servers](https://docs.x.ai/build/features/mcp-servers)
- [xAI remote MCP tool](https://docs.x.ai/developers/tools/remote-mcp)
