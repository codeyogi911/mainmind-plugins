# Mainmind on Muse

[Muse](https://muse.ai) is Meta's assistant, and it takes connectors. Mainmind
is already the shape a connector takes there — a remote MCP server over
streamable HTTP, reachable on the public internet, with authorization in the
browser — so this directory is the connection itself plus everything the
directory listing asks for.

**Meta publishes no connector manifest format.** The platform page describes a
three-stage program in prose and links no developer documentation, no schema
and no submission form. So there is no manifest here and no file shaped like
one. With no published format, no file in this directory could be the one Muse
reads: it would be read by nothing and would only look supported. What this
directory holds is the mount URL, the skills for a mount-only surface, and
[`SUBMISSION.md`](./SUBMISSION.md), the dossier the review stage asks for. If
Meta publishes a manifest schema, that is the file to add, and it belongs
here.

## Add it yourself today

You do not have to wait for the directory. Muse takes custom connectors from
users directly: give it the mount URL.

```text
https://mainmind.app/mcp
```

The mount is an OAuth 2.1 server, so connecting means completing a browser
authorization. Meta documents nothing about what its connector screen
supports, so treat that step as unverified until you have done it once. It
should ask which space to mount, because that URL names none. If the
connection is only ever meant to reach one, use the complete form,
`https://mainmind.app/mcp/<space>`, which fixes it before authorization
begins.

Meta does not review connectors added this way — you are trusting the service
directly, which here means trusting Mainmind. Nothing in this repository
changes that, and nothing in this repository holds a credential.

## Verifying it works

Ask the connected session for `whoami`, then `boot`. A healthy tool list is not
success; a verified identity and a named commit are.

Muse has no shell, no filesystem and no Git client, so it is a mount-only
surface: `read_node`, `search` and `call_provider`, and no checkout. The
skills in [`skills/`](./skills) say so, and an agent on this surface should say
plainly that it is on the mount, so nobody reads a partial answer as a complete
one. In particular the space's own command-line tools, under `tools/`,
are invisible from here — not absent.

An agent keeps itself up to date here with no one asking: the
`keep-my-agent-up-to-date` skill has it remember what it learns and note where
it stopped after each finished piece of work, when the person winds down and
before they switch apps, silently unless something could not be kept. To pick
it up in any other app, the person says "Continue with <Name>". Muse gets the
skill only; the safety-net hook is Claude Code's.

## Getting listed

[`SUBMISSION.md`](./SUBMISSION.md) answers the three stages the platform page
names: describe the product, pass functional, security and legal review with
end-to-end testing, appear in the directory. It also records what the form is
reported to ask for — connection type, endpoint, authentication, listing
assets — clearly marked as third-party reporting rather than Meta-published
spec, since none exists. Three things are still missing before it can be sent,
listed at the end of that file; one of them is that only Shashwat can open the
form.

## Sources

- [Muse platform and connector program](https://muse.ai/platform)
- [Meta AI help centre](https://www.meta.com/help/artificial-intelligence/1687253048996149/)
