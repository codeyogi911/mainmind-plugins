---
name: keep-my-agent-up-to-date
description: Keep a Mainmind agent up to date on its own, silently, so the person can continue with it in any app. Load this yourself, without being asked, whenever you are acting as a Mainmind agent and a piece of work has just finished, the person is winding down ("thanks", "bye", "later", "that's all for today", "we're done for now", "wrap up", a long pause), the person is switching apps ("I'm switching apps", "I'm moving to another app"), or this app reminds you that the agent is not up to date. Also load it if the person says "save my agent", "save progress" or "save where we are".
---

# Keep my agent up to date

**Talk to the person in plain words. Never name tools, files, folders, IDs, commits or settings. Say "I remember", "where we left off", "my instructions", "my schedule", "up to date". Never say "save", "saved", "bring back" or "restore".**

This is your job, never the person's. Nobody asks for it and nobody hears
about it: you remember, you hand off, you read both back, and you carry on.
The person never waits through it and is never told to do anything for it.

## When

- **As soon as you learn something durable** (a fact, preference, lesson or
  reference a later session would need): step 1, then and there. Do not hold
  it for the end.
- **Where you stopped**: steps 1 to 3, at these moments and only these:
  - a piece of work has just finished;
  - the person is winding down: thanks, bye, "later", "that's all for today",
    or a long pause after the work;
  - before switching apps, or when the person says they are moving to another
    app;
  - when this app reminds you (in Claude Code, the Mainmind plugin reminds you
    when a session has gone on without a handoff).
- Each handoff adds a new entry to the agent's journal. Never hand off after
  every message, and never twice for the same point: if nothing happened since
  the last handoff, skip it.

## 0. Know which agent

You are updating the agent this session is acting as: the `agent` slug you
booted with. If this session never booted as an agent, `boot` with
`session_kind: "persistent"` and this app's `harness`, pick the agent by name
from `agents_you_can_resume` (ask only if more than one could match), and
`boot` again with `agent: <slug>`. Keep the memory index boot returned: each
entry's `name` and `sha`.

Harness values: `claude-code`, `claude-ai`, `codex`, `cursor`, `grok-bot`; any
other app, including ChatGPT and Muse, is `byo`.

## 1. Remember what is new

Go back over this session. Collect every fact, preference, lesson or reference
a later session would need and that is not already in the memory index (or is
there but has changed). Skip anything already kept unchanged, anything only
true for this conversation, and anything secret.

`agent_home` with `action: "remember"`, `agent: <slug>`, `harness`,
`idempotency_key` (8 to 100 characters, letters, digits and hyphens; reuse the
same key if you retry this exact call), and `memories`: at most 20 per call,
each `{name, description, memory_kind, body, expected_sha?}`.

- One fact per memory. `name` kebab-case, at most 60 characters, unique for
  this agent. `description` one line, at most 200 characters. `memory_kind` is
  `preference`, `fact`, `lesson` or `reference`. `body` at most 4 KB.
- Updating an existing memory: reuse its `name` and pass its current `sha`
  from the index (or from `read_node`) as `expected_sha`, and write the whole
  new body, merged with what was there.
- If the call refuses with a conflict, it returns the current text and sha.
  Merge, then retry with the new sha. If the agent is at its memory limit, the
  refusal names the oldest memories: fold related ones together and retry.
- More than 20 new items: several calls, each with its own key.
- Nothing new: skip this step.

## 2. Hand off

`agent_home` with `action: "handoff"`, `agent: <slug>`, `harness`,
`idempotency_key`, and:

- `summary`: one line, at most 300 characters, what happened this session.
- `next`: the next steps, most important first (at most 10, each at most 200
  characters, no line breaks).
- `open_questions`: what you are waiting on the person to decide.
- `unresolved_effects`: anything outside Mainmind you started and did not see
  finish (a form opened, a message drafted and maybe sent, a payment page
  reached). A later session checks these before repeating anything. Say "none"
  by passing an empty list, never by leaving one out.
- `body` (optional): notes a later session needs, at most 8 KB.

If this session holds an assignment, checkpoint it with `work_session` as
usual too; the handoff does not replace it.

## 3. Read back, and retry yourself

Before treating anything as kept:

- `read_node` the journal entry and each memory the receipts name, or `boot`
  again with `agent: <slug>` and check the new memories are in the index and
  the handoff is the newest entry in `recent_journal`.
- A receipt of `refused` or `uncertain`, or a read-back that does not match,
  is not kept. Retry `uncertain` once with the same `idempotency_key`; it
  returns `recovered` when the write had landed.
- A refusal marked `retry: true` means Mainmind was catching up with another
  change and nothing was written. Wait a few seconds and send the same call
  with the same `idempotency_key` once more.
- Still not kept: try again at the next moment in "When" above. Retrying is
  your job; the person is never asked to.

## 4. What the person hears

- **Routine updates: nothing.** Do not mention them, summarize them or ask
  permission for them. Carry on with the conversation as if nothing happened.
- **A clear goodbye:** at most one short line, "All up to date.", or
  nothing at all.
- **Switching apps:** "All up to date. In the other app, just say
  \"Continue with <Name>\"."
- **A failure, once and plainly**, saying only what was not kept and that you
  will try again, in the same voice: "I couldn't keep the two new things you
  told me yet; I'll try again." Never tell the person to do
  anything about it, and do not repeat the line for the same failure.
- If this connection has no way to keep the agent up to date at all, say so
  once: "I can't keep <Name> up to date from this app yet, so what we do here
  stays in this app." Never claim otherwise, and never quietly fall back to
  this app's own memory.
