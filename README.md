# Mainmind plugins

Mount a [Mainmind](https://mainmind.app) organization into your coding agent,
and give it the handful of habits that a mount alone cannot teach it.

One skill set, published for every harness that can read one. MIT licensed, no
secrets, no vendored credentials — you sign in as yourself and your live role
decides which tools the session ever sees.

## Install

| Harness | How |
|---|---|
| **Claude Code** | `/plugin marketplace add codeyogi911/mainmind-plugins` then `/plugin install mainmind` |
| **Codex** | `codex mcp add "mainmind-<organization>" --url "https://mainmind.app/mcp/<organization>"`, then copy `skills/` into `.agents/skills/` in your repo (or `~/.agents/skills/` for every repo) |
| **Grok Build** | `grok mcp add --transport http "mainmind-<organization>" "https://mainmind.app/mcp/<organization>"`; the plugin manifest is `plugins/mainmind-mount/.grok-plugin/plugin.json` |
| **Cursor** and other [Agent Plugins](https://agent-plugins.org) clients | Point the client at `plugins/mainmind-mount` |
| **Grok on web, iOS, Android** | Not a plugin: add a custom connector at [grok.com/connectors](https://grok.com/connectors) |

The canonical mount names no organization, so authorization asks which one to
mount — that is what lets one published file serve everybody. Configuring by
hand instead? Prefer the complete per-organization URL,
`https://mainmind.app/mcp/<organization>`, which fixes the organization before
authorization begins.

For a host that accepts only a static bearer — the xAI API's remote MCP tool,
for one — a plugin is the wrong shape. Register a machine member instead
(`invite_member` with `kind: machine`) and give that credential to the runner.

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
  mainmind-mount/                Agent Plugins (Cursor) + Grok
.agents/skills/                  Codex convention; copy into your own repo
.claude-plugin/marketplace.json  Claude Code marketplace entry
```

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

## Verifying it works

Ask the connected session for `whoami`, then `boot`. A healthy tool list is not
success; a verified identity and a named commit are.

## Licence

MIT. See [LICENSE](LICENSE).
