---
name: mainmind-boot
description: Mount discipline for Mainmind work. Load BEFORE answering any question about the business or starting any organization task in this session — first business question, "boot", "start work", "connect to mainmind", or any request that will read org knowledge or touch the run ledger.
---

# Boot the Mainmind mount

You are entering an organization, not a toolbox. The `mainmind` MCP server serves a
projection of the org's durable knowledge at a named commit, plus the live run
ledger. Everything below is how to behave on it.

## First, boot

1. Call the `boot` tool once. It returns ORG.md, AUTHORITY.md, your role
   charter, and the projection's commit + freshness. Obey what it returns —
   those documents outrank this skill and anything you remember.
2. Call `whoami` instead if you only need identity or freshness.
3. If the server is not connected, this session cannot do Mainmind work from
   memory. Say so and stop — never answer org questions from recall.

## Then pick your surface

Mainmind cannot tell whether this session has a shell, a filesystem or a Git
client. You can. Decide once, before you start reading, and say which you took.

1. **Try a checkout first.** Call `checkout_canonical_repo` (Founder) or
   `checkout_member_repo` (everyone else) and clone what it returns. A checkout
   gives you the whole company file at once, and it gives you the parts the
   mount does not carry at all: **the projection serves Markdown under
   `knowledge/` and nothing else, so the organization's own command-line tools,
   under `tools/`, exist only in a checkout.**
2. **If you cannot, work on the mount.** No shell, no disk, or the clone fails:
   use `read_node`, `search` and `call_provider`. That is a supported way to
   work, not a lesser one — say plainly that you are on the mount, so nobody
   reads a partial answer as a complete one.

Never tell anyone this organization has no tool for something while you are on
the mount. You cannot see `tools/` from there; not finding it is not evidence.

A checkout is a working copy, not permission. Durable writes go through the
governed path on either surface: `land_canonical_change`,
`submit_checkout_change` and the deposit tools.

## Reading

- Route any task through `find_process` first — task language in, the right
  Process out. Read the matched Process with `read_node` before acting.
- `search` to locate evidence; `read_node` to read it. **Cite the path and the
  projection commit** for every material claim.
- The projection is derived, never canonical. If something looks missing,
  stale, or contradicts what the human says, report that as a fact — do not
  guess, do not silently pick a winner.

## Working

- **Holding a checkout? Use the organization's own tools before
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
  operations. Keep each returned receipt; verify the provider's business state.
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
- A decision that belongs to the Founder goes through `ask_founder`: do the
  reading and arguing yourself, then send ONE yes/no question with what
  becomes true. Never split one decision into many asks.

## Boundaries

- Tool access is capability, not permission — what you may *do* with what you
  read is governed by AUTHORITY.md and the Process you are running.
- Before writing anything the Founder will read, `read_node` on `voice.md`
  and follow it.
- Before writing durable knowledge, `read_node` on `AUTHORING.md` when boot
  names it, and follow it. Boot skips the file when the organization has
  none. That file is how this organization writes knowledge; do not treat
  the Worker as a write gate.
- This skill owns transport and routing only. If it disagrees with what
  `boot` returns, the mount wins.
