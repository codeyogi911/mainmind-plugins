# PR 35 review index

Release candidate 0.17.1: `36a6ddba0b3fd7aef7e4819219a8aac086a13094`.
Current main base: `7cb9769980d6ef114f274a1d5055c12e94e31c69`.
No credential, grant, scope, subscription or server capability change.

| Round | Exact head | Coverage and record |
| --- | --- | --- |
| 1 | 17927875be4ec37618495221d9e1fab05aaa25f6 | Whole diff; original P2 activation-policy mismatch. [Reconstructed brief](rounds-1-and-2-brief-reconstruction.md), [retained report](rounds-1-and-2-report.md), complete patch. |
| 2 | b4750e0e3c287bd8a7343412dfae5e0b57fc39cd | P2 resolved; PASS, full gate. Same retained report, complete fix delta and whole patch. Original dispatch not retained verbatim; reconstruction explicitly labelled. |
| 3 | c4b87f667fcd85e7815a46c5af61c0ea4c374e26 | Incremental21paths, SHIP retaining original design. [Brief](round-3-brief.md), [report](round-3-report.md), complete delta/whole diff/gate. |
| 4 | 93db825b7dc102f63fe70c946f90b857114e81a2 | Fresh whole44paths after concurrent Claude merge. CHANGES: P2 missing actionable recovery/failed Experience. [Brief](round-4-brief.md), [report](round-4-report.md), [original cold-helper FAIL](round-4-experience-fail.md), complete patch/gate/phone images. |
| 5 | 36a6ddba0b3fd7aef7e4819219a8aac086a13094 | Bounded recovery fix check. [Brief](round-5-brief.md), [report](round-5-report.md), [cold-helper PASS](round-5-experience-pass.md), complete delta/gate/fixed phone images. |

Original findings and reports are preserved. Requested reviewer tier was Mid;
actual inherited model/effort are unknown rather than invented. A fresh
whole-diff round covers the final design after concurrent main changes.

Installed acceptance: [host receipt](installed-host-acceptance.md) and
[exact README copy-block test](round-5-paste-receipt.md). Existing Codex
CLI0.159.3/installed0.17.1 setup loaded, completed with zero MCP calls and
honest unavailable-whoami recovery. Connected identity, ChatGPT desktop/mobile,
directory scenarios and publication remain unverified.

Final CI: [check36966834418](https://github.com/codeyogi911/mainmind-plugins/actions/runs/36966834418),
success on exact36a6 head. Final gate: 52 frontmatter cases, 51 shipped skills,
84 Claude hook cases, 27 OpenAI package cases; both actual Agent Plugins1.0.0
schemas pass. Claude PR36 source/hooks and all shared bodies preserved intact.
