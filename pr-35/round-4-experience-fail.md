# Mainmind package README — stranger experience review

**Verdict: FAIL for the requested connected-space check.** The introduction and mobile presentation pass; the recovery path needs a concrete action. This verdict does not imply that installation or setup activation failed.

Reviewed only the supplied final 390 × 844 light/dark phone screenshots and [public package README at 93db825](https://github.com/codeyogi911/mainmind-plugins/blob/93db825b7dc102f63fe70c946f90b857114e81a2/plugins/mainmind-codex/README.md). No implementation/history inspection, connection changes, or publishing.

## Ten-second test

I understand this is Mainmind for ChatGPT and Codex: it brings remembered work and agents into my AI client. As an already-installed Codex user, my next action is to run `$mainmind-setup` to identify the connected space. I can find that action in the first phone screen without searching.

## Stranger test and stopping point

The README supplies the setup command. The supplied acceptance fact says pasting it into installed Codex CLI 0.159.3 loaded the skill, but `whoami` was unavailable. The response stated that limitation, suggested checking settings, and made zero Mainmind calls. I stop there: no returned identity or space establishes which space is connected. I did not independently rerun this interaction.

## Concrete defects

- **Recovery:** the README acknowledges the unavailable connection-check tool but does not tell me what to check in settings, how to retry, or where to seek help for this exact failure. The generic Help link is not a specific recovery instruction.
- **Copy clarity:** `$mainmind-setup` wraps at the hyphen in both screenshots. Its literal text remains visible, but a standalone copyable code block and “paste into a Codex conversation” would remove ambiguity about destination and line breaks.
- **One next action:** installation, sign-in, setup, and two example conversation prompts share one paragraph. An “Already installed?” instruction isolating the setup command would better serve this job.

## Readability and actual limits

Both themes have readable text and distinguish inline commands clearly. The title and paragraphs fit the phone width without visible horizontal clipping. The first screen exposes the next action; the limitation paragraph continues below the captured viewport. Full-page scrolling, link destinations, clipboard behavior, and assistive technology were not tested.

The disclosure honestly distinguishes skill activation from connected-space success. ChatGPT behavior, successful identity retrieval, and a public Mainmind directory listing remain unverified. A revised README can pass the documentation experience by adding an explicit destination, expected result, and a truthful recovery step; these screenshots and the saved activation result cannot prove the identity success path.
