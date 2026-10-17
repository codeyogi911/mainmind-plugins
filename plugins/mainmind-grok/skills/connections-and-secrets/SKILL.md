---
name: connections-and-secrets
description: Connect a business account to a Mainmind space without pasting a secret. Load when someone wants to add, replace or retry a provider login, API key or password, or a Zoho Expense seal, and whenever a secret is about to go into a tool argument or into chat.
---

# Connections and secrets

Never paste a secret into a tool argument or into chat. Not a password, an
API key, a refresh token, a client secret, or a one-time code. A shell posts
values it reads from environment variables or files. Never put a value on
the command line as a literal. When the values are not already there, the
person posts them from their own shell. Do not ask them to paste the values
here.

## See what is already connected

Call `list_provider_connections`. It returns aliases, kinds and
`credential_generation`. It does not return values. A pending connection is
listed as pending. Use the alias it returns. Do not invent one.

## Add an account

Any acting member may call `install_provider_connection` with `alias`
(kebab-case) and `profile` (`schema` `mainmind.connection-profile/v1`, `id`,
`driver`, and the origin fields that driver requires), and no `credential`.
The names `zoho-inventory`, `zoho-desk`, `shopify-admin` and `amazon-sp` are
built-in accounts and are refused for a new connection.

The answer includes a single-use `placement_url` for a Founder or co-founder
to open, see the destination, and paste the values. Nothing comes back
through you. The link is valid for seven days.

A Founder or co-founder may instead send `request_seal_link` true and no
`credential`. The answer is `seal_url` and `seal_key`. A shell posts one JSON
object of the field names to `seal_url`, with the key in the header
`X-Mainmind-Seal-Key`. The key is not in the URL or the body. Each value
comes from an environment variable or a file, never as a literal on the
command line. The answer names each stored field's byte length and SHA-256,
not the value. Compare those with the files before using the account. Values
are never read back. A teammate who asks for a seal link is refused. Say so
in one line and stop.

## Replace a login

Only a Founder or co-founder may ask for a reseal. Call
`replace_provider_connection_credential` with `request_reseal_link` true,
`alias`, and no `credential`. An active connection also sends
`expected_credential_generation` from `list_provider_connections`. A pending
one omits it. The same shell post applies. Old permits stop working after a
successful replace. A teammate is refused.

## Zoho Expense

Only a Founder or co-founder may call `issue_gateway_seal`, with `alias`,
`preset` `zoho-expense` and `region` (for India, `in`). On a re-save, also
send `expected_generation`, the number from the last save. Omit it when this
alias has not been saved. Send no login fields. The shell posts `client_id`,
`client_secret` and `refresh_token` the same way. The link lasts ten minutes
and works once. A failed check leaves it usable. A save is kept only when
Zoho answers 200. If it does not, nothing new is stored and the previous
save stays. A teammate is refused.

## Retry a saved sign-in

Only a Founder or co-founder may call `retry_provider_sign_in`, with `alias`
only, and only once for the values now stored. It sends no new password and
returns no token. A 401 or 403 locks the account until the values change,
unless the answer says the problem is the token. A bad sign-in can lock an
account at the provider, so do not call it again until those values have
been replaced. A teammate is refused.
