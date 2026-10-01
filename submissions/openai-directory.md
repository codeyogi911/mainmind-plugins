# Mainmind for the OpenAI directory

The portable package is `plugins/mainmind-codex/`. It can carry the same
skills and Mainmind connection into ChatGPT and Codex. A repository release
is not evidence that OpenAI has reviewed or published a directory version.

## Package and source

- Root `plugin.json`: Agent Plugins 1.0.0 identity and inline
  `extensions.com.openai` listing, setup and review cases.
- Root `mcp.json`: explicit `streamable-http`, `https://mainmind.app/mcp`.
- Seven shared workflows from `skills/`; OpenAI setup and skill
  `agents/openai.yaml` dependencies from `tools/openai-skills/`.
- Generated copies are checked before release. Skill dependencies refer to
  the same Mainmind endpoint and do not grant additional permissions.
- Public package excludes lifecycle hooks, `.app.json` and app references.
  Native local hook support is a different distribution/trust path.

The optional onboarding skill checks `whoami` through the existing connection
and stops after the identity/space result and a next step. It does not enroll
agents, start work, clone repositories, change settings or create subscriptions.

## Acceptance record

The manifest contains five positive and three negative review scenarios.
These are expected behaviors, **not completed test results**. Before submitting:

- [ ] Use an authorized demo account with sample data, an accessible sample
  travel policy, sample work and a standing agent named Review Helper.
- [ ] Run each case in ChatGPT and Codex; record the installed package version,
  tool selection, result and any writes. Check mobile behavior and fallbacks.
- [ ] Test setup activation, missing/expired connection and ambiguous identity.
- [ ] Verify all expected tools are actually available in the host. A successful
  `whoami` is only an identity check; a static gate is only package evidence.
- [ ] Record a reviewer-accessible walkthrough. Add its real URL under
  `extensions.com.openai.review.demo_recording_url` after recording it.

Actual host setup/activation and directory scans remain unverified for this
package adaptation. Do not mark them passed from `npm run check`.

## Directory completion

- [ ] Confirm the owning organization/project and verified developer identity.
- [ ] Confirm website, support, privacy and terms URLs are public and belong to
  the same publisher. The package retains the current Mainmind URLs.
- [ ] Upload a ZIP of the package root, resolve metadata/skill findings and
  connect its one remote HTTPS MCP server.
- [ ] Complete the dashboard's domain-verification challenge without replacing
  a token used by another plugin.
- [ ] Finish authentication and tool scans; inspect discovered tools and any
  held definitions. Each model-callable operation must be independently exposed.
- [ ] Enter dedicated reviewer account access in the secure dashboard only.
  Do not put credentials or reviewer instructions in the package.
- [ ] Check the imported review cases, actual recording and release notes;
  complete the required attestations, submit for review, then publish when approved.

Publisher verification, access changes and attestations require the appropriate
human decision. This source does not accept terms or change country targeting.

## Applicable enhanced capabilities

The new OpenAI plugin surfaces are server capabilities: a read-only space/team
sidebar and conversation panel, account labels, desktop content mentions,
selected context and deep links. Add them only after the server's existing
permissions and actual host behavior are verified. Do not claim they are enabled
by packaging metadata.

Mainmind already has a conversation-event implementation. Its existing owner
must verify compatibility and client receipt before event-watch acceptance.
ChatGPT requires MCP `2026-07-28` and webhook delivery with persistent,
authorized subscriptions and signed callback verification. Installing this
package must not silently subscribe a real account.

## Current official references

- [Packaging and universal distribution](https://developers.openai.com/plugins/build/plugins)
- [Skills and MCP dependencies](https://developers.openai.com/plugins/build/skills)
- [Submission fields and review](https://developers.openai.com/plugins/deploy/submission)
- [Package validation errors](https://developers.openai.com/plugins/deploy/submission-errors)
- [Tool, privacy and permission guidelines](https://developers.openai.com/plugins/plugin-guidelines)
- [Authentication and profile identity](https://developers.openai.com/plugins/build/auth)
- [Plugin extensions](https://developers.openai.com/plugins/build/extensions)
- [MCP Events](https://developers.openai.com/plugins/build/mcp-events)

Checked on 2026-10-01. Annotation justifications are no longer a blanket
submission requirement; explicit correct safety annotations remain required.
