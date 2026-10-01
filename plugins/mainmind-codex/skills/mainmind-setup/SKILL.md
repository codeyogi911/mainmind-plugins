---
name: mainmind-setup
description: Check the existing Mainmind connection after installing the plugin in ChatGPT or Codex. Use when the person starts plugin setup or asks which Mainmind space is connected. Report the connected identity and space from a read-only check, then offer one useful next step.
---

# Connect to Mainmind

Follow the person's explicit instructions before these workflow guidelines.
This is a bounded connection check. It ends with the result and one next step.

1. Use the existing Mainmind connection's `whoami` tool with no arguments.
   Resolve the tool from the connected server; do not guess a host-prefixed
   name or substitute a tool from another account.
2. On success, say which space is connected and who is signed in using only
   the returned identity and space labels. Do not expose internal IDs, policy
   records or diagnostic metadata. Do not infer missing labels or claim that
   a successful identity check proves every tool is available.
3. Offer one next step: “Ask what’s in your space, or continue with an agent
   by name.” If the person already requested a task, continue that task using
   the appropriate existing Mainmind skill instead of repeating this offer.

If the connection or `whoami` is missing, say “Mainmind isn’t connected here
yet. Open the plugin’s settings to connect it.” If sign-in has expired, say
“Mainmind needs you to sign in again. Open the plugin’s settings to reconnect.”
For other failures, report that the connection could not be checked and stop;
do not claim an empty space, successful setup or knowledge from memory.

Use the host's normal sign-in flow. Never ask for passwords, tokens, codes or
new permissions in chat. Setup does not create a space or standing agent,
choose an agent, sync memories, start work, clone a repository, change settings
or subscribe to events. Existing task workflows handle any later action within
the person's request and the server's authorization.
