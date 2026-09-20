# Muse directory submission — Mainmind

The platform page names three stages: describe the product, pass review, appear
in the directory. This file answers the first two in the form they are asked,
so a submission is a copy rather than a fresh piece of writing.

It is written to be true on the day it is sent. Check the open question at the
bottom before sending it.

## 1. Describe your product

**What it is.** Mainmind is a company's own operating knowledge, served to an
assistant. It mounts one organization — its processes, records, decisions,
lessons and role charters — as a projection at a named commit, plus the live
ledger of work in progress. The assistant reads the organization's own rules
instead of guessing them, and every material claim can be cited back to a path
and a commit.

**What users do with it.** A person asks Muse a question about their business
and gets an answer drawn from the company's own file rather than from the
model's memory: what a process says to do, what was decided and why, what is
open right now, what needs them today. They can put a decision to the founder
as a single question, record work that happened, and deposit what was learned
so the next session starts from it.

**Who it is for.** Small companies where the founder is the bottleneck, and the
knowledge that would unblock everyone else is in one person's head or scattered
across documents nobody re-reads.

**What it does not do.** It is not another assistant, and not a scheduler. It
serves knowledge and records work. It does not act on the business by itself.

## 2. Review

**Functional.** The connector is a remote MCP server over streamable HTTP at
`https://mainmind.app/mcp`, reachable on the public internet. It advertises its
tools on connection; a reviewer can exercise the whole read surface end to end
with `whoami` (identity and freshness), `boot` (the organization's entry
documents and the projection commit), `search` and `read_node`. Those four are
read-only and need no business state to demonstrate.

Reads are safe to repeat. Writes are separately governed: they require the live
role to allow them, and a provider write takes an `operation_key`, so a retry
returns the prior receipt instead of sending twice.

**Security.** No credential ships in the connector and none is ever asked for in
conversation. A person authorizes as themselves and the mount serves only what
their live role allows; the role is the boundary, not the tool list. Provider
credentials stay on Mainmind's server and are never returned to the assistant.
The organization's own command-line tools are not served to this surface at
all — the projection carries Markdown and nothing else.

A connection that names no organization asks which one to mount at
authorization time, and it serves one at a time. A connection made to
`https://mainmind.app/mcp/<organization>` is fixed to that organization before
authorization begins.

**Legal.** The connector — this repository — is MIT licensed and public at
https://github.com/codeyogi911/mainmind-plugins. The service is Mainmind's,
operated by Shashwat Jain; terms and privacy are at https://mainmind.app. The
listing represents no company but Mainmind, and the connector carries no
third-party marks.

## 3. Directory listing

- **Name:** Mainmind
- **One line:** Your company's own processes, records and decisions, mounted —
  so the answer comes from your file, not from memory.
- **Homepage:** https://mainmind.app
- **Source:** https://github.com/codeyogi911/mainmind-plugins (MIT)
- **Support:** https://mainmind.app
- **Connector URL:** https://mainmind.app/mcp

## Open question — settle before sending

**Can a directory-listed connector complete Mainmind's OAuth flow?**

Mainmind authenticates people with OAuth, and that is what makes the mount
serve each person their own role. Public reporting on Muse describes a
credentials store that injects bearer tokens and API-key headers, and says
OAuth services need additional configuration; Meta publishes no developer
documentation that settles it either way.

It decides what the listing can honestly promise:

- **If OAuth runs on the listed path**, the connector above is complete and the
  submission stands as written — every person authorizes as themselves and
  carries their own role.
- **If a listed connector must present a static bearer**, then the listing
  carries one machine identity, not a person's. That is a different product:
  it needs its own scoped machine member (`invite_member` with
  `kind: machine`), the listing must say that it reads as that identity, and
  the per-person role claim above has to come out.

Do not submit under the first reading without confirming it. The second is
still worth listing; it is just a narrower claim.
