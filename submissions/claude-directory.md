# Claude directory submission: Mainmind

Anthropic's directory lists plugins and connectors inside Claude, on
claude.ai, the desktop and mobile apps, and Cowork; a plugin added there also
reaches Claude Code. Submissions go through the developer portal at
https://claude.ai/directory/manage. This file holds every answer the portal
asks for, so submitting is copying rather than writing. It is kept outside
`plugins/mainmind` because people who install the plugin get only that folder.

Sources, read 2026-09-26:
[Publish to the directory](https://claude.com/docs/directory/publish),
[Submit your plugin](https://claude.com/docs/plugins/submit),
[Plugin pre-submission checklist](https://claude.com/docs/plugins/pre-submission-checklist),
[Connector pre-submission checklist](https://claude.com/docs/connectors/building/review-criteria),
[Plugin support by app](https://claude.com/docs/plugins/platform-support).

## Two submissions

Anthropic asks a product with its own remote MCP server to submit twice:

1. **MCP connector**: `https://mainmind.app/mcp`, so the server gets its own
   listing, health dashboard and usage by tool.
2. **Plugin bundle**: `plugins/mainmind` in this repository, whose skills teach
   Claude how to use that server. Its `.mcp.json` names the same URL, so a
   person with both sees one set of tools. Pair the two listings once both
   exist.

## Who submits

- A claude.ai account on Pro or Max (Team or Enterprise: an Owner). The listing
  belongs to the organization it is submitted from, and the first organization
  to submit a repository folder keeps it. Submit from the account that should
  own Mainmind's listing long term.
- GitHub connected on claude.ai in that same organization, with push access to
  `codeyogi911/mainmind-plugins`. The portal checks this before it creates or
  submits anything.
- The repository is public already, which publishing requires.

## Plugin bundle: what to enter

**Source step**

| Field | Value |
|---|---|
| Repository | `codeyogi911/mainmind-plugins` |
| Plugin path | `plugins/mainmind` |
| Branch or tag | leave empty (follows `main`) |

Select **Validate**. `npm run check` asserts what the portal blocks on for this
folder: a README of at least 40 words, a license, `displayName`, no system
files, and hook commands that name only paths under `${CLAUDE_PLUGIN_ROOT}`.
`claude plugin validate ./plugins/mainmind` passes.

**Expected holds, not blocks.** The three hooks run Node files from a
subfolder of the repository, which the checklist always holds for a reviewer
("Scripts the validator couldn't follow"). A new listing gets a human review
anyway. The cost is that a later version that changes a hook may wait for a
reviewer too. The way out, if it ever matters, is to publish the plugin from
a repository of its own with the plugin at the root.

**Listing details step**: read from `plugin.json` and `plugins/mainmind/README.md`;
nothing to type. Name `mainmind`, shown as **Mainmind**.

**Data handling step**

| Question | Answer |
|---|---|
| Does the plugin read or store personal data? | Yes. Through its connector it reads and saves the content of the person's own Mainmind space, which can include personal data they put there. On the person's computer the hooks keep small notes: an agent's name, times, and the titles of the app's current tasks. |
| Does it send data to services other than its declared connectors? | No. Only `https://mainmind.app/mcp`. The hooks make no network calls. |
| How long does it keep data? | The local notes are overwritten as work goes on and never leave the computer. The space's content is kept by Mainmind as its privacy policy, section 8, says. |
| Is it intended for people under 18? | No. |

**Compliance step**: a contact email Anthropic can reach about the submission,
and four acknowledgements, including the
[Software Directory Terms](https://support.claude.com/en/articles/13145338-anthropic-software-directory-terms)
and [Policy](https://support.claude.com/en/articles/13145358-anthropic-software-directory-policy).

**Review and submit step**: keep **GitHub push webhook** (needs admin on the
repository) and leave auto-publish on. Merging to `main` then releases the
plugin, the same way a merge releases it to Claude Code today.

## MCP connector: what is still open

The connector checklist asks more of the server than the plugin checklist asks
of the plugin. Measured on mainmind `main` at `15e7f5a`:

- **Tool annotations.** Every tool needs a `title` and the right hint. On
  mainmind `main` at `15e7f5a`, seven tools had no title and `deposit_record`
  had no annotations; mainmind#1139 gives all 75 tools a plain title and both
  hints, and a test now refuses a tool without them. Write tools that only add
  (a record, a note) say `destructiveHint: false`, which matches the MCP spec;
  a reviewer may still ask for `true`.
- **Tool descriptions.** Review rejects a description that tells Claude how to
  behave rather than what the tool does. The server's instructions (served at
  connection, not in tool descriptions) carry the behaviour; descriptions
  should be read once against that rule before submitting.
- **Test credentials for a fully populated account.** Mainmind signs people in
  with GitHub, so a reviewer needs a GitHub account that is a member of a
  populated space. The sample company is the natural candidate.
- **Public documentation**: https://mainmind.app/docs. Enough.
- **Privacy policy and terms**: https://mainmind.app/privacy and
  https://mainmind.app/terms exist, but still show "to be completed" for the
  legal entity name, registered address, effective date and an address for
  privacy requests. These are the same facts the Muse listing waits on.

## What only Shashwat can do

1. Supply the privacy and terms facts: legal entity name, registered address,
   an email for privacy requests and for Anthropic to reach, and the effective
   date.
2. Decide which GitHub account reviewers use to reach a populated space.
3. Open the portal from his claude.ai account and submit. Nothing in this file
   is sent anywhere until he does.
