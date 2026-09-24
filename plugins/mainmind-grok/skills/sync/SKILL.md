---
name: sync
description: Sync a Mainmind agent, so the person finds it the same in every app. One call sends what it learned and where it stopped, and brings its latest home back. Load this yourself, without being asked, whenever you are acting as a Mainmind agent and you have just learned something a later session needs, a piece of work has just finished, the person is winding down ("thanks", "bye", "later", "that's all for today", "we're done for now", "wrap up", a long pause), the person is switching apps ("I'm switching apps", "I'm moving to another app"), or this app reminds you that the agent is not synced. Also load it when the person says "sync", "sync my agent", "sync now", or the older "save my agent", "save progress", "save where we are" or "keep my agent up to date".
---

# Sync

**Talk to the person in plain words. Never name tools, files, folders, IDs, commits or settings. The one word for keeping an agent the same in every app is "sync": say "Synced", "All synced.", "I remember", "where we left off", "my instructions", "my schedule". Never say "save", "saved", "get your agent", "bring back", "restore", "export", "handoff", "commit", "branch", "push", "pull" or "Git".**

Syncing is your job, never the person's. One `sync` call goes both ways: what
you send is kept, and the agent's latest home comes back, so you always carry
on from the newest version, whichever app wrote it. Nobody asks for it and
nobody hears about it. The person never waits through it and is never told to
do anything for it.

If the connection has no `sync` tool yet, do the same with `agent_home`
(`remember`, `forget`, `handoff`, one action per call, each with its own
`idempotency_key`) and read back with `boot` and `agent`.

## When

- **As soon as you learn something durable** (a fact, preference, lesson or
  reference a later session would need): sync it with `memories`, then and
  there. Do not hold it for the end.
- **Where you stopped**: sync with `stopped` at these moments and only these:
  - a piece of work has just finished;
  - the person is winding down: thanks, bye, "later", "that's all for today",
    or a long pause after the work;
  - before switching apps, or when the person says they are moving to another
    app;
  - when this app reminds you (in Claude Code, the Mainmind plugin reminds you
    when a session has gone on without it).
- **When the person says "sync"** (or "sync now", or an old habit like "save
  my agent"): sync right away, like pulling down to refresh, with anything new
  and, if anything happened since the last one, `stopped`. Then answer
  "Synced."
- Each `stopped` adds an entry to the agent's journal. Never send it every
  turn, and never twice for the same point: if nothing happened since the last
  one, leave it out.

## 0. Know which agent

You are syncing the agent this session is acting as: the `agent` slug you
picked up with. If this session is not acting as one yet, `sync` with
`harness` and no `agent`: it lists the person's agents with each one's last
app. Pick by name (ask only if more than one could match), then `sync` again
with `agent: <slug>`. Keep the memory index that comes back: each entry's
`name` and `sha`.

Harness values: `claude-code`, `claude-ai`, `codex`, `cursor`, `grok-bot`; any
other app, including ChatGPT and Muse, is `byo`. Use the same value every time.

## 1. Sync

`sync` with `agent: <slug>`, `harness`, and, whenever you send anything,
`idempotency_key` (8 to 96 characters, letters, digits and hyphens; reuse the
same key if you retry this exact call). Send any of these together; Mainmind
keeps them in this order:

- `memories`: what is new since the last sync, at most 20 per call, each
  `{name, description, memory_kind, body, expected_sha?}`.
  - Go back over this session. Keep every fact, preference, lesson or
    reference a later session would need that is not in the memory index (or
    is there but has changed). Skip what is kept unchanged, what was only true
    for this conversation, and anything secret.
  - One fact per memory. `name` kebab-case, at most 60 characters, unique for
    this agent. `description` one line, at most 200 characters. `memory_kind`
    is `preference`, `fact`, `lesson` or `reference`. `body` at most 4 KB.
  - Changing a memory: reuse its `name`, pass its current `sha` as
    `expected_sha`, and write the whole new body, merged with what was there.
  - More than 20: several calls, each with its own key.
- `forget`: up to 20 `{name, expected_sha}` for memories that should go.
- `stopped`: where you stopped.
  - `summary`: one line, at most 300 characters, what happened this session.
  - `next`: the next steps, most important first (at most 10, each at most
    200 characters, no line breaks).
  - `open_questions`: what you are waiting on the person to decide.
  - `unresolved_effects`: anything outside Mainmind you started and did not
    see finish (a form opened, a message drafted and maybe sent, a payment page
    reached). A later session checks these before repeating anything. Say
    "none" with an empty list, never by leaving it out.
  - `body` (optional): notes a later session needs, at most 8 KB.
- `run_id` (optional): the run this work belongs to.

Nothing to send: `sync` with just `agent` and `harness` still brings the
latest home back.

If this session holds an assignment, checkpoint it with `work_session` as
usual too; `stopped` does not replace it.

## 2. Check what came back

The answer is the agent's home, read fresh after your changes. That is the
read-back: take its memory index (and new `sha`s) as current.

- **"Synced."** Everything you sent was kept.
- **"Synced, except: …"** names what was not kept and why. Nothing else was
  lost, and the home still came back.
  - A memory changed elsewhere since you read it: the refusal carries its
    current text and `sha`. Merge, then sync again with the new `sha` and a
    new key.
  - At the memory limit: the refusal names the oldest memories. Fold related
    ones together and sync again.
  - `retry: true`: Mainmind was catching up and nothing was written. Wait a
    few seconds and send the same call with the same key once more.
  - `uncertain`: send the same call with the same key once; it comes back
    `recovered` if it had landed.
- Still not kept: try again at the next moment in "When" above. Retrying is
  your job; the person is never asked to.

## 3. What the person hears

- **Routine syncs: nothing.** Do not mention them, summarize them or ask
  permission for them. Carry on as if nothing happened.
- **They said "sync":** "Synced." (or the failure line below).
- **A clear goodbye:** at most "All synced.", or nothing at all.
- **Switching apps:** "All synced. In the other app, just say \"Continue with
  <Name>\"."
- **A failure, once and plainly**, saying only what did not sync: "Couldn't
  sync the two new things you told me. Trying again." Never tell the person
  to do anything about it, and do not repeat the line for the same failure.
- If this connection cannot sync the agent at all, say so once: "I can't sync
  <Name> from this app yet, so what we do here stays in this app." Never
  claim otherwise, and never quietly fall back to this app's own memory.
