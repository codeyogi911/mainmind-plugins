---
name: make-an-agent
description: Make a new standing agent that lives in Mainmind and that the person can continue with in any AI app. Load when the person says "make me an agent that…", "create an agent", "set up a bot for…", "I want an assistant that…", "build me an agent", or any request for a new agent with its own job, limits or schedule.
---

# Make an agent

**Talk to the person in plain words. Never name tools, files, folders, IDs, commits or settings. The one word for keeping an agent the same in every app is "sync": say "Synced", "All synced.", "I remember", "where we left off", "my instructions", "my schedule". Never say "save", "saved", "get your agent", "bring back", "restore", "export", "handoff", "commit", "branch", "push", "pull" or "Git".**

Everything below the questions is your work, not theirs. The person answers at
most three questions and sees one summary. They never see a slug, a path, a
proposal or a tool.

If the connection has no `sync` tool yet, use `boot` with `agent` where this
says to pick up and `agent_home` `remember` where it says to sync memories.

## 1. Ask at most three questions

Ask only what their first message did not already answer, in one message:

1. What should it do?
2. What must it never do without asking you first?
3. Should it do anything on a schedule? (for example, every weekday at 8)

Take whatever they say. Anything they leave out becomes a default you show on
the summary card, never a follow-up question. Pick a short, plain name from the
job ("Job Hunter", "Inbox Keeper") unless they gave one.

## 2. Set it up (silently)

1. **`boot`** with `session_kind: "persistent"` and `harness` set to this app
   (`claude-code`, `claude-ai`, `codex`, `cursor`, `grok-bot`; any other app,
   including ChatGPT and Muse, is `byo`). Obey what boot returns.
2. **Reuse before you register.** If `agents_you_can_resume` already lists an
   agent with this name (or one that plainly does this job), ask once: "You
   already have <Name>. Change that one, or make a new one?" Reuse means
   carrying on with its slug; skip to step 4. For a Founder, boot also lists
   `agents_you_can_take_over`: agents already in the space that no one
   has taken over, with their jobs. If one of them plainly does this job, even
   under a slightly different name (Books Steward for Books), ask once: "<Old
   name> already does this job. Use it?" On yes, `adopt_agent` with its
   `agent` and `agent_epoch`, keep that slug and skip to step 4.
3. **`register_agent`** with `name`, a one-sentence `charter` (the job, in the
   person's words), and a `registration_key` that is a fresh UUID v4 you choose
   *before* the call. Keep that key and the exact name and charter for the rest
   of this session. If the call fails or the answer is lost, retry with the
   same key and the same details, never a new key. Never register again on a
   restart or in a later session: a later session finds the agent through
   `agents_you_can_resume` and reuses it. Keep the returned profile slug; pass
   it as `agent` on every call that accepts it from here on. If it answers
   that an agent with this name already exists, do not pick a new name to get
   round it: continue with yours, or, when it says to take one over, ask once
   and `adopt_agent` with the agent and agent_epoch it names. Only a Founder
   can take one over: if the answer says to ask a Founder, or that someone
   else's agent has the name, stop and tell the person in one plain line.
4. **`sync`** with `agent: <slug>` and the same `harness` to pick the agent
   up. Read the home it returns. `missing: ["no_home"]` or `["no_agent_md"]`
   is expected for a new agent.
5. **`run_start`** with `agent`, `harness`, and `task` such as "Write
   <Name>'s instructions and schedule for its owner's yes". Keep the
   `run_id` and the private `control_key`.
6. **`propose_change`** with that `run_id` and `control_key`, and `agent` when
   the call accepts it. One proposal holds every file:
   - `agents/<slug>/AGENT.md` (create), from the template below.
   - One `agents/<slug>/routines/<id>.md` (create) per schedule they asked
     for. None if they did not ask.

   Fill the proposal's person-facing fields in plain words: `ask` ("Set up
   <Name> with these instructions and this schedule?"), `act_label` ("Set up
   <Name>"), `stake` (at most 14 words), `eli5` (40 to 600 characters, no
   code or identifiers), `becomes` (what will be true), and `blast_radius`
   with exactly one of each pair: `reversible`, `no_money`, `one_file` or
   `many_files`, `once` or `recurring` (recurring when it has a schedule).
