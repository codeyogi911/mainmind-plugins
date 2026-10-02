# PR 35 release review brief

Review kind: incremental. Reviewer: independent `openai_phase1_review`, Mid
tier; inherited model and effort (actual values unavailable to the lead).
No change to credentials, access, tenancy or server authority is in scope.

Base: `fd10e06beda8f56d2eeb8b293f8407bd4f3c3d0f`.
Last reviewed: `b4750e0e3c287bd8a7343412dfae5e0b57fc39cd`.
Head: `c4b87f667fcd85e7815a46c5af61c0ea4c374e26`.

User authorization, verbatim: “approved to do the needful to ship this”.
Parent acceptance, verbatim: “Your OpenAI shipping remains foreground and
should continue through real host testing.” Parent source coordination,
verbatim: “preserve Claude ownership and do not promise
pre-compaction/session-end/usage-cutoff saving.”

The concrete outcome is a coherent 0.16.1 portable OpenAI package, tested
through an actual installed host, then reviewed, merged and installed from
public Git. Preserve the Claude owner's PR 36 and original dirty checkouts.
No new credentials, grants, scopes, server capabilities or subscriptions.
Do not confuse repository release with public-directory approval.

The delta changes 21 of 44 PR paths: merge main's existing write-knowledge
content, version 0.16.1, final setup recovery wording, explicit setup command,
and honest installed-host acceptance documentation. See `round-3-delta.patch`
and `round-3-delta-files.txt` for the complete delta. No changed file is excluded.
The complete diff and paths are `round-3-complete.patch` and
`round-3-complete-files.txt`; the durable comparison is
https://github.com/codeyogi911/mainmind-plugins/compare/fd10e06beda8f56d2eeb8b293f8407bd4f3c3d0f...c4b87f667fcd85e7815a46c5af61c0ea4c374e26.

The prior report retains the full design review and the original P2 implicit
activation finding, resolved by enabling setup invocation on its source and
both generated copies. Retain that coverage only if justified; assess every
delta file and its interactions. Seek defects, not confirmation. Report
request and standards results, SHIP/CHANGES, severity/disposition of every
finding, exact head, retained coverage, actual verification and limits.

No AGENTS.md exists in this package repo. Parent-directed repository guidance
is Mainmind's CONTRIBUTING.md and docs/issue-to-merge.md review/record contract,
including ADR 0087 and incremental review ADR 0072. Those server deployment
rules do not turn this plugin-only Git release into a Worker deploy. The
shared skills source and OpenAI overlays own generation; Anthropic metadata
requirements govern shared frontmatter, Agent Plugins/OpenAI requirements
govern the portable artifact. Do not apply Codex manifest rules to Claude.

Evidence: exact-head `npm run check` passes; 52 frontmatter cases, 51 shipped
skill documents, 78 existing hook cases and 27 OpenAI real-command cases.
Both actual Agent Plugins 1.0.0 manifests passed Draft 2020-12 schema checks.
The installed-host receipt records Codex CLI 0.159.3, unchanged existing
connection, installed file hash equality, zero MCP calls, explicit activation
and variable implicit selection. No connected-identity success, ChatGPT
desktop/mobile, directory scenarios or publication is claimed.

Experience: check source before/after and actual response in
submissions/openai-host-acceptance.md. The explicit setup command now loads the
bounded skill. When whoami is unavailable, the final reply gives the honest
limitation and settings recovery step without a larger workflow or writes.
Read-only review only: do not edit source or probe live connections/settings.
