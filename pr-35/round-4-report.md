# Independent OpenAI whole-diff release review

Date: 2026-10-02. Reviewer: `independent_review`, requested Mid tier. Actual
inherited model identifier and effort are unavailable to this reviewer; neither
was overridden or inferred from the separate installed-host test's configuration.
This reviewer did not author or previously review this OpenAI diff. Earlier
Claude-package reviews are not used as coverage for this review.

Repository: `/Users/shashwatjain/Documents/Codex/2026-10-01/task-5/mainmind-openai`

Base: `7cb9769980d6ef114f274a1d5055c12e94e31c69` (landed Claude 0.17.0).

Exact head: `93db825b7dc102f63fe70c946f90b857114e81a2` (OpenAI 0.17.1).

**Verdict: CHANGES. Request/package axis passes within the stated Git-release
scope; standards axis has one blocking Experience gate finding. No code,
manifest, generation or authority defect was identified.**

Original verbatim brief retained in
`independent-review-openai-release-brief.md`, copied from the parent's pinned
`pr-35/round-4-brief.md`. The brief quotes the user: “approved to do the needful
to ship this”, and requires actual installed-host evidence without widening
credentials, scopes, grants, subscriptions or server capabilities. This report
is the original exact-93db review and must remain unchanged when the finding is
fixed. A later exact-head fix verdict belongs in a separate report.

## Finding and disposition

**P2, blocking, standards/Experience — finish the recovery journey and obtain a
passing Experience record for the changed install documentation.** Location:
`plugins/mainmind-codex/README.md:17`, the unavailable-tool disclosure. A person
using the documented `$mainmind-setup` gets an honest missing-tool limitation,
but the README does not explain what to check, how to retry, or where to obtain
help for this specific failure. The fresh stranger helper's original report,
retained as `openai-install-experience-review-93db825.md`, records **FAIL** for
recovery while passing the introduction and phone presentation. The governing
`docs/issue-to-merge.md` § Give the reviewer a concrete contract, Experience row,
states that a missing or FAIL Experience record on a changed user surface is
blocking. `EXPERIENCE.md` § Results and recovery requires a visible next action.
Disposition: **open at this head; parent is preparing a documentation-only
repair and a fresh passing Experience check.** This finding does not require
inventing a settings control, changing the server, expanding authorization or
claiming that connected identity succeeds.

The helper also suggested a standalone setup copy block because the inline
command wraps, and separating setup from other example prompts. Those are
**optional clarity suggestions, not separate blockers**. Connected-space success
is a separately disclosed host dependency, not this finding. The earlier P2
implicit-activation mismatch is resolved: setup metadata permits implicit
invocation and README supplies explicit `$mainmind-setup`; the existing source
also correctly distinguishes missing connection from missing tool.

## Coverage and correctness

Read the complete base-to-head diff, **all 44 paths with no exclusions**, going
beyond surface inspection because this change adds source generation and host
instructions. Read the full new setup workflow, all eight source metadata
files, both generated surfaces, portable/OpenAI manifests, all added gate and
test modules, generator changes, both submission records, every version bump
and root/package README changes. Repeated generated files were independently
compared byte-for-byte to their reviewed sources, not excluded.

Source ownership is coherent: seven shared workflows remain in `skills/`;
eight OpenAI metadata files plus setup remain in `tools/openai-skills/` and
reach only `.agents/skills` and `plugins/mainmind-codex/skills`. Validation and
collision rejection precede generator writes; drift/repair and collision
regressions exercise actual commands in disposable fixtures. Safe YAML parsing
rejects malformed/duplicate/custom-tag/alias input. The project gates are
bounded contract checks, not a universal vendor certification.

The setup only resolves argument-free existing `whoami`, does not infer
missing labels or expose IDs, never substitutes boot/sync for an unavailable
identity tool, and forbids setup side effects. Existing authorization remains
the server's responsibility. No server/auth/grant/scope change appears. All
49 pre-existing complete SKILL.md files are byte-identical to base. The entire
Claude plugin except its version field is byte-identical; its landed hooks and
shared sync instructions are preserved. Non-OpenAI manifests change version
only, coherently to 0.17.1.

## Independent checks actually run

- Exact HEAD confirmed; clean working tree before and after checks.
- `npm run check`: exit 0; **52 frontmatter cases, 51 shipped skill files,
  84 hook cases (38 + 18 + 28), eight OpenAI skills on both surfaces and
  27 OpenAI real-command package cases**. Shared/OpenAI drift and 0.17.1
  manifest alignment passed.
- `git diff --check BASE HEAD`: passed. Runtime Node v23.6.0/npm 10.9.2;
  CI's Node 24 run is the parent's separate evidence, not independently run here.
- Independently applied retained actual Agent Plugins plugin/MCP schemas with
  `Draft202012Validator` using the existing temporary jsonschema runtime:
  both schemas and both portable artifacts passed.
- Independent Git-blob/source comparisons confirmed 49 preserved shared files,
  eight equal metadata sets across source/two destinations, two equal setup
  copies, Claude component preservation, version-only other manifests and
  unchanged yaml dependency lock record.
- Disposable offline `npm ci --ignore-scripts --offline --no-audit --no-fund`
  succeeded. One unchanged pinned yaml 2.9.1 development parser; no lifecycle
  scripts ran. Temporary directory removed; no repository dependency edit.
- Privately parsed the saved installed-0.17.1 event trace: completed installed
  cache setup read, exit 0, exact source equality and SHA-256
  `01471d2bae7a78a66234231bd750e009801944b610d8f15da8c299263ceb340d`;
  completed turn, zero MCP events, both limitation/recovery sentences in the
  saved final response. Under-development-feature and unrelated hook-timeout
  warnings exist; they do not negate the completed read or prove identity.
  No private transcript/credentials were printed or included in this report.
- Inspected before/after public GitHub README phone screenshots, 390×844,
  light/dark. Text and explicit setup are readable. The fresh helper's
  ten-second result passes; its recovery judgment fails, as recorded above.
- Read the parent-provided CONTRIBUTING, issue-to-merge review contract,
  ADR0087 evidence rules, orchestration tiers and CDLC rubric. Apply the
  plugin's npm gate and Git-release route; this package does not deploy the
  separate Mainmind Worker.

## Current standards and proof limits

Fresh official source reads on 2026-10-02 support the [portable package and
marketplace layout](https://developers.openai.com/plugins/build/plugins),
[skill MCP dependency spelling](https://developers.openai.com/plugins/build/skills),
[onboarding/review metadata placement](https://developers.openai.com/plugins/deploy/submission)
and [current skill/interface validation rules](https://developers.openai.com/plugins/deploy/submission-errors).
The package uses inline OpenAI fields, canonical root discovery, CHAT/CODEX
policy, streamable_http skill dependency and streamable-http portable MCP
transport. The actual published schemas accept root manifests. No hooks or
app references are bundled into the OpenAI public package. Five positive and
three negative review cases are expected behaviors; they are not fabricated
test successes.

Actual installed loading proves the unavailable-tool branch only. Reliable
implicit selection, connected identity, tool completeness, ChatGPT desktop or
mobile, the eight directory scenarios, event receipt and directory approval
remain unproved and openly tracked separately. The docs accurately distinguish
repository release from universal-directory publication and connection from
packaged skills. This reviewer performed no live host/credential/configuration
probe, implementation edit, remote write or publication.

Next review: inspect the bounded README repair and its interactions, require a
passing cold-helper Experience record and truthful paste/recovery evidence,
then confirm the exact fixed head's gate. Retain this original report and all
prior findings; do not use the earlier SHIP verdicts to clear this P2.