7. **`sync`** with `memories` for anything the person told you about
   themselves or the job that is a fact or preference, not an instruction
   (see "Keeping what they told you"). Nothing to keep is fine; skip it.
8. Read back: check each memory is in the home `sync` returned ("Synced."
   with no "except"), and confirm the proposal came back with a `decision_key`.
   Do not report anything as done that you have not read back.

## AGENT.md template

Flat frontmatter only: scalar keys and scalar lists, no nesting, no `#`
comments. Omit `role`, `skills`, `works_on` and `needs` when you have nothing
real for them; never invent a path.

```markdown
---
id: agent
type: agent
agent: <slug>
name: <Name>
state: active
access-scope: core
write-class: conserved
skills:
  - <processes/… that already exist in this space and match the job>
works_on:
  - <records/… paths it will work from, if any>
needs:
  - <connection names only, e.g. gmail; never a secret>
boundaries:
  - Ask before anything that spends, sends or signs.
  - <each "never without asking" from their answer, in their words>
---

# <Name>

<The job in the person's own words, then how it should work: tone, what
"done" looks like, what to check first. At most 8 KB.>
```

- `boundaries` always includes "Ask before anything that spends, sends or
  signs." Add each thing they named. Boundaries restate limits; they never
  widen what the agent may do.
- `skills`: use `find_process` with the job's wording and list only
  Processes that exist and you can read. None is fine.
- `access-scope` is `core` unless boot or the person's space says otherwise.

## Routine template (one file per schedule)

```markdown
---
type: agent-routine
routine: <kebab-case-id>
when: <five-field cron, e.g. 0 8 * * 1-5>
timezone: <IANA name, e.g. Asia/Kolkata; ask boot or the person only if unknown>
do: <a Process path, or one plain instruction line>
state: active
access-scope: core
write-class: conserved
---

<Optional notes for the session that runs it, at most 2 KB.>
```

At most 20 schedules. Add `needs:` as a scalar list when the routine needs a
connection.

## Keeping what they told you

`sync` with `agent: <slug>`, `harness`, `idempotency_key` (8 to 96
characters, letters, digits and hyphens; reuse it on a retry), and `memories`:
1 to 20 items of `{name, description, memory_kind, body}`.

- One fact per memory. `name` kebab-case, at most 60 characters. `description`
  one line, at most 200 characters. `memory_kind` is `preference`, `fact`,
  `lesson` or `reference`. `body` at most 4 KB; say why and how to apply it.
- A new agent has no memories, so no `expected_sha` is needed.
- Instructions ("always write formally") belong in `AGENT.md`, not memory.
  Facts and preferences ("I'm based in Pune", "never Bangalore roles") belong
  in memory.
- Never keep passwords, keys or tokens. The server refuses them too.

## 3. Show one summary card

One short block, nothing before it:

> **<Name>**
> **Job:** <one line>
> **Always asks you first:** <the boundaries, "anything that spends, sends or signs" first>
> **Schedule:** <"every weekday at 8 (India time)", or "none">
> **Yes to this?**

Then say, exactly:

> <Name> is ready. Say "Continue with <Name>" in any app.

From here on <Name> syncs on its own (the sync skill); never tell the person
they have to do anything for that.

If the app can show a card or a button, use it. When they say yes (or no), record
it at once with `decide`: the `decision_key`, `agent`, their exact words in
`words`, and where they said it in `said_in`. Their answer here is enough.
Anything you chose for them (the name, a default limit, a time zone) is on the
card, not asked about. Do not mention the approval mechanics, the slug or where
anything is stored.

## When something is not available

- If this connection has neither `sync` nor `agent_home` yet, still register
  and propose, and tell the person in one line: "I couldn't sync what you told
  me to <Name> from this app yet; I've put it in <Name>'s instructions
  instead" (and do so, where it is an instruction), or that it did not sync.
- If a call refuses an argument this skill names (for example `harness` on
  `boot`, or `agent` on `propose_change`), retry once without it. Tell the
  person only what they lose, in plain words, if anything.
- A refusal or an uncertain result is never reported as done. Retry it
  yourself; if it still fails, say plainly what was not kept and that you will
  try again. Never ask the person to do anything to keep it.
