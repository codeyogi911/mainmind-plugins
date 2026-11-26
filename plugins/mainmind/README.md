# Mainmind

[Host compatibility and evidence](https://github.com/codeyogi911/mainmind-plugins/blob/main/HOST-COMPATIBILITY.md) covers the
current setup, reconnect and delivery limits (checked 20 October 2026).

Move freely between AIs. Mainmind keeps your agents, your knowledge and the
work in progress in one space, so you can start a task in Claude and carry on in
another app without explaining it again. A space can hold a company, a job hunt,
research or anything else.

## What you can do with it

- **Continue with an agent where you left off.** Say "Continue with Job Hunter"
  and the agent picks up with its instructions, what it remembers and what it
  was working on.
- **Ask the Librarian or the Toolsmith.** Every space has both. The Librarian
  works through what waits on your knowledge (lessons, gaps, flagged pages) and
  proposes each change for your yes. The Toolsmith checks that your accounts
  still work. Say "Continue with Librarian", or ask Claude to have the Librarian
  do it.
- **Make an agent.** Say "make me an agent that…", answer three plain
  questions, and see one summary of what it will do before it is saved.
- **Ask what your space knows.** Answers come from your own processes, records
  and decisions, and say where they came from.
- **Get a morning brief.** Ask "what needs me today?" for what is waiting on
  you, what is in motion and what finished.
- **Bring an existing setup along.** Say "Continue with Job Hunter everywhere"
  to turn instructions you already wrote for another app into a Mainmind agent,
  after a preview of what comes along.

The agent keeps itself synced as it works. You never have to ask it to save.

## How to start

1. Add the plugin.
2. Connect **Mainmind** on the plugin's Connectors tab and sign in. In Claude
   Code, run `/mcp` and sign in there. You choose which space to use when you
   sign in.
3. Ask "what's in my space?" to check it works.

You need a Mainmind space. Start one at https://mainmind.app, where you sign
in with your email.

## What it contains

- **One connector**, `https://mainmind.app/mcp`, the Mainmind service itself.
  That is all. Mainmind's skills, which teach Claude how to work with a space,
  come over the connection itself, so they stay current without updating the
  plugin.

## Your data

- Everything the plugin reads or saves goes to Mainmind, at
  `https://mainmind.app/mcp`, through the connector you sign in to. The plugin
  sends nothing anywhere else. Mainmind stores your space with Cloudflare and
  runs its own AI features on Cloudflare; the privacy policy lists exactly what
  goes where.
- You sign in as yourself. The plugin holds no passwords, keys or tokens, and
  Mainmind shows the assistant only what your role in the space allows.
- Privacy policy: https://mainmind.app/privacy. Terms:
  https://mainmind.app/terms.

## Help

Guides are at https://mainmind.app/docs. The plugin is MIT licensed, and its
source is at https://github.com/codeyogi911/mainmind-plugins.
