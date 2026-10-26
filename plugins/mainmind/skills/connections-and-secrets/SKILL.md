---
name: connections-and-secrets
description: Connect a business account to a Mainmind space without pasting a secret. Load when someone wants to add, replace or retry a provider login, API key or password, or a Zoho Expense seal, and whenever a secret is about to go into a tool argument or into chat.
---

# Connections and secrets

Never paste a secret into a tool argument or into chat. Not a password, an
API key, a refresh token, a client secret, or a one-time code. When the
values are already in the environment, a shell posts them to the seal link.
When they are not, the person posts them from their own shell. Do not ask
them to paste the values here.

Only a Founder or co-founder may ask for a seal, replace a sealed login, save
Zoho Expense, or retry a saved sign-in. A teammate is refused. Say so in one
line and stop. Do not try a second route that would carry the secret.

## See what is already connected

Call `call_provider` with mode `connections`. It returns aliases, kinds and
`credential_generation`. It does not return values. A pending connection is
listed as pending. Use the alias it returns. Do not invent one.

## Add an account

Call `call_provider` with mode `install` and `alias` (kebab-case), `profile`
(`schema` `mainmind.connection-profile/v1`, `id`, `driver`, and the origin
fields that driver requires) and `request_seal_link` true. Send no
`credential`.

The answer is `seal_url` and `seal_key`. A shell posts one JSON object of the
field names to `seal_url`, with the key in the header `X-Mainmind-Seal-Key`.
The key is not in the URL or the body. The answer names each stored field's
byte length and SHA-256, not the value. Compare those with the files before
using the account. Values are never read back.

## Replace a login, or a Zoho Expense login

Replacing a saved login, and saving a Zoho Expense login, are done in the
Mainmind app's Accounts screen. Tell the person that in one line; no tool
here does it.

## Retry a saved sign-in

Call `call_provider` with mode `retry` and `alias` only, and only once for the values
now stored. It sends no new password and returns no token. A 401 or 403 locks
the account until the values change. Shiprocket locks after repeated bad
logins, so do not call it again until those values have been replaced.
