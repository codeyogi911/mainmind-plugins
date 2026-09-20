# Mainmind on Muse

[Muse](https://muse.ai) is Meta's assistant, and it takes connectors. Mainmind
is already the shape a connector takes there — a remote MCP server over
streamable HTTP, reachable on the public internet, with authorization in the
browser — so this directory is the connection itself plus everything the
directory listing asks for.

**Meta publishes no connector manifest format.** The platform page describes a
three-stage program in prose and links no developer documentation, no schema
and no submission form. So there is nothing here pretending to be a Muse
manifest: [`mcp.json`](./mcp.json) is an ordinary MCP client entry, which is
what Muse consumes, and [`SUBMISSION.md`](./SUBMISSION.md) is the dossier the
review stage asks for. If Meta publishes a manifest schema, that is the file
to add, and it belongs here.

## Add it yourself today

You do not have to wait for the directory. Muse takes custom connectors from
users directly: give it the mount URL and complete Mainmind's authorization.

```text
https://mainmind.app/mcp
```

That URL names no organization, so authorization asks which one to mount. If
the connection should only ever reach one organization, use the complete form,
`https://mainmind.app/mcp/<organization>`, which fixes it before authorization
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
one. In particular the organization's own command-line tools, under `tools/`,
are invisible from here — not absent.

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
