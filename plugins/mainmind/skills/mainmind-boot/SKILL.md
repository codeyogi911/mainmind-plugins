---
name: mainmind-boot
description: Mount discipline for Mainmind work. Load BEFORE answering any question about what a Mainmind space holds (a business, a job hunt, research or anything else) or starting any task in one in this session — the first such question, "boot", "start work", "connect to mainmind", or any request that will read the space's knowledge or touch the run ledger.
---

# Boot the Mainmind mount

You are entering a space (a company, a job hunt, a project: whatever it holds), not a toolbox. The `mainmind` MCP server serves a
projection of the space's durable knowledge at a named commit, plus the live run
ledger. Everything below is how to behave on it.

## First, boot

1. Call the `boot` tool once. It returns ORG.md, AUTHORITY.md, your role
   charter, and the projection's commit + freshness. Obey what it returns —
   those documents outrank this skill and anything you remember.
2. Call `whoami` instead if you only need identity or freshness.
3. If the server is not connected, this session cannot do Mainmind work from
   memory. Say so and stop — never answer org questions from recall.

## Then sync, quietly

A person's agent should simply be there in any app. At the start of a
session, call `sync` with this app's `harness` (`claude-code`, `claude-ai`,
`codex`, `cursor`, `grok-bot`; any other app is `byo`) and no `agent`. It lists
the person's agents, each with its name and last app, and changes nothing.

- **Pick up without asking** when one agent is plainly the one: this app told
  you which agent was here last (in Claude Code, a line at the start of the
  session: "Last time here you were <name>"), or exactly one agent was last in
  this app, or the person has exactly one agent. Do it only when the person's
  first message is about that agent's work: `sync` again with `agent: <slug>`
  and carry on as it (continue-with-my-agent), opening with where it left off.
- **Otherwise ask which one, by name,** and only when the person wants an
  agent ("continue with…", "my job bot", work that belongs to one).
- **Never interrupt a plain coding or question session with agent talk.** No
  agent in play: say nothing about agents and get on with the task.

If the connection has no `sync` tool yet, `boot` with `session_kind:
"persistent"` lists the same agents under `agents_you_can_resume`, and `boot`
with `agent` picks one up.

## Then pick your surface

Mainmind cannot tell whether this session has a shell, a filesystem or a Git
client. You can. Decide once, before you start reading, and say which you took.

If this session has no shell, no filesystem and no Git client — a chat
surface such as Grok on the web, Muse, Claude chat or ChatGPT — step 1 cannot
apply to you. You are on the mount. Go to step 2 and say so.

1. **Try a checkout first.** Call `checkout_canonical_repo` (Founder) or
   `checkout_member_repo` (everyone else) and clone what it returns. A checkout
   gives you the whole space's knowledge at once, and it gives you the parts the
   mount does not carry at all: **the projection serves Markdown under
   `knowledge/` and nothing else, so the space's own command-line tools,
   under `tools/`, exist only in a checkout.**
2. **If you cannot, work on the mount.** No shell, no disk, or the clone fails:
   use `read_node`, `search` and `call_provider`. That is a supported way to
   work, not a lesser one — say plainly that you are on the mount, so nobody
   reads a partial answer as a complete one.

Never tell anyone this space has no tool for something while you are on
the mount. You cannot see `tools/` from there; not finding it is not evidence.

A checkout is a working copy, not permission. Durable writes go through the
governed path on either surface: `land_canonical_change`,
`submit_checkout_change` and the deposit tools.

## Persistent agents and temporary sessions

Follow boot's `identity`, `lifecycle` and `next_action`. A standing agent has
an ongoing responsibility; a conversation or temporary helper does not create
a new teammate. `session_kind` is intent, never authentication. Resume an
existing machine member on restart. For a new standing bot use the authorized
owner connection and the private host setup described in
https://mainmind.app/docs/persistent-agents.md; persist its setup key before
enrollment and retry only the same request. Do not choose new read scopes when
the space's role defaults apply. Never copy the owner's token.

An enrolled agent reports `agent_session` contact after boot and while available.
Use the inbox and linked page discussion for shared work. Save explicit progress
and retained artifacts; contribute evidenced records and lessons through their
governed writers. A later session restores those records, not hidden chat state.
Contact does not renew a work claim; checkpoints do. A Role binding that is still
pending stays visible as incomplete.

