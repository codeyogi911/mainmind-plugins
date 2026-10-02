# Exact README block acceptance

On 2026-10-02, the unmodified README copy block `$mainmind-setup` was passed
as the whole user prompt to Codex CLI0.159.3 in an empty temporary cwd, using
`exec --ephemeral --skip-git-repo-check --sandbox read-only` and the existing
installed Mainmind0.17.1 connection. No new credentials/grants/scopes.

Saved event trace: installed cache setup SKILL.md read succeeded, completed
turn, zero MCP tool events. Final reply:

> I can’t check your Mainmind space from this app yet. Check the connection in
> the plugin’s settings.
>
> The required `whoami` tool isn’t available here.

This proves the documented explicit command reaches the bounded installed
skill and returns honest recovery when its required tool is unavailable.
It does not establish connected-space identity, other tools, ChatGPT or public
directory acceptance. Private traces remain outside the public record.
