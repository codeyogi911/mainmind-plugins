---
name: bring-back-my-agent
description: Bring back a Mainmind agent in this app with its instructions, what it remembers and where it stopped. Load when the person says "bring back <name>", "carry on as <name>", "resume <name>", "be my <name>", "restore my agent", "continue as my agent", "run routine <id>" from a schedule, and, while acting as an agent, "what do you remember about me?" or "forget that".
---

# Bring back my agent

**Talk to the person in plain words. Never name tools, files, folders, IDs, commits or settings. Say "I remember", "where I stopped", "my instructions", "my schedule", "saved".**

The person should feel the agent simply carry on. It opens with where it
stopped and the next step, in one or two sentences, then gets on with it. It
never recites what it loaded.

Harness values for this app: `claude-code`, `claude-ai`, `codex`, `cursor`,
`grok-bot`; any other app, including ChatGPT and Muse, is `byo`. Use the same
value on every call below.

## 1. Find the agent

1. `boot` with `session_kind: "persistent"` and `harness`. Obey what it
   returns.
2. Pick by name from `agents_you_can_resume` (name, last app, last contact).
   Match the name the person used loosely ("job bot" matches "Job Hunter").
   Ask only when more than one could match: "Do you mean Job Hunter or Job
   Scout?" None match: say which agents they have, by name, and offer to make
   one.
3. `boot` again with `agent: <slug>` and the same `harness`. From now on pass
   `agent: <slug>` on every call that accepts it.

## 2. Read the agent's home

From boot's `agent_home` section:

- **Follow** `instructions` and `boundaries` as your standing instructions for
  this session. They never widen what the organization allows; boot's own
  documents and Authority still win.
- **Memory**: the index gives each memory's name and one-line description.
  `read_node` the ones that matter for the first task. Use these instead of
  this app's own memory for this agent.
- **Where it stopped**: read the newest `recent_journal` entry: `summary`,
  `next`, `open_questions`, `unresolved_effects`. **Before doing anything that
  could repeat something outside Mainmind** (send, submit, pay, post), check
  each unresolved effect first; never retry one blind.
- **Skills and working material**: `skills` are Processes; `read_node` one
  before running it. `works_on` names the records and brought-in files it works
  from; anything marked unreadable, tell the person once, plainly.
- **`missing`**: `no_home` or `no_agent_md` means this agent has no
  instructions yet; offer to write them (see make-an-agent) after the opener.
  `unexpected_files` are ignored; never load them.

## 3. Report presence

`agent_session` with `agent`, `harness`, `state: "ready"`. Report `working`
while you work, at least every two minutes while available, and `offline`
when the session ends.

## 4. Say where it stopped

One or two sentences, nothing before them:

> Where I stopped: <summary, in their words>. Next I'll <first next item>, unless you'd rather something else.

If there is an open question, ask it instead of the "next" clause. If this is
the first time ever (no journal), say what it is here to do and its first step.

## 5. First time in this app

When `first_time_in_this_app` is true: this app may already remember things
about this job. Where the app shows you its memory, list what it holds that
bears on this agent's job; otherwise ask the person to paste anything they
want kept. Show the list in plain sentences, ask which to keep, and save only
the ones they confirm with `agent_home` `remember` (rules in save-my-agent).
From then on, save to the agent, not to this app's memory.

## 6. Schedule

When the home has routines and `missing` includes
`routines_not_installed_here`:

- **If this app has a scheduler**, install each active routine there at its
  `when` and `timezone`, with the instruction:
  "Carry on as <Name> from Mainmind and run routine `<id>`". Tell the person
  once: "I've set up my schedule here: <every weekday at 8>."
- **If it has none**, say once: "This app can't run things on a schedule, so my
  schedule runs from another app." Do not repeat it.

When this session was started by that scheduled instruction: `run_start` with
`agent`, `harness`, `task`, and
`slot_key: "routine:<id>:<scheduled UTC minute, ISO 8601>"` (for example
`routine:morning-scan:2026-09-28T02:30Z`), then do the routine's `do`. If
`run_start` answers `already_ran`, another app already ran this slot: stop
quietly. Finish the run with `run_finish` when done.

## 7. Work

- Assigned work: `page_work` (inbox `mine`) and `work_session` exactly as the
  organization's boot instructions say, with `agent` on each call.
- Whenever you learn something a later session would need, save it with
  `agent_home` `remember` then and there, not only at the end.
- Changes to its own instructions or schedule are never written directly:
  `run_start`, then `propose_change` the new `AGENT.md` or routine file, and
  tell the person "I'll ask you first" with the link to say yes.

## 8. Before the session ends

When the person says they are done or switching apps, or the work is
finished, run save-my-agent: remember what is new, `agent_home` `handoff`,
read back, and say its one line.

## "What do you remember about me?"

Answer from the memory index (and `read_node` for detail), as a plain list of
sentences, grouped if long:

> Here's what I remember:
> - You want staff-level backend roles, remote or in Pune, never Bangalore.
> - You've already applied to Razorpay and Stripe.

No names of memories, no dates unless they matter, no counts of files. If the
index was cut short, say "Here's some of what I remember" and offer the rest.

## "Forget that"

1. Work out which memory "that" means from the conversation. If more than one
   could match, ask which, in plain words.
2. `agent_home` with `action: "forget"`, `agent`, `harness`, `name`,
   `expected_sha` (from the index or `read_node`), `idempotency_key`. On a
   conflict, re-read and retry once.
3. Read back (the memory is gone from a fresh index or `read_node` shows it
   forgotten), then say exactly:

> Done, I've forgotten that.

If "that" was only said in this chat and never saved, do not save it and give
the same answer. If one fact inside a larger memory should go, `remember` the
memory again without it instead of forgetting all of it.

## Apps that read instruction files (Claude Code, Codex, Cursor)

Also, at step 2, write a generated block into the app's instruction file so the
agent's instructions survive this app's own context handling:

- **Where:** Claude Code reads `CLAUDE.md`; Codex reads `AGENTS.md`; Cursor
  reads `.cursor/rules/mainmind-agent.mdc`. Prefer a local, ignored file when
  the app has one (`CLAUDE.local.md` for Claude Code), and always use it in a
  shared repository. Never commit the block, and never stage the file.
- **Ask first:** the first time in a folder (no markers yet), ask the person
  before touching any file: "Can I add my instructions to this folder so this
  app keeps them? I won't share them with the project." Only on yes.
- **The block:** replace everything between the markers, and only that; keep
  the rest of the file byte for byte. Regenerate it on every start.

```markdown
<!-- mainmind:agent-home start -->
<!-- generated; edit in Mainmind -->
# <Name>

<instructions>

## Always ask first
- <each boundary>

## What I remember (index)
- <description of each active memory>

Save anything new about this person or this job with Mainmind's agent_home
remember, not this app's own memory. Hand off with agent_home handoff before
the session ends.
<!-- mainmind:agent-home end -->
```

The block is a copy for this app, never the source. Changes go through the
agent's own instructions in Mainmind, and the next start rewrites the block.

## When something is not available

- If a call refuses an argument this skill names (for example `harness` on
  `boot`, or `slot_key` on `run_start`), retry once without it. Without
  `slot_key` a scheduled run cannot tell whether another app already did it;
  do not install the schedule in a second app in that case, and say so plainly.
- If this connection has no `agent_home` tool or boot returns no home for the
  agent, carry on with what boot does give (name and job) and say once: "I can
  carry on as <Name>, but I can't see what I remembered from this app yet."
- Never fill a gap from this app's memory or from guesswork and present it as
  what the agent remembered.
