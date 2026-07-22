# Pinterest Daily Autopilot — Setup

This directory holds a fully autonomous agent that publishes **one SEO-optimized
Pinterest Pin per day** for Tathastu Keepsakes. It runs on a GitHub Actions cron
(09:00 IST daily), picks the least-recently-posted product from
`lib/products.json`, writes Pinterest-tuned copy with Google Gemini, and
publishes via the official **Pinterest API v5**.

You only have to do this setup **once**. After that it runs hands-off.

---

## What you need

1. A Pinterest **business** account (the store account you want to post to).
2. Access to this GitHub repository's **Settings** (to add secrets).
3. A **Google Gemini API key** (from Google AI Studio — for generating the Pin copy).

Total time: ~15 minutes.

---

## Step 1 — Create a Pinterest developer app

1. Log in to the Pinterest business account you want to publish from.
2. Go to **<https://developers.pinterest.com/apps/>** and click **Create app** (also called "Connect app").
3. Give it a name (e.g. `Tathastu Autopilot`) and a description. Approve the terms.
4. Once created, open the app and copy two values from the app details page:
   - **App ID** (a number) → this is `PINTEREST_APP_ID`
   - **App secret token** → this is `PINTEREST_APP_SECRET`

   > Treat the app secret like a password. Never commit it or paste it into code.

5. Under the app's **Scopes**, make sure these four are enabled/requested:
   `boards:read`, `boards:write`, `pins:read`, `pins:write`.
6. **Enable two-factor authentication (2FA)** on the Pinterest account. Pinterest
   **requires 2FA to be on** to use the `client_credentials` grant — without it,
   the very first token mint fails. Account → Settings → Security → enable 2FA.

That's it — **no OAuth redirect, no refresh token, no manual token copying** is
needed for the default setup. See "How authentication works" below for why.

> **Trial vs. Standard access.** A brand-new app starts with *Trial access*,
> which is enough to publish to **your own** account (exactly what this agent
> does). If Pinterest ever rejects the calls with a scope/access error, apply
> for **Standard access** from the app page — approval is typically quick for a
> single-account posting use case. This is the only step that could require
> waiting on Pinterest, and it does not block finishing setup.

---

## Step 2 — Get a Google Gemini API key

1. Go to **<https://aistudio.google.com/app/apikey>** and sign in with a Google account.
2. Click **Create API key**, then copy it → this is `GEMINI_API_KEY`.

The agent uses model `gemini-2.5-flash` to generate each Pin's title, description,
and board suggestion. Cost is a fraction of a cent per day (one short request) —
and Google's free tier typically covers this volume outright.

---

## Step 3 — Add the GitHub Actions secrets

In this repository, go to **Settings → Secrets and variables → Actions →
Secrets tab → New repository secret**, and add these **three** secrets:

| Secret name             | Value                                    |
| ----------------------- | ---------------------------------------- |
| `GEMINI_API_KEY`        | your Google Gemini key from Step 2       |
| `PINTEREST_APP_ID`      | the App ID from Step 1                   |
| `PINTEREST_APP_SECRET`  | the App secret token from Step 1         |

> **Security:** these are encrypted by GitHub and are never printed in logs or
> committed to the repo. Do **not** put them in `.env`, code, or this file.
> GitHub also participates in Pinterest/Google secret-scanning and will
> auto-revoke a token if it's ever committed by accident — so keep them here.

You do **not** need `PINTEREST_REFRESH_TOKEN` for the default setup.

---

## Step 4 — (Optional) Override defaults with repository variables

The workflow reads two optional **variables** (Settings → Secrets and variables
→ Actions → **Variables** tab). Skip this section unless you need to change a
default.

| Variable name          | Default                                   | When to change                          |
| ---------------------- | ----------------------------------------- | --------------------------------------- |
| `SITE_ORIGIN`          | `https://www.tathastukeepsakes.in`        | If the storefront moves to a new domain |
| `PINTEREST_AUTH_MODE`  | `client_credentials`                      | Only to switch to the refresh-token fallback (see below) |

The product image and link that each Pin points to are built from `SITE_ORIGIN`,
e.g. `https://www.tathastukeepsakes.in/products/<id>`. The images must be
**publicly reachable** — the agent prechecks each URL before posting and fails
loudly if it isn't (so a broken Pin is never created).

---

## Step 5 — Verify it works (dry run)

You can test the whole pipeline **without publishing anything**:

1. Go to the **Actions** tab → **Pinterest Daily Autopilot** → **Run workflow**.
2. Set **Dry run** to `true` and run it.

A dry run does everything *except* minting a token, the live publish, and the
log append: it loads config, picks the top-ranked product, verifies its image is
reachable, generates the SEO copy with Gemini, and prints the assembled payload
(title, description, board, link, image URL). If that step is green, the daily
schedule will publish for real.

To run it locally instead:

```bash
# from the repo root, with the three secrets exported as env vars
npx tsx scripts/pinterest/run.ts --dry-run
```

Once the dry run looks good, do one real manual run (**Dry run = false**) to
confirm a Pin actually appears on the account. After that, the cron takes over.

---

## How it runs

