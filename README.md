# Mainmind plugins

Mount a [Mainmind](https://mainmind.app) organization into your coding agent,
and give it the handful of habits that a mount alone cannot teach it.

One skill set, published for every harness that can read one. MIT licensed, no
secrets, no vendored credentials — you sign in as yourself and your live role
decides which tools the session ever sees.

## Install

| Harness | How |
|---|---|
| **Claude Code** | `/plugin marketplace add codeyogi911/mainmind-plugins` then `/plugin install mainmind@mainmind` — the `@mainmind` suffix names the marketplace, and is the form that resolves without waiting on a refresh |
| **Codex** | `codex plugin marketplace add codeyogi911/mainmind-plugins` then `codex plugin add mainmind@mainmind`, then `codex mcp login mainmind --scopes mainmind:org.read,mainmind:org.work` to sign in. Codex reads this repository's Claude Code marketplace, so it installs `plugins/mainmind` with its skills. Copying `.agents/skills/` into a repository is still there for a Codex that has no plugin command |
| **Cursor**, including its Grok Bot | `plugins/mainmind-mount`, listed in `.cursor-plugin/marketplace.json`. On a Cursor team, an admin adds it for everyone: **Dashboard → Plugins & MCPs → Add Marketplace → Import from Repo** with this repository's URL; members then add Mainmind from **Plugins**, in the editor or in Grok Bot. On your own, copy the contents of `plugins/mainmind-mount` into `~/.cursor/plugins/local/mainmind` and restart Cursor. It is not in Cursor's public Marketplace yet |
| Other [Agent Plugins](https://agent-plugins.org) clients | `plugins/mainmind-mount` also carries the Agent Plugins 1.0.0 `plugin.json`, so a client implementing that standard can load it as a plugin |
| **Grok** — Build, the web, API | [`plugins/mainmind-grok`](plugins/mainmind-grok): three surfaces, three setups, one mount. Grok Build takes the plugin itself, from `~/.grok/plugins/mainmind`; the web takes a connector. xAI documents the connector screen for the web; whether the iOS and Android apps expose it is not something its docs state. Cursor's Grok Bot is a Cursor product and uses the Cursor row |
| **Muse** | [`plugins/mainmind-muse`](plugins/mainmind-muse): add it yourself today, plus the dossier for the directory listing |

The canonical mount names no organization, so authorization asks which one to
mount — that is what lets one published file serve everybody. Configuring by
hand instead? Prefer the complete per-organization URL,
`https://mainmind.app/mcp/<organization>`, which fixes the organization before
authorization begins.

For a host that accepts only a static bearer — the xAI API's remote MCP tool,
for one — a plugin is the wrong shape. Register a machine member instead
(`invite_member` with `kind: machine`) and give that credential to the runner.

## What it ships

Six skills, in `skills/`:

- **`mainmind-boot`** — how to behave on a mount. Boot before answering,
  route through `find_process`, cite the path and the projection commit, and
  put Founder decisions through `ask_founder` as one question.
- **`morning-brief`** — a start-of-day digest built entirely from mount reads:
  what needs you, what is in motion, what landed.
- **`make-an-agent`** — "make me an agent that…": three plain questions, then
  a registered agent with proposed instructions, limits and schedule, shown as
  one summary card.
- **`continue-with-my-agent`** — "Continue with Job Hunter", in any app: the
  agent picks up where you left off, with its instructions and what it
  remembers; also "what do you remember about me?" and "forget that".
- **`keep-my-agent-up-to-date`** — nobody asks for this one. The agent loads it
  itself: it remembers what it learns as it learns it, and notes where it
  stopped after each finished piece of work, when you wind down and before you
  switch apps. It says nothing about it unless something could not be kept; at
  a goodbye, at most "All up to date."
- **`continue-everywhere`** — "Continue with Job Hunter everywhere": turns an
  existing setup (a Grok bot, `CLAUDE.md`, `AGENTS.md`, Cursor rules, a custom
  GPT) into a Mainmind agent after a preview of what comes along and what stays
  behind.

The four agent skills follow Mainmind's agent-portability design: the agent's
home lives in the organization's knowledge, and each app's own format is a
translation of it, never the source.

**An agent keeps itself up to date; nobody has to ask.** On every host the
skills tell it when. In Claude Code the plugin adds a safety net for when the
model forgets: a Stop hook (`plugins/mainmind/hooks/`) that, only in a session
that booted as an agent, asks the model once to hand off quietly before it
stops — when there is no handoff yet after six or more tool calls of work, or
the last one is over thirty minutes old and work has happened since. It never
asks twice in a row and lets the session stop on any doubt. Codex, Cursor, Grok
and Muse have the skills only.

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
  make-an-agent/SKILL.md
  continue-with-my-agent/SKILL.md
  keep-my-agent-up-to-date/SKILL.md
  continue-everywhere/SKILL.md
plugins/
  mainmind/                      Claude Code       .claude-plugin/plugin.json + hooks/hooks.json
  mainmind-mount/                Cursor and        .cursor-plugin/plugin.json + plugin.json + mcp.json
                                 Agent Plugins
  mainmind-grok/                 Grok              .grok-plugin/plugin.json + .mcp.json + config.toml
  mainmind-muse/                 Muse              no manifest: README.md + SUBMISSION.md
.agents/skills/                  Codex convention; copy into your own repo
.claude-plugin/marketplace.json  Claude Code marketplace entry (Codex reads it too)
.cursor-plugin/marketplace.json  Cursor marketplace entry, for Import from Repo and the Cursor Marketplace
```

Four of those five ecosystems have a plugin manifest, and all four are
metadata only — none of them declares a skill or a server, because every one of
them discovers those by convention. Claude Code's is
`.claude-plugin/plugin.json`. The [Agent Plugins](https://agent-plugins.org)
1.0.0 schema's is `plugin.json`, validated and `additionalProperties: false`,
with the mount in the sibling `mcp.json`. Cursor's is
`.cursor-plugin/plugin.json` in that same directory: Cursor loads an Agent
Plugin as it is, but Cursor's own plugin template
([cursor/plugin-template](https://github.com/cursor/plugin-template)) and its
validator expect every plugin listed in `.cursor-plugin/marketplace.json` to
carry that manifest, so the two sit side by side and share `mcp.json` and
`skills/`. The two manifests name the plugin differently on purpose: `mainmind`
is what Cursor lists and must match the marketplace entry, and `mainmind-mount`
is the Agent Plugins name that directory has always had. Grok's is `.grok-plugin/plugin.json`,
with the mount in `.mcp.json` at the plugin root — xAI's marketplace guide says
*"local plugins include a `README.md` and a valid `.grok-plugin/plugin.json`
manifest"*, and the plugins xAI already lists ship that layout. **Muse is the
one with no plugin format**: it takes a connector URL through a submission form.

This repository has now got that wrong in both directions — it published an
inert manifest once, then deleted a real one on the belief that it was invented
— so `npm run check` pins each file to the vendor page or shipped example that
justifies it, and fails both ways: a manifest that no host reads, and a missing
one that a host requires.

The trap worth knowing: Grok's `.mcp.json` and Agent Plugins' `mcp.json` are
filenames separated by one dot, and their `type` values **must not match**. The
Agent Plugins schema enumerates `stdio | streamable-http | sse` and rejects
`"http"`; Grok's takes `"http"`. That is why they are separate directories, and
why the check asserts each spelling rather than asserting they agree.

`SKILL.md` is the same format in every ecosystem, so one source serves all of
them — but each harness reads its own path, and nothing in the plugin formats
lets them share a directory. So the copies are generated:

```
npm run sync     # copy skills/ into every destination
npm run check    # fail if any copy has drifted, the manifests disagree, or the hook tests fail
```

A copy is all any of them needs, xAI's catalogue included. An entry in
[xai-org/plugin-marketplace](https://github.com/xai-org/plugin-marketplace)
names a repository and a full 40-character commit `sha`, and may add a `path`
naming the directory inside it that holds the plugin. Several live entries do
exactly that, one of them a plugin under `plugins/<name>` in a multi-plugin
repository — this layout. So `plugins/mainmind-grok` is listable from here,
with no second repository and no copy vendored into xAI's own. That key is
absent from xAI's written schema, which shows `path` only for vendored
entries; it is validated by `scripts/validate-catalog.py` and honoured by
`scripts/generate-plugin-index.py`, and the live entries are the evidence.
Not submitted yet.

`npm run check` runs in CI on every push and pull request. Edit a copy instead
of the source and it fails — which is the point, because a skill edited in one
harness's copy and nowhere else is exactly the drift this layout invites.

## Verifying it works

Ask the connected session for `whoami`, then `boot`. A healthy tool list is not
success; a verified identity and a named commit are.

## Licence

MIT. See [LICENSE](LICENSE).
