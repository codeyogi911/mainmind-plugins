# Independent OpenAI review — round 3

Date: 2026-10-02. Repository: `/Users/shashwatjain/Documents/Codex/2026-10-01/task-5/mainmind-openai`.

**Verdict: SHIP for package/repository release at `c4b87f667fcd85e7815a46c5af61c0ea4c374e26`. No new code or documentation findings.** This verdict does not approve a public-directory submission, assert a successful connected identity check, or apply to a later candidate.

Compared with prior reviewed head `b4750e0e3c287bd8a7343412dfae5e0b57fc39cd` and current-main-at-this-round base `fd10e06beda8f56d2eeb8b293f8407bd4f3c3d0f`. This exact candidate was clean and was HEAD during the commands reported below. The parent subsequently advanced the working tree to incorporate a newer Claude release and commissioned a separate fresh whole-diff review. This report intentionally closes only the immutable c4b round; it is not an unchanged-current-HEAD claim.

## Identity, brief and independence

Reviewer inherited exact model identifier: **unknown**. Reviewer inherited reasoning effort: **unknown**. “Mid-tier” is the requested review role, not evidence of an actual model identifier or effort setting. No reviewer model override was requested or used. The saved host-test runtime separately records `gpt-6.1-sol` with `High` reasoning effort; those identify the test execution, not this reviewer.

The following is a truthful **reconstruction of the original brief, not a verbatim preserved prompt**: independently review the exact OpenAI package candidate for correctness, regression, source-of-truth/scoped generation, dependency/interface/policy metadata, bounded read-only onboarding, canonical shared skill preservation and Claude-owned agent/hook separation; read current official plugin/skill/submission requirements; run real package checks; assess whether a new Codex user can determine the connected Mainmind space and understand ChatGPT availability; distinguish static gates from actual host/directory acceptance; do not mutate connections, authentication, grants, subscriptions, server capabilities, browser state or publication.

The resumed brief expands review to the user-authorized shipping work and asks for an independent incremental review of c4b, retained whole-PR coverage, actual installed-host evidence and honest release claims, with no new credentials/scopes/server capabilities. I made no implementation edits and performed no live host/config/authentication probes or publication actions. Report writing is outside the repository.

## Findings and disposition

| Finding or acceptance issue | Severity | Disposition at c4b |
|---|---|---|
| Original setup activation mismatch: setup promised ordinary connection-question handling while `allow_implicit_invocation: false`, and README merely said “Run setup.” | Original P2 | Resolved. b475 changed policy to true; c4b also documents explicit `$mainmind-setup`, which the installed-host trace actually loads. |
| Implicit selection varies between setup and the broader mainmind-boot workflow. | Acceptance limitation, no new blocking package defect | Disclosed in the receipt; explicit setup is the documented bounded entry point. No claim of reliable implicit selection. Plain-question public review case remains unexecuted. |
| Existing tested host lacks `whoami`; connected identity/space success cannot be established there. | External acceptance dependency, not a new package defect | Honest fallback observed with zero MCP calls. Setup avoids false disconnected diagnosis and tool substitution. Success-path acceptance remains with the server/tool-discovery owner. |
| ChatGPT/mobile, eight directory scenarios, reviewer access, actual walkthrough and public-directory scans/review/publication. | Publication blockers outside this package verdict | Explicitly pending. No fabricated successful tests, recording URL, credentials or directory approval. |

No additional P0–P3 defect was found in the reviewed changes.

## Complete coverage and retained design

Read the full incremental diff: **21 paths**, none excluded. They comprise:

- `tools/openai-skills/mainmind-setup/SKILL.md` and both generated copies under `.agents/skills` and `plugins/mainmind-codex/skills`: recovery instructions now require both limitation and settings sentences in the final answer, even after a progress update. Existing bounded whoami-only behavior and explicit no-substitution rule remain intact.
- Canonical `skills/write-knowledge/SKILL.md` and all six shipped copies under `.agents`, Claude, Codex, Grok, mount and Muse: reviewed the decision-writing addition and proved each path byte-identical to fd10 main. These are already-landed main changes, not an OpenAI override. Their save/authorization behavior remains governed by the existing canonical workflow.
- `package.json`, `package-lock.json`, and all five host manifests (`mainmind-codex/plugin.json`, Grok manifest, both mount manifests and Claude manifest): coherent 0.16.1 release after main already used 0.16.0. Locked root package agrees. yaml 2.9.1 and its lock integrity/dependency details are unchanged.
- Root README, Codex package README, `submissions/openai-directory.md` and new `submissions/openai-host-acceptance.md`: explicit setup entry point, factual Codex fallback coverage, distribution distinction and remaining acceptance/publication work.

