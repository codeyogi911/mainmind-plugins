# Mainmind on Grok

Three surfaces, three setups, one mount. Grok reaches Mainmind the way it
reaches any connector: as a remote MCP server over the public internet, with
authorization completed in a browser. Nothing here ships a secret.

**The manifest is metadata only, and it is still required.** An earlier version
of this repository removed `.grok-plugin/plugin.json` on the reading that no
Grok surface read it. That was half right and wrong where it counted: the
manifest genuinely declares nothing — no server, no skill, no command, because
Grok finds those by convention — but xAI's marketplace guide states that *"local
plugins include a `README.md` and a valid `.grok-plugin/plugin.json` manifest"*,
and the plugins xAI already lists ship exactly that. Without it there is no
catalogue listing. It is back.

So the layout here is the one xAI's own catalogue uses:

| Path | What Grok does with it |
|---|---|
| `.grok-plugin/plugin.json` | metadata — name, version, author, licence |
| `.mcp.json` | the mount, at the plugin root. The leading dot matters |
| `skills/<name>/SKILL.md` | discovered by convention; nothing declares them |
| `config.toml` | Grok Build's own TOML route, for people not installing a plugin |

`mcp.json` without the dot is the Agent Plugins name, and it is what
`plugins/mainmind-mount` next door uses — with `"type": "streamable-http"`,
because that schema rejects `"http"`. Grok's takes `"http"`. Two filenames
separated by one dot, carrying values that must not match, is why these are two
directories and not one, and `npm run check` asserts both.

## Grok on the web

No file. xAI documents this screen for the web; whether the iOS and Android apps
expose the same one is not something its docs state, so this file does not claim
it. Open **[grok.com/connectors](https://grok.com/connectors)**, choose
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

The xAI API's remote MCP tool takes `server_url`, `server_label` and
`authorization`. That last field takes the **raw** credential, not a header
value: xAI writes the `Authorization` header itself, so a value beginning
`Bearer ` arrives doubled and the mount refuses it. That surface runs no OAuth,
so a plugin is the wrong shape for it and no file here applies.

Register a machine member instead — `invite_member` with `kind: machine` — and
give the runner that member's own credential. Never Mainmind's deployment
credential, and never a person's token. Start by naming the read set and widen
it once the bot behaves — that field is `allowed_tools` on the
OpenAI-compatible Responses API shape and `allowed_tool_names` in xAI's own
SDK, so check which one your client speaks rather than assuming.

## Verifying it works

Ask the connected session for `whoami`, then `boot`. A healthy tool list is not
success; a verified identity and a named commit are.

## Sources

- [Grok connectors](https://docs.x.ai/grok/connectors)
- [Connector management](https://docs.x.ai/grok/connector-management)
- [Grok Build MCP servers](https://docs.x.ai/build/features/mcp-servers)
- [xAI remote MCP tool](https://docs.x.ai/developers/tools/remote-mcp)
- [Skills, plugins and marketplaces](https://docs.x.ai/build/features/skills-plugins-marketplaces)
- [xai-org/plugin-marketplace contributing guide](https://github.com/xai-org/plugin-marketplace/blob/main/CONTRIBUTING.md)
- [getsentry/plugin-grok](https://github.com/getsentry/plugin-grok), a plugin xAI already lists, for the layout

## Listing it in xAI's catalogue

**Decided: a dedicated repository, `codeyogi911/mainmind-grok`.**

A catalogue entry is either `source.url` pointing at a public repository with a
full 40-character commit `sha` pinned — **no path component, so a plugin in a
subdirectory has no remote form** — or `{ "type": "local", "path":
"./external_plugins/<name>" }` with the files vendored into xAI's own
repository. This plugin is a subdirectory of `codeyogi911/mainmind-plugins`, so
neither works as it stands.

Vendoring was rejected: a copy inside xAI's repository drifts from this one on
every change here, and nothing would catch it. The dedicated repository is
generated instead, by `tools/build-grok-plugin-repo.mjs` in the repository
root, from this directory and the canonical `skills/`. Eight files, nothing
authored there, and `--check` fails when the generated tree has drifted — so
`skills/` stays single-sourced here and a hand edit over there is found rather
than silently overwritten.

```sh
node tools/build-grok-plugin-repo.mjs --out ../mainmind-grok
node tools/build-grok-plugin-repo.mjs --out ../mainmind-grok --check
```

Not submitted yet: the repository has still to be created. The catalogue entry
pins the commit that the generated tree lands on, so it is regenerated, pushed
and re-pinned on each release rather than tracking a branch.
