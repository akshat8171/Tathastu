# DNS: `n8n.tathastukeepsakes.in` → named Cloudflare tunnel

## Current status (live)

- Registrar: **Hostinger** (nameservers pointed at Cloudflare)
- Cloudflare NS: `coen.ns.cloudflare.com` / `sydney.ns.cloudflare.com`
- Named tunnel: **`tathastu-n8n`**
- Tunnel ID: `5b822b05-4ce0-4ec3-ba2a-40f87a1a369b`
- Public hostname: `n8n.tathastukeepsakes.in` (Tunnel record, **Proxied**)
- Main shop (`@` / `www`) stays on Vercel via Cloudflare DNS A/CNAME records

## Why Cloudflare nameservers (not Vercel DNS only)

A Cloudflare **named tunnel** only works when the hostname is on **Cloudflare DNS (orange-cloud / proxied)**.  
A CNAME on Vercel DNS to `*.cfargotunnel.com` is not enough — traffic must hit Cloudflare’s edge, which then routes into `cloudflared` on the laptop/VPS.

## Meta Callback (permanent — do not change on laptop restart)

```text
https://n8n.tathastukeepsakes.in/webhook/instagram-comments
```

Verify token = `META_VERIFY_TOKEN` from local `.env` (example shape: `tathastu_insta_verify_…`).

## After laptop restart (no Meta changes)

1. Start n8n (`./scripts/start-n8n.sh` or your usual process)
2. Start named tunnel:

```bash
cloudflared tunnel --config n8n-auto-insta-dm/deploy/cloudflared/config.local.yml run
```

(`config.local.yml` is gitignored — copy from `config.yml.example` and point credentials at `~/.cloudflared/<tunnel-id>.json`.)

## Recreate DNS route if missing

```bash
cloudflared tunnel route dns -f tathastu-n8n n8n.tathastukeepsakes.in
```

## Verify

```bash
dig +short NS tathastukeepsakes.in
# expect: coen.ns.cloudflare.com / sydney.ns.cloudflare.com

curl "https://n8n.tathastukeepsakes.in/webhook/instagram-comments?hub.mode=subscribe&hub.verify_token=YOUR_VERIFY_TOKEN&hub.challenge=ok"
# expect: ok
```

## Google / Merchant DNS

When NS moved to Cloudflare, copy any Google verification CNAMEs/TXT from the old Vercel DNS zone into Cloudflare (**DNS only**), e.g. `gv-*.dv.googlehosted.com` records. Analytics JS tags are unaffected (not DNS).

## Offline behavior

While the laptop (or tunnel host) is off, Meta cannot deliver webhooks. Meta does **not** replay missed comments — use catch-up scripts under `scripts/` if needed after coming back online.
