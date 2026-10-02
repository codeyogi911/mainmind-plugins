# Independent OpenAI release fix review

Date: 2026-10-02. Reviewer `independent_review`, requested Mid tier; actual
inherited model identifier/effort unavailable and not overridden.

Base: `7cb9769980d6ef114f274a1d5055c12e94e31c69`.
Last whole-diff reviewed head: `93db825b7dc102f63fe70c946f90b857114e81a2`.
Exact fixed head: `36a6ddba0b3fd7aef7e4819219a8aac086a13094`.

**Verdict: SHIP for the bounded package/repository release. Request and standards
axes pass; no blocking finding remains.** This is not identity-success or
public-directory acceptance.

Original complete fix brief retained verbatim in
`independent-review-openai-release-fixed-brief.md`. Original whole-diff CHANGES
report and its original cold-helper FAIL remain unchanged in
`independent-review-openai-release.md` and
`openai-install-experience-review-93db825.md`.

## Coverage and finding disposition

Retain the prior complete **44-path base-to-93db825 review with no exclusions**.
This round reads the entire bounded 93db825-to-36a6ddb delta: only
`plugins/mainmind-codex/README.md`, 16 additions/3 deletions, plus its interaction
with the unchanged setup source, saved installed-host response and Experience
evidence. No implementation, metadata, manifest, generated output, dependency
or Claude-owned hook/shared skill changed in this fix.

**Original P2, blocking, standards/Experience — finish the recovery journey and
obtain a passing Experience record for the changed install documentation:
RESOLVED at this exact fixed head.** The README names the Codex conversation as
the destination, supplies a standalone unedited `$mainmind-setup` copy block,
explains both possible outcomes, and gives a concrete retry-once then public
issue-help route with app/message information and a privacy reminder. It
explicitly preserves the connection and avoids starting work; later-work
examples follow the check. The unchanged setup supplies its honest limitation
and settings recovery. The same cold helper's separate
`openai-install-experience-review-fixed.md` is **PASS** for this documented
installed failure journey at the exact fixed head. Optional command-wrap and
next-action clarity suggestions were also addressed. No new findings.

## Evidence inspected and checks actually performed

- Confirmed exact HEAD and clean tree; read the complete one-file delta.
  `git diff --check LAST_REVIEWED FIXED_HEAD` passed. Independently ran the
  affected existing manifest check: passed at version 0.17.1.
- Read the parent's exact-fix full gate log: passed 52 frontmatter cases,
  51 shipped skills, generation drift/manifest checks, 84 hooks and 27 OpenAI
  package cases. Parent reports successful exact-head CI run 36966834418;
  this reviewer did not independently query CI. No broad full-gate rerun was
  necessary for this documentation-only fix; the independent whole-diff gate,
  Draft2020-12 schema and preservation checks remain covered by the original
  report, and the exact-fix gate was inspected.
- Independently extracted the README block: exactly `$mainmind-setup`, no edits.
  Privately parsed `installed-readme-paste-private-events.jsonl`: completed
  installed 0.17.1 cache read, exit 0 and byte equality with unchanged setup
  source/hash `01471d2bae7a78a66234231bd750e009801944b610d8f15da8c299263ceb340d`;
  completed turn; zero MCP events. The saved response includes both full
  limitation and settings-recovery sentences. No private transcript or
  credentials are reproduced.
- Inspected exact-public-commit 390×844 light/dark phone and recovery images.
  Command fits on one line with visible GitHub copy control; destination,
  expected outcome and recovery route are readable. Read the cold helper's
  PASS record: ten-second/stranger checks pass for the already-installed user
  and documented unavailable-tool branch. Actual paste execution is supplied
  host evidence independently inspected here, not a live action by this reviewer.

## Limits

The GitHub copy control itself was not clicked in this review; its literal block
was pasted unchanged in the saved installed-host test. Retry and issue creation
were not executed. Connected identity remains blocked by unavailable `whoami`;
reliable implicit selection, complete tool discovery, ChatGPT desktop/mobile,
eight directory cases, event receipt and public-directory approval remain
unverified and disclosed. These are distinct acceptance tasks, not claims made
by this SHIP verdict. No new permission, credential, grant, scope, subscription,
configuration, server change, publication or reviewer live-host probe occurred.
