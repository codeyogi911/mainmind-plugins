---
name: write-knowledge
description: Write or change a page in a Mainmind space so a person and an AI can both follow it. Load this yourself, without being asked, before you save or propose any lesson, skill, decision, fact, gap or work note, or change one, and whenever the person asks you to write down, record, document or improve how something is done.
---

# Write knowledge

**Talk to the person in plain words. Never name tools, files, folders, IDs or settings.**

A space is a folder of pages. The same page is read by the person and by
their AI, so write it once, for a newcomer. Mainmind checks new and changed
skills when they are saved and sends back any line that needs fixing.

## Pick the page type

| Type | Holds | Where | Who may change it |
|---|---|---|---|
| Work note | One piece of work: what was asked, what was done, what happened | `work/` | Anyone, freely |
| Lesson | What work taught, and the page it should improve (`applies-to`) | `lessons/` | Anyone; folding it in needs the owner's yes |
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

## Save it

- A work note, lesson, fact or gap is saved straight away.
- A skill, or a change to one, is proposed. The owner says yes before it
  changes how work is done. Tell the person in one line what you proposed.
- If Mainmind sends lines back to fix, fix exactly those, keep every fact,
  and propose again. Don't ask the person to fix them.

The full guide is the Mainmind docs page "How your knowledge grows"
(`mainmind://docs/knowledge-format`).
