# Independent OpenAI phase 1 review

Reviewed on 2026-10-01. Repository: `/Users/shashwatjain/Documents/Codex/2026-10-01/task-5/mainmind-openai`.

Base: `19725b723c6294427fa5f919998290bb49ee2dd2`.
Original reviewed candidate: `17927875be4ec37618495221d9e1fab05aaa25f6`.
Final reviewed candidate and verified checkout HEAD: `b4750e0e3c287bd8a7343412dfae5e0b57fc39cd`.

Verdict: **PASS for this package/source phase at the final head.** The original P2 activation gap is resolved. All executed package gates pass. No repository files were edited by this reviewer, and no live connection, server, authentication, settings, grants, subscriptions, browser, publication, or host-acceptance actions were performed.

## Resolved finding

**Original P2 — Make the bounded identity setup reachable through the documented experience. Resolved at final head.**

Location: `tools/openai-skills/mainmind-setup/agents/openai.yaml:7` (also generated at `plugins/mainmind-codex/skills/mainmind-setup/agents/openai.yaml:7` and `.agents/skills/mainmind-setup/agents/openai.yaml:7`). Related copy: `plugins/mainmind-codex/README.md:6`, `tools/openai-skills/mainmind-setup/SKILL.md:3`, and `plugins/mainmind-codex/plugin.json:50`.

The new skill description says to use it when the person asks which Mainmind space is connected, and the first positive review case uses the plain prompt “Check which Mainmind space I am connected to.” However, its metadata explicitly sets `allow_implicit_invocation: false`. The package README only says “Run setup” and never supplies an explicit skill invocation or an actionable setup-control label. A new Codex user following these materials has no documented way to activate this bounded workflow after onboarding. Their ordinary identity question cannot implicitly select this skill. Another skill or generic tool use might answer, but does not carry the new bounded setup instructions; `mainmind-boot` remains implicitly enabled and its larger workflow includes sync and checkout steps after the identity check.

