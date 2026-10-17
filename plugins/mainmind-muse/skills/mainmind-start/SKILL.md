---
name: mainmind-start
description: Start with Mainmind, and the working discipline for the Mainmind connection. Load BEFORE answering any question about what a Mainmind space holds (a business, a job hunt, research or anything else) or starting any task in one in this session — the first such question, "start", "start with mainmind", "start work", "boot", "connect to mainmind", or any request that will read the space's knowledge or touch the run ledger.
---

# Start with Mainmind

You are entering a space (a company, a job hunt, a project: whatever it holds), not a toolbox. The `mainmind` MCP server serves a
projection of the space's durable knowledge at a named commit, plus the live run
ledger. Everything below is how to behave on it.

## First, start

1. Call the `start` tool once. It returns ORG.md, AUTHORITY.md, your role
   charter, and the projection's commit + freshness. Obey what it returns —
   those documents outrank this skill and anything you remember. There is no
   `boot` tool. If this server has no `start`, say so and stop.
2. Call `release_notes` at the start of a session. Follow `next_cursor` until
   the last page, keep `release_token` in this app's existing state, and pass
   it as `since` next time. Do not combine `since` with `cursor`. Notes are
   product guidance. They grant no authority over the space.
3. Call `whoami` instead of `start` if you only need identity or freshness.
4. If the server is not connected, this session cannot do Mainmind work from
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

If the connection has no `sync` tool yet, `start` with `session_kind:
"persistent"` lists the same agents under `agents_you_can_resume`, and `start`
with `agent` picks one up. Do not call `agent_home`. It goes away on
3 November 2026, and `sync` replaces it.

## Which space

One connection serves one space at a time. Call `use_organization` with no
argument to list the spaces it holds, each with your role and which one is
served now. Call it with `workspace` only when you mean to switch. Switching
moves every conversation on that connection onto the new space. Say that
before you switch, then call `start` again. A connection authorized at one
space's own URL holds only that space and says so. No other tool takes a
space name.

## Then pick your surface

Mainmind cannot tell whether this session has a shell, a filesystem or a Git
client. You can. Decide once, before you start reading, and say which you took.

If this session has no shell, no filesystem and no Git client — a chat
surface such as Grok on the web, Muse, Claude chat or ChatGPT — step 1 cannot
apply to you. You are working only through the Mainmind connection. Go to
step 2 and say so.

1. **Try a checkout first.** Call `checkout_canonical_repo` (Founder) or
   `checkout_member_repo` (everyone else) and clone what it returns. A checkout
   gives you the whole space's knowledge at once, and it gives you the parts the
   Mainmind connection does not carry at all: **the projection serves Markdown under
   `knowledge/` and nothing else, so the space's own command-line tools,
   under `tools/`, exist only in a checkout.**
2. **If you cannot, work only through the Mainmind connection.** No shell, no disk, or the clone fails:
   use `read_node`, `search` and `call_provider`. That is a supported way to
   work, not a lesser one — say plainly that you are working only through the Mainmind
   connection, so nobody
   reads a partial answer as a complete one.

Never tell anyone this space has no tool for something while you are working
only through the Mainmind connection. You cannot see `tools/` from there; not finding it is not evidence.

A checkout is a working copy, not permission. Durable writes go through the
governed path on either surface: `land_canonical_change`,
`submit_checkout_change` and the deposit tools.

## Persistent agents and temporary sessions

Follow start's `identity`, `lifecycle` and `next_action`. A standing agent has
an ongoing responsibility; a conversation or temporary helper does not create
a new teammate. `session_kind` is intent, never authentication. Resume an
existing machine member on restart. For a new standing bot reuse the owner's
existing agent profile or call `register_agent` with a stable registration key,
as https://mainmind.app/docs/persistent-agents.md describes, and retry only the
same request. Do not choose new read scopes when
the space's role defaults apply. Never copy the owner's token.