Also inspected the complete **44-path PR comparison** from fd10 main to c4b. No changed path was omitted from review. Thirty retained paths were proved byte-identical to b475: all 24 OpenAI YAML files across source/two destinations, marketplace JSON, and the five generation/metadata/check/test files. These retain the exact design coverage in [the prior final review](independent-review-openai-phase1-final.md), justified by byte equality and the rerun of all gates. The remaining 14 PR paths are the three setup bodies, four documentation paths and seven version/package paths examined afresh above. The seven write-knowledge paths are additionally covered in the incremental comparison but are absent from the final PR diff because they match main.

Retained design coverage includes portable root plugin/MCP auto-discovery, inline OpenAI fields, documented dependency spelling, valid YAML policy/interface types, overlay collision rejection before writing, generated drift detection and metadata repair tests, scoping exclusively to two OpenAI destinations, preservation of all shared skill bodies, and absence of public-package hooks/app references. No Claude-owned agent or hook change exists in this round relative to its main base.

## Independent evidence

At exact c4b, independently executed `npm run check`: exit 0. Results: 52 frontmatter cases; seven shared files across six destinations plus nine OpenAI files across two; metadata for 51 shipped skills; manifest agreement at 0.16.1; 32 keep-up-to-date + 18 last-agent-here + 28 note-tasks hook cases (**78 total**); OpenAI contract for eight skills on both surfaces; 27 OpenAI package cases invoking real checker/generator commands. `git diff --check fd10e06... c4b87f6...` passed. `git status --porcelain=v1` was empty and `git rev-parse HEAD` returned the exact candidate after the checks. Node v23.6.0/npm 10.9.2 were used; CI uses Node 24, which I did not independently run.

Read the parent's `openai-resume-gate.log`. Parent reports actual Agent Plugins 1.0.0 plugin/MCP schemas passed with pinned jsonschema; I did not rerun that external schema validation and do not present it as my own command result. The actual manifests and retained tests were inspected; the MCP remains one `streamable-http` HTTPS Mainmind endpoint, and no forbidden package hook/app reference is present.

Independently parsed the four saved private `installed-*-private-events.jsonl` traces and their response files without issuing host calls. Each has a completed turn and zero `mcp_tool_call` items. They show successful command reads from the installed `mainmind/mainmind/0.16.1` cache: explicit tests load setup, and the two implicit tests respectively load setup and mainmind-boot. Final explicit command output exactly equals the candidate's setup source; hashing that output yields `01471d2bae7a78a66234231bd750e009801944b610d8f15da8c299263ceb340d`, matching the public receipt and both generated copies. The final response contains the full limitation and settings-recovery sentences. Saved runtime configuration places the tests outside the repository in the temporary test directory with restricted read-only filesystem permissions. These support installed loading and safe fallback; they do not prove whoami availability or identity success.

The trace error items are an under-development feature warning and an unrelated installed SessionEnd-hook timeout warning; the skill read and turn nevertheless complete. No Mainmind success is inferred from those warnings or the absence of calls. CLI installation/authentication-retention assertions are the parent's observations, not actions performed by this reviewer.

## Standards and experience judgment

Refetched actual official text on 2026-10-02 through OpenAI Developer Docs: [package format and shared directory](https://developers.openai.com/plugins/build/plugins), [skills and MCP dependencies](https://developers.openai.com/plugins/build/skills), [submission requirements](https://developers.openai.com/plugins/deploy/submission), and [validation errors](https://developers.openai.com/plugins/deploy/submission-errors). These continue to support portable packaging, the snake_case skill metadata/dependency shape, supported CHAT/CODEX policy values, an included onboarding skill, and five positive/three negative MCP review cases. Current ZIP submission disallows lifecycle hooks/app references; the package complies. The standards require running positive cases before submission and a real reviewer-accessible walkthrough; those remain outstanding and are not implied by static gates.

For the requested newcomer goal, `$mainmind-setup` is now concrete and has installed-loading evidence. The available tested experience honestly stops when identity cannot be checked and gives a recovery step. The README places the missing-tool limitation immediately alongside its coverage statement. It clearly explains that public directory distribution can serve ChatGPT and Codex, repository installation is separate, and an existing developer connection alone does not install skills. No new profile/sidebar/content-mention/event functionality is promised by this package.

The candidate is suitable to merge/release as the documented bounded package adaptation. It is not ready to claim completed directory submission/acceptance or a verified connected-space experience. This distinction is part of the verdict, not an invitation to silently broaden credentials, grants, scopes or server capabilities.
