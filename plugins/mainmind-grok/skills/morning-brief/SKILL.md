---
name: morning-brief
description: Start-of-day digest over the Mainmind mount. Load when the owner or a teammate opens with "what needs my attention", "morning brief", "how are we doing", "anything urgent", "what's happening", or any start-of-day status check.
---

# Morning brief

One screen, answer first: what needs the reader, what is in motion, what
landed. Built entirely from mount reads — never from memory.

## Gather (in this order)

1. `boot` if this session hasn't booted (see mainmind-boot); otherwise `whoami`
   for freshness.
2. `list_runs` — open runs (who is working on what right now), stalled runs
   (heartbeat stopped: name them — stalled is a fact, not a verdict), and
   what recently ended, with outcomes.
3. `list_events` (limit 30) — every event with `needs_you: true` that is
   still plausibly open, plus notable deposits and rulings since yesterday.
4. If anything needs deeper context, `read_node` the paths the events and
   runs name. Do not expand beyond what the brief needs.

## Compose

Three short sections, in this order, plain words:

- **Needs you** — each item one line: the decision or blocker, who is waiting,
  the money figure if there is one. Decision links (`/d/…`) go here verbatim.
  If nothing needs the reader, say exactly that in one sentence.
- **In motion** — open runs: who, what, current step. Flag stalled ones.
- **Landed** — recently finished runs and deposits worth knowing, with
  outcomes, not process narration.

Figures a decision rests on go in a table, never buried in a sentence. Never
compress a failure, an unverified number, or a request not carried out.

## Close

End with the single most useful next action for this reader, as an offer, not
a question list. If the projection is older than the last known work, say so —
a stale read is part of the brief, not a footnote.