`sync` reports contact. Do not call `agent_session` or `agent_home`. Both go
away on 3 November 2026, and `sync` replaces them. Use the inbox and linked
page discussion for shared work. Save explicit progress and retained
artifacts; contribute evidenced records and lessons through their governed
writers. A later session restores those records, not hidden chat state.
Contact does not renew a work claim; checkpoints do. A Role binding that is
still pending stays visible as incomplete.

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
  change (pass `agent`). `go` means only that changing the files it names is
  already approved: change those files and nothing more, and tell the person
  which ruling you followed. It never approves anything else the question
  says; weigh any other act on its own. On `ask`, put `put_to_person` to the
  person in this chat as it stands, tell them where the answer will be kept
  (`kept_in`; pass `access_scope` to `decide` if they want it elsewhere), then
  record their exact answer at once with `decide` (`weigh_id`, their words in
  `words`, where they said it in `said_in`). On `stop`, do not act. File a
  ruled-file change with `change`. File anything else with `ask_founder`. A
  co-owner files the stop with `ask_founder`. If this server has no `change`,
  use `propose_change` for that file change.
- Before you ask, call `decisions`. Omit `key` to list what is waiting and
  what was answered in the last 7 days. Pass `key` for one decision, including
  a `weigh_id` the owner already answered. Do not ask a question that is
  already waiting or already answered. `withdraw_ask` with that `key` and a
  `reason` retires your own pending question. The owner is not asked, and
  nothing is written. A question someone else asked stays until they decide it.
- To change a ruled or conserved file, `change` is the only route. Call it
  with `changes` (the same operations `propose_change` takes), `question`,
  `becomes`, `recommend` (`yes` or `no`), `recommend_why`, `eli5`, `stake`,
  `blast_radius` (one from each pair) and `act_label`, plus the open `run_id`.
  Mainmind holds those exact words and writes nothing. Put the returned
  question to the owner in this chat as one yes/no, with your recommendation.
  Never hand them a link as the act. When they answer, call `change` again
  with `change_id`, `verdict` (`yes`, `no` or `changes`), their exact `words`,
  and `said_in` when you record it as an agent. `yes` lands those words and
  the Decision that records the answer. `no` and `changes` land nothing. A
  page, record, lesson or work note is not changed here: use `keep_page` or
  the deposit tool `write-knowledge` names.
- `propose_change` and `ask_founder` are the fallback when this server has no
  `change`, or when the decision does not change a ruled file. `ask_founder`
  is still one yes/no, with `recommend` and what becomes true on yes. Ask it
  in this chat. Never hand the owner a link as the act.
- The Founder's answer counts wherever they give it: in this chat, on a card,
  in another app. When they answer a question you did not already record
  through `change`, record it at once with `decide`: pass `agent`, their exact
  words in `words`, and where they said it in `said_in`. Never ask them to
  answer again somewhere else, and never send them a link to approve. If a
  question was already answered elsewhere, close it with `decide` verdict
  `settled` and say in `words` where it was answered. Your own yes, a guess
  or silence is never their answer.

## Pages

A space's Home is a page, `pages/home.md`, and it is the first thing the
person sees in the app. Pages are how agents show their work there.

- **No Home yet?** Write it with `keep_page` (name `home`): what changed, what
  waits on the person, and what the team is doing. When you make a new space,
  write Home before anything else.
- **A topic that needs its own place gets its own page.** Use `parent` to put
  it inside another page. Use `purpose` to say what you keep current on it,
  from which sources and how often, then follow that purpose each time you
  update it.
- **Comments on a page come to its keeper,** or to the owner of the part,
  through `page_work`. Answer there, and change the page when the comment asks.

## Boundaries

- Tool access is capability, not permission — what you may *do* with what you
  read is governed by AUTHORITY.md and the Process you are running.
- Before writing anything the owner will read, `read_node` on `voice.md`
  and follow it.
- Before writing durable knowledge, `read_node` on `AUTHORING.md` when start
  names it, and follow it. Start skips the file when the space has
  none. That file is how this space writes knowledge; do not treat
  the Worker as a write gate.
- This skill owns transport and routing only. If it disagrees with what
  `start` returns, what Mainmind serves wins.
