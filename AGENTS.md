# AGENTS.md — Tathastu Keepsakes

Context for AI coding agents working in this repo.

## Product

E-commerce for 3D-printed keepsakes (miniatures, lamps, decor, custom prints).

- **Live shop:** https://www.tathastukeepsakes.in
- **Stack:** Next.js (App Router) + TypeScript + Tailwind + Supabase + Firebase auth + Razorpay + Vercel

## Repo map (high level)

| Path | Role |
|------|------|
| `app/` | Next.js routes + API |
| `components/` | UI |
| `lib/` | Shared server/client helpers |
| `supabase/` | SQL / migrations |
| `n8n-auto-insta-dm/` | **Local Instagram comment → DM automation (n8n)** |
| `docs/` | Ops / reference docs |

Do not commit secrets (`.env`, Cloudflare tunnel credentials, Meta tokens).

---

## Auto Insta DM (`n8n-auto-insta-dm/`)

### What it does

1. Meta sends Instagram **comment** webhooks to n8n.
2. Workflow matches the comment’s media to a **reel → message map**.
3. Public reply: **"Please check your DM"**.
4. Private DM via Instagram Messaging API (`POST /{ig-user-id}/messages` with `recipient.comment_id`), not legacy `private_replies`.
5. DM body = reel permalink + mapped sheet message (`|` separates multiple URLs/media IDs on one product row).

### Important paths

| Path | Purpose |
|------|---------|
| `workflows/auto-insta-dm.json` | Importable n8n workflow (id in local n8n: `OHQbezysD1WPN878`) |
| `config/reel-message-map.csv` | Product / reel → DM mapping sheet |
| `config/settings.csv` | Map behaviour (e.g. prepend reel link) |
| `config/env.example` | Env template (copy to `.env`, gitignored) |
| `scripts/start-n8n.sh` | Start local n8n with webhook env |
| `scripts/start-tunnel.sh` | Quick tunnel helper (temporary only) |
| `scripts/sync-reel-map.sh` | Sync map into n8n-friendly JSON |
| `scripts/catchup-missed-comments.sh` | Best-effort catch-up after downtime |
| `deploy/` | Named Cloudflare tunnel + docker-compose notes |
| `deploy/DNS-FIX.md` | DNS / Meta callback / restart runbook |

### Public URL (stable)

- **Hostname:** `n8n.tathastukeepsakes.in`
- **Meta Callback:** `https://n8n.tathastukeepsakes.in/webhook/instagram-comments`
- **DNS:** Hostinger registrar → Cloudflare nameservers (`coen` / `sydney`); shop `@`/`www` still on Vercel; `n8n` is a **Cloudflare Tunnel** record (proxied) to tunnel `tathastu-n8n` (`5b822b05-4ce0-4ec3-ba2a-40f87a1a369b`).
- **Do not** change the Meta callback when the laptop restarts. Only restart **n8n** + **named cloudflared**.

### Local runtime

- n8n binary typically `/opt/homebrew/bin/n8n`; data in `~/.n8n`
- Named tunnel config (local, gitignored): `deploy/cloudflared/config.local.yml` → `http://127.0.0.1:5678`
- Credentials live under `~/.cloudflared/` (never commit `*.json` / `cert.pem`)

```bash
cd n8n-auto-insta-dm
cp config/env.example .env   # fill Meta tokens
./scripts/start-n8n.sh
cloudflared tunnel --config deploy/cloudflared/config.local.yml run
```

### Gotchas

- Webhook path must be `/webhook/instagram-comments` (hyphen), not `/webhook/instagram/comments`.
- Prefer Instagram Login Graph host patterns used by the workflow (`graph.instagram.com` where applicable).
- Quick `trycloudflare.com` URLs die on sleep/restart and rate-limit (429) if spammed — use the named host.
- Meta does **not** replay webhooks missed while offline; use catch-up scripts if needed.
- Moving DNS to Cloudflare requires re-adding Google verification CNAMEs/TXT in the Cloudflare zone (Analytics JS tags are unaffected).

### Agent rules for this folder

- Never commit `.env`, tunnel credentials, or real Meta page tokens.
- Prefer editing the CSV mapping + workflow JSON over one-off hardcoded DMs.
- After DNS/tunnel changes, verify with a Meta challenge `curl` against `n8n.tathastukeepsakes.in` before telling the user Meta is ready.

---

## Conventions (shop app)

- Prefer small, focused changes; match existing TypeScript/React patterns.
- Keep storefront and admin concerns separated.
- Do not invent new infra (extra tunnels, new DNS providers) when the named Cloudflare tunnel already covers Meta webhooks.
