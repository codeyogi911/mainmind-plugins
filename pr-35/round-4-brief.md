# Final composed release review

Fresh whole-diff round; independent reviewer `independent_review`, Mid tier.
Inherited model and effort unavailable to lead/reviewer; report truthfully.
The cumulative delta after concurrent PR 36 landed exceeds the incremental
half-file threshold, so this round reassesses all 44 paths, excluding none.

Base: `7cb9769980d6ef114f274a1d5055c12e94e31c69` (main 0.17.0).
Head: `93db825b7dc102f63fe70c946f90b857114e81a2` (0.17.1).
Complete diff and inventory: `round-4-complete.patch`, `round-4-files.txt`.
Pinned comparison:
https://github.com/codeyogi911/mainmind-plugins/compare/7cb9769980d6ef114f274a1d5055c12e94e31c69...93db825b7dc102f63fe70c946f90b857114e81a2.

User request verbatim: “approved to do the needful to ship this”.
Parent acceptance verbatim: “Your OpenAI shipping remains foreground and
should continue through real host testing.” Parent coordination verbatim:
“preserve Claude ownership and do not promise
pre-compaction/session-end/usage-cutoff saving.”

Acceptance: a coherent current-spec portable OpenAI package with bounded setup,
metadata/dependencies, accurate distribution docs, scoped source generation,
meaningful regression gates, actual installed-host evidence, and reviewed Git
release. Preserve seven canonical workflows, landed Claude source/hooks,
original checkouts and existing access. No new credentials, grants, scopes,
subscriptions or server capabilities. No claim of public-directory approval.

Read the full diff for defects rather than confirmation: caller behavior,
frontmatter/YAML safety, generation source ownership, OpenAI manifests and
metadata, canonical/shared copies, tests and all user-facing claims. Assess
request and standards separately. Check Experience against before/after docs
and the actual installed response in submissions/openai-host-acceptance.md.
Return SHIP/CHANGES, exact head, severity and disposition of every finding,
coverage, checks actually run, and material proof limits.

No AGENTS.md exists in this plugin repo. Parent-directed review guidance:
Mainmind CONTRIBUTING.md, docs/issue-to-merge.md (ADR 0087, ADR 0072), context
ownership and experience evidence. Shared skill frontmatter follows Anthropic;
the portable OpenAI artifact follows actual Agent Plugins/OpenAI contracts.
Plugin Git release does not deploy the separate Mainmind Worker. The new source
overlays cannot replace canonical files and reach only the two OpenAI surfaces.

Current official references are in submissions/openai-directory.md. Actual
Agent Plugins 1.0.0 schemas retained outside repo have both passed Draft
2020-12 validation at 0.17.1. Full gate log round-4-gate.log: 52 frontmatter
cases, all 51 shipped skill files, 84 hook cases and 27 OpenAI real-command
cases. Rerun the gate independently at this exact head.

The original reviewer reported a P2 explicit-only activation mismatch at
1792787; b4750e0 enabled implicit setup and improved missing-tool handling on
source and both generated copies. Full prior report is retained with finding
and resolution. Do not let that verdict substitute for current full review.

Actual installed Codex CLI 0.159.3 tests used an empty temporary cwd and the
unchanged existing connection. Explicit setup read the installed 0.17.1 cache,
matched source SHA-256 01471d2b..., completed with zero MCP calls and an honest
unavailable-whoami limitation plus settings recovery. Plain-language selection
varied between setup and boot and is documented. Saved event traces/response
may be inspected privately outside repo, without publishing runtime details.
No live connection/auth/configuration probes or source edits by this reviewer.

Connected-identity success, full discovered-tool completeness, ChatGPT desktop
or mobile, the eight directory scenarios, event receipt and directory approval
are not proved; their exact remaining steps are documented. Do not manufacture
a passed test, recording, credentials or server feature from package validation.
