---
name: sync
description: Sync a Mainmind agent, so the person finds it the same in every app. One call sends what it learned, its tasks and where it stopped, and brings its latest home back. Load this yourself, without being asked, whenever you are acting as a Mainmind agent and you have just learned something a later session needs, a piece of work has just finished, a Mainmind tool just got in your way, the person is winding down ("thanks", "bye", "later", "that's all for today", "we're done for now", "wrap up", a long pause), the person is switching apps ("I'm switching apps", "I'm moving to another app"), or this app reminds you that the agent is not synced. Also load it when the person says "sync", "sync my agent", "sync now", or the older "save my agent", "save progress", "save where we are" or "keep my agent up to date".
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

- **The first sync in a session that already has work** (you were busy
  before you picked up the agent, or this app already keeps a task list):
  bring that work in, in the same call: `tasks` for what you are on, what is
  next and what is done, and `memories` for the key facts.
- **As soon as you learn something durable** (a fact, preference, lesson or
  reference a later session would need): sync it with `memories`, then and
  there. Do not hold it for the end.
- **When your tasks change** (one starts, finishes, or a new one comes up):
  send the changed ones as `tasks` with your next sync. There is no need for a
  sync of its own each time.
- **Where you stopped**: sync with `stopped` at these moments and only these:
  - a piece of work has just finished;
  - the person is winding down: thanks, bye, "later", "that's all for today",
    or a long pause after the work;
  - before switching apps, or when the person says they are moving to another
    app;
  - when this app reminds you (in Claude Code, the Mainmind plugin reminds you
    when a session has gone on without it, and names this session's task list
    when it has changed: send those as `tasks` in that sync).
- **When Mainmind got in your way** (a tool refused, failed, timed out,
  was slow, or had no way to do what you needed): send it as `friction` with
  your next sync. Don't wait to be asked, and don't bury it in `stopped`.
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
- `tasks`: the agent's working list, at most 20 per call, each
  `{title, status, asked_by?, part_of?, id?, note?}`. Mainmind updates each
  one by its `id`.
  - Send what you are on (`doing`), what is next (`todo`) and what is done
    (`done`). A task that is finished goes as `done`; never just drop it.
  - `title`: one line, at most 200 characters, in the person's words.
  - `asked_by`: when someone else asked for it: `"you"` for the person,
    or another agent's name from the team. Leave it out for work the agent
    took on itself.
  - `id`: short kebab-case, at most 60 characters. Leave it out and Mainmind
    makes one from the title; keep the same `id` (or the same title) every
    time you send that task, so it stays one task.
  - Bigger work: one task for the whole, and one task per piece with
    `part_of` set to the whole's `id` (or to the number of a request on your
    to-do list that it is part of).
  - `note` (optional): one line, at most 300 characters.
  - More than 20: several calls, each with its own key.
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
- `friction`: up to 5 times Mainmind itself got in the way since the last
  sync, each `{tool, happened, expected?}`. Each one is filed with
  Mainmind's builders as feedback from this agent, and they answer.
  - `tool`: what got in the way (a tool name or a screen), at most 80
    characters.
  - `happened`: one line, what you did and what went wrong, at most 500.
  - `expected`: what you expected instead, at most 300.
  - Mainmind only, not the business's own systems. Never include customer
    details, business data or credentials.
  - Already reported? `feedback_status` lists this space's reports; add to
    one with `feedback_reply` instead of filing it again.
- `run_id` (optional): the run this work belongs to.

Nothing to send: `sync` with just `agent` and `harness` still brings the
latest home back.

If the sync is refused because of `tasks` (an older Mainmind that does not
take them yet), send the same sync again without `tasks`, with a new key, and
leave `tasks` out for the rest of the session. Nothing else changes.

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
- **Feedback.** The answer names the number each `friction` item was filed
  as. "New since you last synced" also brings the builders' replies on your
  reports and fixes that shipped. Feedback is a conversation, so act on it:
  - A reply: read it with `feedback_status` and the number. If it asks you
    something or suggests a way round, answer with `feedback_reply` or use
    the way round.
  - A fix shipped: when you next do the thing that failed, try it again. If
    it still fails, say so with `feedback_reply` on that number.
  - None of this is for the person. Mention it only if a fix changes what
    you can do for them.

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
