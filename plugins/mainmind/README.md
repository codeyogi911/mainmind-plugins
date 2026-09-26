# Mainmind

Move freely between AIs. Mainmind keeps your agents, your knowledge and the
work in progress in one space, so you can start a task in Claude and carry on in
another app without explaining it again. A space can hold a company, a job hunt,
research or anything else.

## What you can do with it

- **Continue with an agent where you left off.** Say "Continue with Job Hunter"
  and the agent picks up with its instructions, what it remembers and what it
  was working on.
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
in with GitHub.

## What it contains

- **Six skills** that teach Claude how to work with a Mainmind space. They load
  in chat, Cowork and Claude Code.
- **One connector**, `https://mainmind.app/mcp`, the Mainmind service itself.
- **Three small hooks**, used in Cowork and Claude Code only. They remind the
  agent to sync before a session stops, note the app's task list so the agent
  can sync it, and say which agent last worked in a folder. Chat ignores them.

## Your data

- Everything the plugin reads or saves goes to Mainmind, at
  `https://mainmind.app/mcp`, through the connector you sign in to. The plugin
  sends nothing anywhere else. Mainmind stores your space with Cloudflare and
  runs its own AI features on Cloudflare; the privacy policy lists exactly what
  goes where.
- You sign in as yourself. The plugin holds no passwords, keys or tokens, and
  Mainmind shows the assistant only what your role in the space allows.
- The hooks make no network calls. They keep a few small notes on your own
  computer (which agent last worked in a folder, when it was last reminded, and
  the current task list) in Claude Code's plugin data folder, or in a private
  folder under your temporary directory when that is not set.
- Privacy policy: https://mainmind.app/privacy. Terms:
  https://mainmind.app/terms.

## Help

Guides are at https://mainmind.app/docs. The plugin is MIT licensed, and its
source is at https://github.com/codeyogi911/mainmind-plugins.
