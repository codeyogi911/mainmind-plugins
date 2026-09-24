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

**The plugin is the better route**, because it brings the skills as well as the
connection. Grok Build loads plugins from `~/.grok/plugins/`
([xAI's plugins guide](https://docs.x.ai/build/features/skills-plugins-marketplaces)),
so put this directory there under the name `mainmind`:

```sh
git clone --depth 1 https://github.com/codeyogi911/mainmind-plugins /tmp/mainmind-plugins && mkdir -p ~/.grok/plugins && cp -R /tmp/mainmind-plugins/plugins/mainmind-grok ~/.grok/plugins/mainmind
```

Restart Grok Build, check that `/plugins` lists **mainmind** as enabled, then
open `/mcps`, choose **mainmind** and sign in. If `~/.grok/plugins/mainmind`
already exists, leave it: updating means deleting it and copying again. Grok
Build also reads Claude Code plugins, so if you installed Mainmind's Claude
Code plugin on this computer, `/plugins` may already show it and you need
nothing more.

Only the connection, without the skills? Add it on the command line:

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

An agent keeps itself up to date here with no one asking: the
`keep-my-agent-up-to-date` skill has it remember what it learns and note where
it stopped after each finished piece of work, when the person winds down and
before they switch apps, silently unless something could not be kept. To pick
it up in any other app, the person says "Continue with <Name>". Grok gets the
skill only; the safety-net hook is Claude Code's.

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

Not submitted yet, but nothing about this directory's position is in the way.
A catalogue entry names `source.url` with a full 40-character commit `sha`
pinned, and may add a `path` naming the directory inside that repository which
holds the plugin. Several entries listed today are exactly that shape, one of
them a plugin under `plugins/<name>` in a multi-plugin repository. So the entry
for this one points at `codeyogi911/mainmind-plugins` with
`"path": "plugins/mainmind-grok"` and a pinned commit, and `skills/` stays
single-sourced in the repository root with nothing generated, copied or
vendored anywhere for the listing's sake.

That `path` key is not in xAI's written schema: the README documents `path`
only under local, vendored sources, and CONTRIBUTING.md is silent on it. It is
nonetheless a first-class field — `scripts/validate-catalog.py` validates it
for url sources and `scripts/generate-plugin-index.py` roots the fetched tree
at it — and the live entries using it are the evidence. If a reviewer ever
rejects the shape, the fallback is vendoring a copy under
`external_plugins/`, which would drift from this directory on every change
here with nothing to catch it.

One thing is worth settling before submitting, and it is not the path.
CONTRIBUTING.md asks that a branded plugin be sourced from its own
organization rather than a personal account, and `codeyogi911` is a personal
account. Every remote entry listed today is sourced from an organization.
