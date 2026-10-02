# Retained initial review contract

This is a reconstruction from the retained independent report, published on
2026-10-02; it is not represented as the verbatim original dispatch.
Independent reviewer: `openai_phase1_review`; inherited model/effort not
recorded. The current exact-head review uses the same resumed reviewer and
explicitly retains this design coverage.

Initial base: `19725b723c6294427fa5f919998290bb49ee2dd2`.
Original head: `17927875be4ec37618495221d9e1fab05aaa25f6`.
Fixed head: `b4750e0e3c287bd8a7343412dfae5e0b57fc39cd`.
Complete diffs: `round-1-complete.patch`, `round-2-delta.patch` and
`round-2-complete.patch`; no file excluded.

The package/source phase adapts Mainmind's portable OpenAI package to current
official requirements: accurate universal ChatGPT/Codex distribution docs,
bounded read-only identity setup, explicit skill metadata and dependencies,
source-backed validation and scoped generation. Preserve the seven canonical
workflows, Claude-owned agents/hooks and existing authentication/access. Do
not claim server profiles, panels, mentions, events, actual host acceptance
or directory publication from package gates.

Challenge correctness, source ownership, safe YAML parsing, scoping, public
manifest/metadata/schema compatibility, workflow authority, regression
meaning, exact gate evidence and user-facing experience. Read-only independent
review; no implementation, account, configuration or publication mutations.

The original P2 was an explicit-only invocation policy contradicting the plain
setup question in the documented experience. The fix changed setup source and
both generated copies to allow implicit invocation. The follow-up also refined
missing-tool recovery to avoid false disconnection claims or session/write
fallbacks. The retained report describes both the original defect and its
resolution, and reruns the full gate at the fixed exact head.
