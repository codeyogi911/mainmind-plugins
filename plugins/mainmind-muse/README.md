# Mainmind on Muse

[Host compatibility and evidence](https://github.com/codeyogi911/mainmind-plugins/blob/main/HOST-COMPATIBILITY.md) covers the
current setup, reconnect and delivery limits (checked 20 October 2026).

This directory carries source material for a candidate [Muse](https://muse.ai)
connection: Mainmind's remote MCP URL, portable skills and a submission
dossier. Actual authentication, skill activation and directory publication
remain unverified here.

**No verified native manifest is packaged here.** The source dossier describes a
three-stage program in prose and links no developer documentation, no schema
and no submission form. So there is no manifest here and no file shaped like
one. Do not invent a native loading format from those materials. What this
directory holds is the connection URL, portable skills for use where the host can load them, and
[`SUBMISSION.md`](./SUBMISSION.md), the dossier the review stage asks for. If
Meta publishes a manifest schema, that is the file to add, and it belongs
here.

## Connection candidate

The source dossier describes a custom-connector route. Its authentication
and actual skill loading remain unverified here; use the current host
controls if that route is available, with the connection URL.

```text
https://mainmind.app/mcp
```

The Mainmind connection is an OAuth 2.1 server, so connecting means completing a browser
authorization. Meta documents nothing about what its connector screen
supports, so treat that step as unverified until you have done it once. It
should ask which space to connect, because that URL names none. If the
connection is only ever meant to reach one, use the complete form,
`https://mainmind.app/mcp/<space>`, which fixes it before authorization
begins.

Meta does not review connectors added this way — you are trusting the service
directly, which here means trusting Mainmind. Nothing in this repository
changes that, and nothing in this repository holds a credential.

## Verifying it works

Ask the connected session for `start` with mode `whoami`, then a plain `start`. A healthy tool list is not
success; a verified identity and a named commit are.

Inspect the tools actually enabled in this session. If shell, filesystem or
Git access is absent, use only the exposed Mainmind connection: `search`
(with a path to read one document) and granted `call_provider`, without a checkout. The
skills in [`skills/`](./skills) say so, and an agent on this surface should say
plainly that it is working only through the Mainmind connection, so nobody reads a partial answer as a complete
one. In particular the space's own command-line tools, under `tools/`,
are invisible from here — not absent.

An agent syncs itself here with no one asking: the `sync` skill has it sync
what it learns and where it stopped after each finished piece of work, when
the person winds down and before they switch apps, silently unless something
could not sync. Saying "sync" syncs right away. To pick it up in any other app,
the person says "Continue with <Name>". These are portable skill files; their activation in Muse remains unverified.
The hooks belong to Claude Code.

## Getting listed

[`SUBMISSION.md`](./SUBMISSION.md) answers the three stages the platform page
names: describe the product, pass functional, security and legal review with
end-to-end testing, appear in the directory. It also records what the form is
reported to ask for — connection type, endpoint, authentication, listing
assets — clearly marked as third-party reporting rather than Meta-published
spec, since none exists. The remaining requirements are listed before it can be sent,
listed at the end of that file; one of them is that only Shashwat can open the
form.

## Sources

- [Muse platform and connector program](https://muse.ai/platform)
- [Meta AI help centre](https://www.meta.com/help/artificial-intelligence/1687253048996149/)
