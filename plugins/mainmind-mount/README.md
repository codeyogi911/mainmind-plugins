# Mainmind for Cursor and portable clients

[Host compatibility and evidence](https://github.com/codeyogi911/mainmind-plugins/blob/main/HOST-COMPATIBILITY.md) covers the
current setup, reconnect and delivery limits (checked 20 October 2026).

Move freely between AIs. Mainmind keeps your agents, your knowledge and the
work in progress in one space, so you can start a task in Claude or Codex and
carry on through another supported Mainmind connection.

This folder targets Cursor and clients implementing Agent Plugins 1.0.0.
Grok Bot is a distinct cloud host; this package has no verified Bot-specific
installation, authentication or receiving contract.

## What you can do with it

- **Continue with an agent where you left off.** Say "Continue with Job Hunter"
  and the agent picks up with its instructions, what it remembers and what it
  was working on.
- **Make an agent.** Say "make me an agent that…", answer three plain
  questions, and see one summary of what it will do before it is saved.
- **Ask what your space knows.** Answers come from your own processes, records
  and decisions, and say where they came from.
- **Get a morning brief.** Ask "what needs me today?"

## How to add it

- **On a Cursor team:** an admin opens
  **Dashboard → Plugins & MCPs → Add Marketplace → Import from Repo** and enters
  `https://github.com/codeyogi911/mainmind-plugins`. Members then add Mainmind
  from **Plugins** in Cursor.
- **In Cursor on your own:** copy this folder into
  `~/.cursor/plugins/local/mainmind` and restart Cursor.

Then sign in to Mainmind when asked and choose your space. You sign in as yourself
through Mainmind's browser flow. No secret is pasted. Ask "what's in
my space?" to check it works. You need a Mainmind space; start one at
https://mainmind.app.

## What it contains

- **Nine skills** that teach the agent how to work with a Mainmind space.
- **One connection**, `https://mainmind.app/mcp`, the Mainmind service itself.

## Your data

Everything the plugin reads or saves goes to Mainmind through the connection
you sign in to, and nowhere else. You sign in as yourself; the plugin holds no
passwords, keys or tokens. Privacy policy: https://mainmind.app/privacy.
Terms: https://mainmind.app/terms. Guides: https://mainmind.app/docs.

The plugin is MIT licensed.