- **Schedule:** `.github/workflows/pinterest-daily.yml` runs at `30 3 * * *`
  UTC = **09:00 IST every day**. You can also trigger it manually anytime from
  the Actions tab.
- **Selection:** `products.ts` ranks products by least-recently-posted
  (never-posted first), so the catalog rotates fairly with no repeats until every
  product has had a turn. Each run walks the ranked list and **skips any product
  that fails** (e.g. a dead image URL), publishing the next viable one — so a
  single bad catalog entry can never halt the daily posting.
- **State:** each successful post is appended to
  `scripts/pinterest/state/posted-log.json`, which the workflow commits back to
  the repo (`[skip ci]`) so the rotation survives across runs. This file
  contains only public metadata (product id, pin id, board, title, timestamp) —
  **no secrets**.
- **Safety:** state is written *only after* a confirmed publish, so a failure
  never corrupts the rotation — the next run simply retries the same product.
  A `concurrency` guard prevents two runs from overlapping.

---

## How authentication works (and why there's no token to manage)

The agent mints a **fresh, short-lived access token at the start of every run** —
it never stores one. There are two modes, chosen by `PINTEREST_AUTH_MODE`:

### Default: `client_credentials` (app-only) — recommended

Pinterest's **Client Credentials** grant issues an app-only token that acts on
the app owner's own account. The request is:

```
POST https://api.pinterest.com/v5/oauth/token
Authorization: Basic base64(APP_ID:APP_SECRET)
Content-Type: application/x-www-form-urlencoded

grant_type=client_credentials&scope=boards:read,boards:write,pins:read,pins:write
```

There is **no refresh token and no token rotation** — the App ID + secret are all
that's needed, forever. This is Pinterest's own recommended path for
machine-to-machine / cron jobs, and it's why the daily agent is truly hands-off.

### Fallback: `refresh_token` (Authorization Code flow)

Only use this if your app genuinely cannot post app-only. To switch:

1. Set repository **variable** `PINTEREST_AUTH_MODE` = `refresh_token`.
2. Complete Pinterest's OAuth Authorization-Code flow once to obtain a refresh
   token, and add it as a **secret** named `PINTEREST_REFRESH_TOKEN`.

> ⚠️ **Important caveat.** Pinterest's modern "continuous" refresh token
> **rotates on every refresh** and the previous one expires within ~60 days. A
> statically-stored refresh token is therefore **not** indefinitely autonomous —
> it will eventually stop working and need to be re-minted. This is exactly why
> `client_credentials` is the default. Prefer it unless you have no choice.

---

## Environment variables reference

| Variable                  | Required?                          | Default                              | Purpose                                              |
| ------------------------- | ---------------------------------- | ------------------------------------ | ---------------------------------------------------- |
| `GEMINI_API_KEY`          | ✅ always                          | —                                    | Generates the Pin's SEO copy (`gemini-2.5-flash`)    |
| `PINTEREST_APP_ID`        | ✅ always                          | —                                    | Pinterest app identifier (Basic-auth user)           |
| `PINTEREST_APP_SECRET`    | ✅ always                          | —                                    | Pinterest app secret (Basic-auth password)           |
| `PINTEREST_AUTH_MODE`     | ❌ optional                        | `client_credentials`                 | `client_credentials` or `refresh_token`              |
| `PINTEREST_REFRESH_TOKEN` | ⚠️ only if mode is `refresh_token` | —                                    | The (rotating) continuous refresh token              |
| `PINTEREST_SCOPES`        | ❌ optional                        | `boards:read,boards:write,pins:read,pins:write` | Scopes requested for the app-only token   |
| `SITE_ORIGIN`             | ❌ optional                        | `https://www.tathastukeepsakes.in`   | Base URL for product links + images                  |

Secrets go in the **Secrets** tab; the optional overrides (`PINTEREST_AUTH_MODE`,
`SITE_ORIGIN`) go in the **Variables** tab.

---

## Troubleshooting

| Symptom in the Actions log                                   | Likely cause & fix                                                                 |
| ------------------------------------------------------------ | ---------------------------------------------------------------------------------- |
| `missing required environment variables: ...`               | A secret wasn't added, or has a typo in its name. Re-check Step 3.                  |
| `client_credentials token request failed (401 ...)`         | Wrong `PINTEREST_APP_ID`/`PINTEREST_APP_SECRET`, or the app lacks the scopes.       |
| `token request failed (403 ...)` / scope error             | App is still on Trial access without the needed scopes → apply for Standard access. |
| `authMode is "refresh_token" but PINTEREST_REFRESH_TOKEN...` | You set the mode to `refresh_token` but didn't add the token secret.               |
| `refresh_token token request failed` after ~60 days         | The continuous refresh token rotated/expired. Re-mint it, or switch back to `client_credentials`. |
| `image not reachable: ...`                                  | The product image URL (from `SITE_ORIGIN`) is 404/private. Fix the URL or the site. |
| Gemini `401`/`403` or `API key not valid`                   | `GEMINI_API_KEY` is wrong or revoked. Create a new key (Step 2).                   |

To debug without posting, re-run with **Dry run = true** and read the printed
payload — it shows exactly what would be published.
