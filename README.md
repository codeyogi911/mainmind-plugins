# Mainmind plugins

Connect your AI app to a [Mainmind](https://mainmind.app) space,
and give it the handful of habits that the connection alone cannot teach it.

One skill set, published for every harness that can read one. MIT licensed, no
secrets, no vendored credentials — you sign in as yourself and your live role
decides which tools the session ever sees.

**Switching AI apps?** Leaving Grok Bot for ChatGPT's dots, or any app for
another, you do not set your agent up again. An agent that already syncs is waiting:
connect Mainmind in the new app and say "Continue with <name>". One set up
inside the old app goes first: tell it "I'm moving to dots. Take everything
you know with you." [How it works](https://mainmind.app/docs/persistent-agents#switch-to-a-new-ai-app).

## Install

| Harness | How |
|---|---|
| **Claude Code** | `/plugin marketplace add codeyogi911/mainmind-plugins` then `/plugin install mainmind@mainmind` — the `@mainmind` suffix names the marketplace, and is the form that resolves without waiting on a refresh |
| **Codex** | `codex plugin marketplace add codeyogi911/mainmind-plugins` then `codex plugin add mainmind@mainmind`. Sign in to Mainmind when Codex asks. Already installed? Run `codex plugin marketplace upgrade mainmind` then `codex plugin add mainmind@mainmind` to get the newer version. The OpenAI package includes the Mainmind connection, the seven shared workflows and a connection-check setup skill. Copying `.agents/skills/` into a repository still works for a Codex without the plugin command. [Setup and validation status](plugins/mainmind-codex/README.md) |
| **Cursor**, including its Grok Bot | `plugins/mainmind-mount`, listed in `.cursor-plugin/marketplace.json`. On a Cursor team, an admin adds it for everyone: **Dashboard → Plugins & MCPs → Add Marketplace → Import from Repo** with this repository's URL; members then add Mainmind from **Plugins**, in the editor or in Grok Bot. On your own, copy the contents of `plugins/mainmind-mount` into `~/.cursor/plugins/local/mainmind` and restart Cursor. It is not in Cursor's public Marketplace yet |
| Other [Agent Plugins](https://agent-plugins.org) clients | `plugins/mainmind-mount` also carries the Agent Plugins 1.0.0 `plugin.json`, so a client implementing that standard can load it as a plugin |
| **Grok** — Build, the web, API | [`plugins/mainmind-grok`](plugins/mainmind-grok): three surfaces, three setups, one Mainmind connection. Grok Build takes the plugin itself, from `~/.grok/plugins/mainmind`; the web takes a connector. xAI documents the connector screen for the web; whether the iOS and Android apps expose it is not something its docs state. Cursor's Grok Bot is a Cursor product and uses the Cursor row |
| **ChatGPT**, including its dots | OpenAI's public plugin directory supports the same skills-and-connection package as Codex. This repository's package is [`plugins/mainmind-codex`](plugins/mainmind-codex); a public Mainmind listing has not been verified here. An existing developer connection can still use `https://mainmind.app/mcp`, but that connection alone does not install these packaged skills. Installed skill loading and setup activation were tested in Codex CLI; ChatGPT desktop and dots remain untested. [Distribution and review checklist](submissions/openai-directory.md) |
| **Claude directory** (claude.ai, Cowork, Claude Code) | `plugins/mainmind` is ready to submit to Anthropic's directory; [`submissions/claude-directory.md`](submissions/claude-directory.md) holds every answer the portal asks for and what is still open |
| **Muse** | [`plugins/mainmind-muse`](plugins/mainmind-muse): add it yourself today, plus the dossier for the directory listing |

The canonical connection URL names no space, so authorization asks which
one to connect — that is what lets one published file serve everybody. Configuring by
hand instead? Prefer the complete per-space URL,
`https://mainmind.app/mcp/<space>`, which fixes the space before
authorization begins.

For a host that accepts only a static bearer — the xAI API's remote MCP tool,
for one — a plugin is the wrong shape. Register a machine member instead
(`invite_member` with `kind: machine`) and give that credential to the runner.

## What it ships

Seven skills, in `skills/`:

- **`mainmind-boot`** — how to work through the Mainmind connection. Boot before answering,
  route through `find_process`, cite the path and the projection commit, and
  put Founder decisions through `ask_founder` as one question.
- **`morning-brief`** — a start-of-day digest built entirely from reads through the Mainmind connection:
  what needs you, what is in motion, what landed.
- **`write-knowledge`** — before an agent saves or proposes a lesson, skill,
  decision, fact, gap or work note: which page type, and how to write it so a
  person and an AI can both follow it.
- **`make-an-agent`** — "make me an agent that…": three plain questions, then
  a registered agent with proposed instructions, limits and schedule, shown as
  one summary card.
- **`continue-with-my-agent`** — "Continue with Job Hunter", in any app: the
  agent picks up where you left off, with its instructions and what it
  remembers; also "what do you remember about me?" and "forget that".
- **`sync`** — nobody has to ask for this one. The agent syncs itself: what it
  learns as it learns it, and where it stopped after each finished piece of
  work, when you wind down and before you switch apps. Each sync also brings
  the agent's latest home back, so every app carries on from the newest
  version. It says nothing about it unless something could not sync; at a
  goodbye, at most "All synced." Saying "sync" in any app syncs right away.
- **`continue-everywhere`** — "Continue with Job Hunter everywhere": turns an
  existing setup (a Grok bot, `CLAUDE.md`, `AGENTS.md`, Cursor rules, a custom
  GPT) into a Mainmind agent after a preview of what comes along and what stays
  behind.

The four agent skills follow Mainmind's agent-portability design: the agent's
home lives in the space's knowledge, and each app's own format is a
translation of it, never the source.

**An agent syncs itself; nobody has to ask.** On every host the skills tell it
when, and `mainmind-boot` has a session sync at the start so a person's agent is
simply there. In Claude Code the plugin adds three hooks (`plugins/mainmind/hooks/`):

- **Stop**, a safety net for when the model forgets: only in a session acting as
  an agent, it asks the model once to sync where it stopped before it stops —
  when nothing has been synced as stopped after six or more tool calls of work,
  or the last one is over thirty minutes old and work has happened since. It
  never asks twice in a row and lets the session stop on any doubt. It also
  notes which agent the folder last ran as.
- **PostToolUse**, on Claude Code's own task list (`TodoWrite`, `TaskCreate`,
  `TaskUpdate`): notes the list for this folder and session in one small local
  file, each task as a title, todo, doing or done, and a stable id made from
  its title (never the app's own id, which restarts every session). When the
  Stop hook reminds an agent and that list has changed since its last
  reminder, the reminder adds one line asking the agent to sync it as `tasks`,
  with done ones marked done. It prints nothing and exits 0 on any doubt.
- **SessionStart**: in a folder that last ran as an agent, one line of context
  for the model: "Last time here you were job-hunter. Sync as job-hunter and
  pick up where you left off." Silent otherwise, and on a resumed session. It
  reads one small local file, never the network, and exits 0 on any doubt or
  when `node` is missing.

Two agents, in `plugins/mainmind/agents/`, for Claude Code: the **Librarian**
and the **Toolsmith** that every Mainmind space has. Each file only starts the
person's own agent from Mainmind. Its instructions, limits and memory come from
Mainmind, the same in every app, so nothing here can drift from them. Every
other app reaches them by saying "Continue with Librarian" or "Continue with
Toolsmith".

Codex has the skills and the Mainmind connection; Cursor and Grok have those too. Muse has the skills and its connector setup.

## Why this ships skills at all

An earlier version of the `mainmind-mount` plugin shipped none, deliberately, and said so:

> Everything an agent needs in order to behave correctly on a mount arrives
> from the server itself: the `instructions` returned on `initialize`, the tool
> descriptions, and `boot`, which serves the space's own entry
> documents. A habit that works only because a plugin file taught it is a habit
> the next client will not have.

That rule is right about everything the **server** can know, and it still
governs: none of the space's rules, processes or authority live here.
They arrive from `boot`, and when this repository disagrees with what Mainmind
serves, what Mainmind serves wins.

It is wrong about one class of thing, and that class turned out to matter.
**Mainmind cannot tell whether your session has a shell, a filesystem or a Git
client. Your agent can.** The server cannot instruct what it cannot observe, so
the guidance has to sit on the client side — which is exactly what a plugin is.

The consequence is the one habit worth publishing: **try a checkout first, fall
back to working only through the Mainmind connection if you cannot.** Mainmind
serves Markdown under `knowledge/` and nothing else, so a space's own
command-line tools, under `tools/`, are invisible through the connection
entirely. An agent that never tries a checkout
cannot see them, will not know they exist, and will reach for a raw API call
where a vetted client was sitting in the repository — one that knows the
payload shapes that actually work, which writes are safe to replay, and where
the vendor's own documentation is wrong.

That is not hypothetical. It is how an order update got reported as applied
when the vendor had quietly dropped it, in a space whose repository
held a client that would have got it right.

## Layout

```
skills/                          canonical — edit here, only here
  mainmind-boot/SKILL.md
  morning-brief/SKILL.md
  make-an-agent/SKILL.md
  continue-with-my-agent/SKILL.md
  sync/SKILL.md
  continue-everywhere/SKILL.md
  write-knowledge/SKILL.md
plugins/
  mainmind/                      Claude Code       .claude-plugin/plugin.json + hooks/hooks.json
  mainmind-codex/                ChatGPT / Codex   plugin.json + mcp.json + assets/
  mainmind-mount/                Cursor and        .cursor-plugin/plugin.json + plugin.json + mcp.json
                                 Agent Plugins
  mainmind-grok/                 Grok              .grok-plugin/plugin.json + .mcp.json + config.toml
  mainmind-muse/                 Muse              no manifest: README.md + SUBMISSION.md
.agents/skills/                  Codex convention; copy into your own repo
.agents/plugins/marketplace.json Codex marketplace entry
.claude-plugin/marketplace.json  Claude Code marketplace entry
.cursor-plugin/marketplace.json  Cursor marketplace entry, for Import from Repo and the Cursor Marketplace
```

The portable OpenAI package has `plugin.json`, `mcp.json`, its logo and a generated
copy of the seven shared skills plus OpenAI setup and skill metadata. Its listing
lives under `extensions.com.openai` in the root manifest. It serves ChatGPT and
Codex through OpenAI's shared public directory when reviewed and published.
The current public ZIP submission path excludes lifecycle hooks and app references;
the Claude package keeps its own hooks. Claude Code's manifest is
`.claude-plugin/plugin.json`. The [Agent Plugins](https://agent-plugins.org)
1.0.0 schema's is `plugin.json`, validated and `additionalProperties: false`,
with the Mainmind connection in the sibling `mcp.json`. Cursor's is
`.cursor-plugin/plugin.json` in that same directory: Cursor loads an Agent
Plugin as it is, but Cursor's own plugin template
([cursor/plugin-template](https://github.com/cursor/plugin-template)) and its
validator expect every plugin listed in `.cursor-plugin/marketplace.json` to
carry that manifest, so the two sit side by side and share `mcp.json` and
`skills/`. The two manifests name the plugin differently on purpose: `mainmind`
is what Cursor lists and must match the marketplace entry, and `mainmind-mount`
is the Agent Plugins name that directory has always had. Grok's is `.grok-plugin/plugin.json`,
with the Mainmind connection in `.mcp.json` at the plugin root — xAI's marketplace guide says
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

`skills/` remains the source for the seven shared workflows. Each host reads
its own path, so the copies are generated. OpenAI-only setup and
`agents/openai.yaml` files live in `tools/openai-skills/`; generation merges
them into `plugins/mainmind-codex/skills/` and `.agents/skills/` only. An overlay
cannot override a shared file. Editing a generated copy fails the drift gate:

```
npm ci --ignore-scripts  # install the locked development parser
npm run sync            # validate and copy skills/ into every destination
npm run check           # check all skill metadata, copy drift, manifests and hooks
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
