# Mainmind plugins

Mount a [Mainmind](https://mainmind.app) organization into your coding agent,
and give it the handful of habits that a mount alone cannot teach it.

One skill set, published for every harness that can read one. MIT licensed, no
secrets, no vendored credentials — you sign in as yourself and your live role
decides which tools the session ever sees.

## Install

| Harness | How |
|---|---|
| **Claude Code** | `/plugin marketplace add codeyogi911/mainmind-plugins` then `/plugin install mainmind@mainmind` |
| **Codex** | `codex mcp add "mainmind-<organization>" --url "https://mainmind.app/mcp/<organization>"`, then copy this repo's `.agents/skills/` over yours — each skill must sit at `.agents/skills/<name>/SKILL.md`, so copy the *contents*, not the directory onto itself |
| **Grok Build** | `grok mcp add --transport http "mainmind-<organization>" "https://mainmind.app/mcp/<organization>"` for the mount alone, or install [`plugins/mainmind-grok`](plugins/mainmind-grok) for the mount plus the skills |
| **Cursor** and other [Agent Plugins](https://agent-plugins.org) clients | [`plugins/mainmind-mount`](plugins/mainmind-mount) is an Agent Plugins 1.0.0 plugin, which Cursor loads directly. Until it is listed, install it from a local checkout through Cursor's **Customize** sidebar |
| **Grok on the web** | Not a plugin: add a custom connector at [grok.com/connectors](https://grok.com/connectors) → **New Connector** → **Custom**. xAI documents this flow for the web; whether the mobile apps expose the same screen is not something xAI's docs state, so we do not claim it |

`/plugin install mainmind` without the `@mainmind` suffix usually works, because
the name is unambiguous — but only after the marketplace has been refreshed, so
the qualified form is the one to publish.

The canonical mount names no organization, so authorization asks which one to
mount — that is what lets one published file serve everybody. Configuring by
hand instead? Prefer the complete per-organization URL,
`https://mainmind.app/mcp/<organization>`, which fixes the organization before
authorization begins.

For a host that accepts only a static bearer — the xAI API's remote MCP tool,
for one — a plugin is the wrong shape. Register a machine member instead
(`invite_member` with `kind: machine`) and give that credential to the runner.
On that surface the tool takes `server_url` and `server_label`, and its
`authorization` field takes the **raw** token: xAI puts it into the header
itself, so a value beginning `Bearer ` arrives doubled.

## What it ships

Two skills, in `skills/`:

- **`mainmind-boot`** — how to behave on a mount. Boot before answering,
  route through `find_process`, cite the path and the projection commit, and
  put Founder decisions through `ask_founder` as one question.
- **`morning-brief`** — a start-of-day digest built entirely from mount reads:
  what needs you, what is in motion, what landed.

## Why this ships skills at all

An earlier version of the mount plugin shipped none, deliberately, and said so:

> Everything an agent needs in order to behave correctly on a mount arrives
> from the server itself: the `instructions` returned on `initialize`, the tool
> descriptions, and `boot`, which serves the organization's own entry
> documents. A habit that works only because a plugin file taught it is a habit
> the next client will not have.

That rule is right about everything the **server** can know, and it still
governs: none of the organization's rules, processes or authority live here.
They arrive from `boot`, and when this repository disagrees with the mount, the
mount wins.

It is wrong about one class of thing, and that class turned out to matter.
**Mainmind cannot tell whether your session has a shell, a filesystem or a Git
client. Your agent can.** The server cannot instruct what it cannot observe, so
the guidance has to sit on the client side — which is exactly what a plugin is.

The consequence is the one habit worth publishing: **try a checkout first, fall
back to the mount if you cannot.** The mount serves Markdown under `knowledge/`
and nothing else, so an organization's own command-line tools, under `tools/`,
are invisible from the mount entirely. An agent that never tries a checkout
cannot see them, will not know they exist, and will reach for a raw API call
where a vetted client was sitting in the repository — one that knows the
payload shapes that actually work, which writes are safe to replay, and where
the vendor's own documentation is wrong.

That is not hypothetical. It is how an order update got reported as applied
when the vendor had quietly dropped it, in an organization whose repository
held a client that would have got it right.

## Layout

```
skills/                          canonical — edit here, only here
  mainmind-boot/SKILL.md
  morning-brief/SKILL.md
plugins/
  mainmind/                      Claude Code
  mainmind-mount/                Agent Plugins (Cursor)
  mainmind-grok/                 Grok
.agents/skills/                  Codex convention; copy into your own repo
.claude-plugin/marketplace.json  Claude Code marketplace entry
```

**Grok and Cursor used to share one directory, and must not.** Each declares
the same endpoint, and each spells its transport differently: Grok's
`.mcp.json` wants `"type": "http"`, while the Agent Plugins `mcp.json` schema's
enum is `stdio | streamable-http | sse` and rejects `"http"` outright. Two files
whose names differ only by a leading dot, holding values that must not match, is
a trap rather than a saving — so they are separate plugins now, and
`npm run check` asserts each spelling against the spec that requires it.

Three more rules the check enforces, all of them things that look right and
work nowhere:

- The Claude Code marketplace pins a release with `version` **on the plugin
  entry**. `metadata` documents only `pluginRoot`, so a version parked there
  pins nothing.
- The Agent Plugins manifest is `additionalProperties: false` at the root. A
  `skills` or `mcpServers` key there is a validation failure, not decoration —
  skills come from `skills/<name>/SKILL.md` and the mount from `mcp.json`.
- The Grok manifest is metadata only, and Grok discovers everything else by
  convention. A declaration key there is silently ignored, which is worse.

`SKILL.md` is the same format in every ecosystem, so one source serves all of
them — but each harness reads its own path, and nothing in the three plugin
formats lets them share a directory. So the copies are generated:

```
npm run sync     # copy skills/ into every destination
npm run check    # fail if any copy has drifted, or the manifests disagree
```

`npm run check` runs in CI on every push and pull request. Edit a copy instead
of the source and it fails — which is the point, because a skill edited in one
harness's copy and nowhere else is exactly the drift this layout invites.

## Publishing

Claude Code needs no listing: `/plugin marketplace add codeyogi911/mainmind-plugins`
reads `.claude-plugin/marketplace.json` from this repository directly, which is
why that route already works for anyone.

The other two ecosystems have catalogues, and neither is submitted yet.

- **Cursor** lists Agent Plugins at [cursor.com/marketplace](https://cursor.com/marketplace);
  submissions go through its publish form. The plugin validates against the
  1.0.0 schema today, which is the part that was blocking.
- **Grok** has [xai-org/plugin-marketplace](https://github.com/xai-org/plugin-marketplace).
  A third-party entry lands under `external_plugins/`, pins a full 40-character
  commit sha on a public repository, regenerates the plugin index, passes the
  catalogue validator and then clears a code-owner review.

**One open question blocks the Grok submission**, and it is structural rather
than ours to decide alone: every shipped entry in that catalogue points at a
repository whose *root* is the plugin, and the entry's `source` carries a URL
and a sha with no path component. Our Grok plugin is a subdirectory of this
repository. Either the catalogue supports a subdirectory in a way its published
examples do not show, or the plugin needs its own repository — a small
`mainmind-grok` repo that this one generates into, so `skills/` stays
single-sourced here. That is a call worth making before submitting rather than
after a rejection.

## Verifying it works

Ask the connected session for `whoami`, then `boot`. A healthy tool list is not
success; a verified identity and a named commit are.

## Licence

MIT. See [LICENSE](LICENSE).
