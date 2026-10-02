# Mainmind for ChatGPT and Codex

Continue with your agents and the work they remember, wherever you use AI.

In Codex, install `mainmind@mainmind` from the Mainmind marketplace and sign in
to your Mainmind space.

Already installed? Paste this into a Codex conversation:

```text
$mainmind-setup
```

Setup reports which identity and space are connected, or explains why it cannot
check. If the check is unavailable, retry the command once. If it still cannot
check, [report the unavailable connection check](https://github.com/codeyogi911/mainmind-plugins/issues)
with your AI app's name and the message you saw. Leave out private account
details. Setup keeps your existing connection and does not start work.

Once the connection is checked, ask “what's in my space?”, or say
“Continue with Job Hunter” to pick up with an agent.

This portable package includes the seven shared Mainmind workflows, a
read-only setup skill, and the Mainmind connection at `https://mainmind.app/mcp`.
The skills teach ChatGPT and Codex how to use your space's knowledge and keep
agent work in sync. You sign in through the app; the plugin carries no passwords
or keys. What you can read and do depends on your existing access.

OpenAI's public directory distributes plugins to both ChatGPT and Codex.
Repository installation in Codex and publication to that directory are separate
steps. Installed skill loading and setup activation were tested in Codex CLI
0.159.3. That host did not expose the connection-check tool, so setup stopped
without claiming success or changing anything. The connected-space success
path, ChatGPT desktop and a public Mainmind listing remain unverified.
An existing ChatGPT developer connection remains
usable, but does not install packaged skills by itself.

The [distribution and review checklist](../../submissions/openai-directory.md)
tracks the remaining host checks and directory review materials. New sidebar
views, content mentions and event subscriptions are server features; this
package does not claim to enable them.

[Privacy policy](https://mainmind.app/privacy) ·
[Terms](https://mainmind.app/terms) ·
[Help](https://mainmind.app/docs)
