---
name: save-my-agent
description: Save a Mainmind agent's progress so it can be brought back in any app. Load when the person says "save my agent", "save progress", "save where we are", "I'm switching apps", "I'm moving to another app", "that's all for today", "we're done for now", "wrap up", or is clearly ending a session while acting as a Mainmind agent.
---

# Save my agent

**Talk to the person in plain words. Never name tools, files, folders, IDs, commits or settings. Say "I remember", "where I stopped", "my instructions", "my schedule", "saved".**

Two writes, then read both back, then one sentence. The person should not wait
through narration.

## 0. Know which agent

You are saving the agent this session is acting as: the `agent` slug you
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
there but has changed). Skip anything already saved unchanged, anything only
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

If this session holds an assignment, save its checkpoint with `work_session`
as usual too; the handoff does not replace it.

## 3. Read back

Before saying anything is saved:

- `read_node` the journal entry and each memory the receipts name, or `boot`
  again with `agent: <slug>` and check the new memories are in the index and
  the handoff is the newest entry in `recent_journal`.
- A receipt of `refused` or `uncertain`, or a read-back that does not match,
  is not saved. Retry `uncertain` once with the same `idempotency_key`; it
  returns `recovered` when the write had landed.
- A refusal marked `retry: true` means Mainmind was catching up with another
  change and nothing was saved. Wait a few seconds and send the same call
  with the same `idempotency_key` once more.
- Count the agent's active memories from the fresh index. If the index is
  marked truncated, the count is "at least" that number.

## 4. Say it

Exactly this shape, one line, nothing before it:

> Saved. <Name> remembers <n> things about you and knows where it stopped: <one line>.

`<one line>` is the most important `next` item or open question, said to the
person ("the Stripe letter is waiting for your review"). If they said they are
switching apps, add: "Say \"bring back <Name>\" there to carry on."

If something could not be saved, say what was kept and the one thing to do:
"I saved where I stopped, but not the two new things you told me. Say \"save my
agent\" again in a minute." If this connection has no way to save to the agent
yet, say so plainly; never claim it and never quietly fall back to this app's
own memory.