Reproduce the static contradiction: inspect the setup metadata at line 7, the plain review prompt at manifest line 50, and the README instruction at line 6. This is a deterministic invocation-policy/copy mismatch, not a claimed observed host failure. Official [optional skill metadata guidance](https://learn.chatgpt.com/docs/build-skills#optional-metadata), fetched in this review, states that false prevents implicit Codex invocation from user prompts and that explicit `$skill` invocation remains available.

The final head sets `allow_implicit_invocation: true` on the narrowly described setup source and both generated copies. This aligns plain-prompt activation policy with the description and positive review case. Host activation is still an acceptance check for the host owner.

The final head also corrects missing-tool handling in setup source lines 22–32 and both generated copies. It now claims the connection is absent only when the host explicitly reports that state. If `whoami` is unavailable while other Mainmind tools exist or connection state is unknown, it reports that this app cannot perform the check. It expressly forbids silently substituting `boot`, `sync` or any tool with session/write effects. This avoids false disconnection diagnosis and preserves the bounded read-only contract. The parent's native-host observation was not reproduced by this reviewer.

## Verified evidence

Executed real commands at the original candidate, then reran `npm run check` and `git diff --check` at the final exact candidate:

- `npm run check`: exit 0. Passed 52 frontmatter cases; shared/OpenAI generation drift checks; metadata for 51 shipped skills; manifest agreement at 0.16.0; 32 keep-up-to-date, 18 last-agent-here, and 28 note-tasks hook cases; OpenAI contract checks for eight skills on both OpenAI surfaces; and 27 OpenAI package cases.
- `node tools/test-openai-package.mjs`: exit 0, independently rerun, 27 cases passed. The suite invokes actual checker/generator commands in a temporary copy, tests failures and repair, rejects canonical-overlay collisions, and checks scoping to the two OpenAI destinations.
- `git diff --check <base> <candidate>`: exit 0.
- `git status --porcelain=v1`: empty before and after checks. The parent advanced HEAD after the original review; the final correction was inspected and the complete gate rerun at `b4750e0e3c287bd8a7343412dfae5e0b57fc39cd`.
- Runtime: Node v23.6.0, npm 10.9.2. CI requests Node 24; this review did not run the CI runtime or reinstall dependencies. The locked development parser is yaml 2.9.1; package.json, package-lock top-level/root package and all versioned host manifests agree at 0.16.0. The lock dependency and integrity are unchanged.

Reviewed all changed paths. The seven canonical `skills/*/SKILL.md` files and all seven generated shared bodies are preserved; no canonical skill, Claude-owned agent, or hook change appears in the candidate diff. The other host-manifest changes are exclusively coherent 0.15.0 to 0.16.0 version bumps. Overlay generation validates its own setup/frontmatter/YAML before writing, blocks collisions with shared files, and merges only into `.agents/skills` and the portable OpenAI package. README source-of-truth guidance accurately names `skills/` and `tools/openai-skills/`.

Current shipped YAML is valid and uses the documented snake_case interface, policy values CHAT/CODEX with boolean invocation policy, and one Mainmind MCP dependency with `transport: streamable_http`. Portable `mcp.json` separately uses the required `type: streamable-http`. The package has inline `extensions.com.openai` metadata, valid included onboarding path, one remote HTTPS Mainmind endpoint, and no bundled hooks or app references. New review scenarios are five positive and three negative. Their descriptions are expected behavior, not fabricated results; the dossier explicitly marks actual runs, demo recording and reviewer access unfinished. No recording URL or reviewer credential/instruction is fabricated.

The setup body confines setup to the connected server's argument-free `whoami`, protects internal identifiers, provides sign-in recovery and stops on failure, avoids invented labels and claims of complete tool availability, and disallows setup writes or subscriptions. Subsequent work is conditional on the person's already requested task. No unsafe setup instruction was found in the new body.

## Experience and distribution assessment

For the goal “I use Codex and want to know which Mainmind space is connected; I also want to understand ChatGPT availability,” the intended successful setup answer is clear and bounded, and the final invocation policy allows the ordinary request to select it. When the required identity tool is unavailable, it returns an honest limitation instead of inventing an identity or substituting a larger workflow. The README and root Install table accurately separate repository installation from universal public-directory publication, state that a public Mainmind listing is unverified, and explain that an existing ChatGPT developer connection does not independently install the skills. The package does not claim to enable the new profile/sidebar/content-mention/event surfaces. Static experience review passes; actual host experience remains unexecuted by this reviewer.

The submission dossier preserves real remaining work: authorized sample account/data, actual ChatGPT and Codex case runs, expired/ambiguous identity checks, mobile behavior, real accessible walkthrough, verified publisher and public URLs, domain challenge, authentication/tool scans, secure reviewer access, required attestations, review and publication. Those are remaining acceptance/publication blockers, not evidence of a broken static package. No symbol named `rootInstall` exists in this package repository; the root README Install table was reviewed as requested.

## Official requirements read

Fetched actual current page text through OpenAI Developer Docs:

- [Package your plugin](https://developers.openai.com/plugins/build/plugins): portable root package format, inline OpenAI extension, canonical skill/MCP auto-discovery, universal ChatGPT/Codex directory, distinct local/repo distribution and install/auth policies.
- [Build skills](https://developers.openai.com/plugins/build/skills): explicit MCP dependency form, workflow instructions and real activation/output testing.
- [Upload and submit](https://developers.openai.com/plugins/deploy/submission): supported onboarding/review/publication placement, five positive/three negative MCP cases, secure reviewer credentials, actual walkthrough, and current prohibition on ZIP hooks/app references.
- [Submission errors](https://developers.openai.com/plugins/deploy/submission-errors): current package/interface/skill metadata rules, policy/dependency mapping shapes and field limits.
- [Optional skill metadata](https://learn.chatgpt.com/docs/build-skills#optional-metadata): exact meaning of explicit-only invocation, used to substantiate the finding.

Static checks establish source/distribution consistency only. They do not demonstrate OpenAI import acceptance, setup activation, real available tool definitions, connection identity, server compatibility, directory review, host UI, mobile behavior or event receipt.
