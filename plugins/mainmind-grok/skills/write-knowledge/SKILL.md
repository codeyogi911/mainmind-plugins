---
name: write-knowledge
description: Write or change a page in a Mainmind space so a person and an AI can both follow it. Load this yourself, without being asked, before you save or propose any lesson, skill, decision, fact, gap or work note, or change one, and whenever the person asks you to write down, record, document or improve how something is done.
---

# Write knowledge

**Talk to the person in plain words. Never name tools, files, folders, IDs or settings.**

A space is a folder of pages. The same page is read by the person and by
their AI, so write it once, for a newcomer. Mainmind checks new and changed
skills and decisions when they are saved and sends back any line that needs fixing.

## Pick the page type

| Type | Holds | Where | Who may change it |
|---|---|---|---|
| Work note | One piece of work: what was asked, what was done, what happened | `work/` | Only the session that did the work |
| Lesson | What work taught, and the page it should improve (`applies-to`) | `lessons/` | Anyone adds one; it never changes once saved; folding it in needs the owner's yes |
| Fact or record | Something true about the world, with its source and date | `records/<type>/` | As the type says |
| Gap | Something missing that work ran into | `records/gaps/` | Anyone; closing it needs the owner's yes |
| Skill | How one kind of work is done | `skills/<name>/SKILL.md` | The owner's yes |
| Decision | What the owner decided and why | `decisions/` | Written when the owner rules |

One thing per page. Link to a page instead of copying it. Name where each
fact came from, and its date. To correct a page, add to it or replace it;
don't erase the history.

## Write it plainly

- **Say what it is for and when to use it, in one line.** For a skill, that
  line is the `description`: "Pay a supplier's invoice after checking it. Use
  when an invoice is due."
- **Lead with what you get.** Then when to use it, the steps, when it is
  done, and what to do if something goes wrong.
- **One action per step.** Number the steps and start each with a verb.
- **Keep sentences short.** Most under 25 words, none over 40.
- **Use everyday words,** the ones the person would use. When Mainmind finds
  one of its own system words, it names a plainer one to use.
- **Keep every fact exact.** Plain words never drop an amount, a date, a
  limit or an approval.
- **Draw it when words aren't enough.** A skill with branches or handoffs can
  add a diagram as a `mermaid` block. The skill's page draws it, and an AI
  reads the same text.

## Write a decision

A decision answers "what did we decide, and why?", so it says that first,
the way you would explain it to a new teammate:

- **Title:** the question, in everyday words. "How much import duty should
  we plan for on milk pitchers?"
- **`## What we decided`:** the answer in one or two sentences, 35 words or
  fewer, with no codes or abbreviations. Say what a number means: "Plan for
  about 22% import duty on milk pitchers, not the 10% we use for grinder
  parts."
- **`## Why`:** one or two sentences.
- **`## Until when`** or **`## What changes`:** how long it holds, or what
  anyone now does differently.
- **`## The details`:** every code, rate, source and link, exactly. The app
  folds this away, so the person reads the first parts and you still have
  everything.

Mainmind sends back a new decision without a plain answer, with codes in
the answer, or without a Why.

## Save it

Say the result in plain words. The route below is yours, not theirs.

- A page, record, gap, work note or new lesson is saved by committing its
  file and pushing it. The owner pushes to `main` with `shell` or a checkout.
  Another member pushes a branch from `checkout_member_repo` in a terminal and
  lands it with `land_scoped_change`. Mainmind checks the push and answers
  file by file. Read a file first with `search` and its path.
  - Lesson: `lessons/<today>-<a-few-words>.md`, with today's date on the
    space's clock and lower-case hyphenated words. Frontmatter: `id` (the file
    name without `.md`), `type: Lesson`, `status: stable`, `state: pending`,
    `date` (today), `source-process` (a Process id), `access-scope: core` (or
    another scope you hold), `write-class: ledger` and `applies-to` (the path
    it would improve, or `unresolved`). Then a `#` title and `## What
    happened`, `## What it teaches`, `## Where it applies` (the `applies-to`
    value and nothing else) and `## Evidence` (one `-` line per piece).
    Never change or remove a saved lesson.
  - Fact or record: `records/<kind>/<name>.md`, in a Record Kind that already
    exists.
  - Gap: `records/gaps/<day>-<title>.md`. Do not disguise a hole as a lesson.
  - Work note: `work/<today>-<a-few-words>.md`. Only the session that did the
    work changes it later.
  - Page: `pages/<name>.md`.
- A problem in one page, without changing the rule: comment on it with
  `add_page_collaboration` (`kind: "comment"`), or fix the page and push it.
- Mainmind itself got in the way (a tool broke its contract, was slow, fought
  you, or could not do what you needed): `feedback`, with `kind` (`bug`,
  `slow`, `friction` or `gap`) and `message`. That is not a comment on a
  page. Leave out customer details, business data and credentials.
- A skill, or any other ruled or conserved file: `change`, as `mainmind-start`
  says. The owner is asked in this chat and says yes before it changes how
  work is done. Tell them in one line what you asked. If this server has no
  `change`, fall back to `propose_change`.
- If Mainmind sends lines back to fix, fix exactly those, keep every fact,
  and send or push again. Don't ask the person to fix them.

The full guide is the Mainmind docs page "How your knowledge grows"
(`mainmind://docs/knowledge-format`).
