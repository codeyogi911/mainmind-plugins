# Muse directory submission — Mainmind

The platform page names three stages: describe the product, pass review, appear
in the directory. This file answers the first two in the form they are asked,
so a submission is a copy rather than a fresh piece of writing.

It is written to be true on the day it is sent. Check the open question at the
bottom before sending it.

## 1. Describe your product

**What it is.** Mainmind lets a person move freely between AIs: their agents
sync and travel with them, their space's knowledge gets better with every task,
and their passwords stay safe: the assistant uses accounts through Mainmind. A space can hold a company, a job hunt, research or
anything else: its processes, records, decisions, lessons and the jobs on its
team, plus the work in progress right now. The assistant reads the space's own
rules instead of guessing them, and every answer can point to where it came
from.

**What users do with it.** A person asks Muse a question about their work
and gets an answer drawn from their own knowledge rather than from the
model's memory: what a process says to do, what was decided and why, what is
open right now, what needs them today. They can put a decision to the space's owner
as a single question, record work that happened, and deposit what was learned
so the next session starts from it.

**Who it is for.** Anyone whose AI assistants should remember the same things:
a founder running a small company, someone in a job hunt, a team whose
knowledge is in one person's head or scattered across documents nobody
re-reads.

**What it does not do.** It is not another assistant, and not a scheduler. It
serves knowledge and records work. It does not act on anything by itself.

## 2. Review

**Functional.** The connector is a remote MCP server over streamable HTTP at
`https://mainmind.app/mcp`, reachable on the public internet. It advertises its
tools on connection; a reviewer can exercise the whole read surface end to end
with `whoami` (identity and freshness), `boot` (the space's entry
documents and the projection commit), `search` and `read_node`. Those four are
read-only and need no saved work to demonstrate.

Reads are safe to repeat. Writes are separately governed: they require the live
role to allow them, and a provider write takes an `operation_key`, so a retry
returns the prior receipt instead of sending twice.

**Security.** No credential ships in the connector and none is ever asked for in
conversation. A person authorizes as themselves and the mount serves only what
their live role allows; the role is the boundary, not the tool list. Provider
credentials stay on Mainmind's server and are never returned to the assistant.
The space's own command-line tools are not served to this surface at
all — the projection carries Markdown and nothing else.

A connection that names no space asks which one to mount at
authorization time, and it serves one at a time. A connection made to
`https://mainmind.app/mcp/<space>` is fixed to that space before
authorization begins.

**Legal.** The connector — this repository — is MIT licensed and public at
https://github.com/codeyogi911/mainmind-plugins. The service is Mainmind's,
operated by Shashwat Jain; terms and privacy are at https://mainmind.app. The
listing represents no company but Mainmind, and the connector carries no
third-party marks.

## 3. Directory listing

- **Name:** Mainmind
- **One line:** Your own processes, records and decisions, for a company, a job
  hunt or anything else, so the answer comes from what you keep, not from memory.
- **Homepage:** https://mainmind.app
- **Source:** https://github.com/codeyogi911/mainmind-plugins (MIT)
- **Support:** https://mainmind.app
- **Connector URL:** https://mainmind.app/mcp

## What the form asks for

**Everything in this section is third-party reported, not Meta-published.** The
platform page carries no spec, no SDK and no developer documentation;
`docs.muse.ai` does not resolve, and every developer path redirects to a Meta
login, so the form itself cannot be read without an account. Two independent
parties who reached it describe the same shape. Treat it as a good prior for
what to prepare, and confirm each field against the real form before relying on
it.

- **Connection type:** "Raw API" or "Existing MCP". Mainmind is the second.
- **Endpoint:** HTTPS only — `https://mainmind.app/mcp`.
- **OpenAPI URL:** optional, and not applicable to an MCP connection.
- **Authentication**, multi-select: "OAuth with PKCE" or "API keys".
- **Listing assets:** a 512×512 icon, and privacy, terms and support URLs.

**This answers the question this file used to end on.** Mainmind's mount is an
OAuth 2.1 provider with PKCE and dynamic client registration (its metadata is
at `https://mainmind.app/.well-known/oauth-authorization-server`), so if the form offers OAuth with PKCE, the connector
authenticates each person as themselves and the per-person role claim in
section 2 stands as written. Tick OAuth with PKCE, not API keys: an API key
would make the listing one machine identity, and section 2 would have to be
narrowed to say so.

Confirm that option exists on the real form before submitting. If it does not,
stop and re-read section 2 rather than submitting under a claim the connection
cannot keep.

## What is still needed before sending

1. **Shashwat has to open the form.** It is behind a Meta login; nobody else
   can reach it.
2. **Privacy and terms pages.** `https://mainmind.app` is the support URL and
   the icon is settled (below); these two are the remaining assets, and they
   need to exist at stable addresses before the listing can name them.

The **512×512 icon** is already deployed at
`https://mainmind.app/icon-512.png`, a genuine 512×512 PNG. Confirm the URL in a browser before
pasting it into the form.

Meta's own security writeup describes launch connectors as a joint engagement —
"we worked closely with the service provider to integrate their API, and we've
written and iterated on SKILLs" — so expect the review to be a conversation
rather than a form submission. The skills in `skills/` are the portable
`SKILL.md` files this repository already publishes for every other harness,
which is the artifact that engagement asks for.