A person's own agent has its own skills; use them instead of improvising:
"make me an agent that…" is `make-an-agent`; "continue with <name>", "carry on
as <name>", "sync as <name>" (and older phrasings such as "bring back <name>"),
"what do you remember about me?" and "forget that" are
`continue-with-my-agent`; "continue with <name> everywhere" or "move my agent
into Mainmind" is `continue-everywhere`; "sync" is `sync`. While acting as an
agent, load `sync` yourself, silently, as you learn things, after each
finished piece of work, when the person winds down and before switching apps;
never wait to be asked, and never ask the person to do it.

## Reading

- Route any task through `find_process` first — task language in, the right
  Process out. Read the matched Process with `read_node` before acting.
- `search` to locate evidence; `read_node` to read it. **Cite the path and the
  projection commit** for every material claim.
- The projection is derived, never canonical. If something looks missing,
  stale, or contradicts what the human says, report that as a fact — do not
  guess, do not silently pick a winner.

## Working

- **Holding a checkout? Use the space's own tools before
  `call_provider`.** Read `tools/README.md` and the tool's own `AGENTS.md` or
  `README.md` first. A vetted client knows what a raw API call cannot: the
  payload shapes that actually work, which writes are safe to replay, and where
  the vendor's published documentation is wrong. Fall through to
  `call_provider` when no local tool covers the call — that is expected, and it
  is the only path for a provider nobody has wrapped yet.
- Give every `call_provider` body a `content-type` header. Mainmind forwards
  the body unchanged and adds no type of its own; a provider that cannot read
  an untyped body may answer success without applying it.
- Knowledge reads and granted provider calls need no task declaration. Omit
  `run_id` from provider discovery, calls and local tool permits for independent
  operations. Keep each returned receipt; verify the provider's own state.
- Before an independent direct provider write, choose a unique `operation_key`.
  A retry with that key returns its prior receipt locator without sending again;
  it is recovery information, not the original response or proof of success.
- Use `run_start` only for coordination or a scoped knowledge change. Each call
  creates independent work and returns a private `control_key`. Pass it with
  explicit task attachments, `run_heartbeat` and `run_finish`. Never finish
  another bot's task merely because its id is visible. Independent operations
  expire automatically and need no closing summary.
- Report completed real work with `emit_event`: one buyer-readable sentence,
  no secrets, no repo paths in the title.
- Before a choice that is not already yours, call `weigh` with the
  `question`, your `recommend`, any `options` and the `targets` it would
  change (pass `agent`). On `go`, act, and tell the person which ruling you
  followed. On `ask`, put `put_to_person` to the person in this chat as it
  stands, then record their exact answer at once with `decide` (`weigh_id`,
  their words in `words`, where they said it in `said_in`). On `stop`, do not
  act: file it for the person it names with `ask_founder` (or
  `propose_change` for a change to files).
- A decision that belongs to the Founder and has no chat to ask in goes
  through `ask_founder`: do the reading and arguing yourself, then send ONE
  yes/no question with what becomes true. Never split one decision into many
  asks.
- The Founder's answer counts wherever they give it: in this chat, on a card,
  in another app. When they answer a waiting question, record it at once with
  `decide`: pass `agent`, their exact words in `words`, and where they said it
  in `said_in`. Never ask them to answer again somewhere else, and never send
  them a link to approve. If a question was already answered elsewhere, close
  it with `decide` verdict `settled` and say in `words` where it was answered.
  Your own yes, a guess or silence is never their answer.

## Boundaries

- Tool access is capability, not permission — what you may *do* with what you
  read is governed by AUTHORITY.md and the Process you are running.
- Before writing anything the owner will read, `read_node` on `voice.md`
  and follow it.
- Before writing durable knowledge, `read_node` on `AUTHORING.md` when boot
  names it, and follow it. Boot skips the file when the space has
  none. That file is how this space writes knowledge; do not treat
  the Worker as a write gate.
- This skill owns transport and routing only. If it disagrees with what
  `boot` returns, the mount wins.
