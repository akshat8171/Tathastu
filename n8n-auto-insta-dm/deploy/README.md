# Stable n8n hosting (Named Cloudflare Tunnel)

Quick tunnels die when your laptop sleeps. A **named tunnel** keeps one fixed HTTPS URL for Meta webhooks.

## Status (live)

- Named tunnel **`tathastu-n8n`**  
  ID: `5b822b05-4ce0-4ec3-ba2a-40f87a1a369b`
- Hostname: **`n8n.tathastukeepsakes.in`** (Cloudflare Tunnel, proxied)
- Registrar Hostinger → Cloudflare NS (`coen` / `sydney`)
- Shop site stays on Vercel via Cloudflare DNS for `@` / `www`

See **[DNS-FIX.md](./DNS-FIX.md)** for DNS history, Google record notes, and restart steps.

## Meta Callback (permanent)

```text
https://n8n.tathastukeepsakes.in/webhook/instagram-comments
```

Laptop restart: **do not** change Meta. Restart local n8n + named `cloudflared` only.

## Create / recreate named tunnel

```bash
cd "n8n-auto-insta-dm/deploy"
chmod +x setup-tunnel.sh
TUNNEL_HOSTNAME=n8n.tathastukeepsakes.in ./setup-tunnel.sh
```

Local connector (credentials under `~/.cloudflared/`, `config.local.yml` gitignored):

```bash
cloudflared tunnel --config cloudflared/config.local.yml run
```

## Run on a VPS

1. Copy this `deploy/` folder + parent `config/` to the VPS
2. Fill `deploy/.env` Meta tokens (from local `n8n-auto-insta-dm/.env`)
3. Start:

```bash
cd deploy
docker compose up -d
```

Point the same hostname at the VPS connector (or run `cloudflared` there with the same tunnel id).

## Cost

| Piece | Cost |
|-------|------|
| Cloudflare Free + named tunnel | Free |
| n8n local / self-host | Free |
| VPS (optional always-on) | Provider pricing |

## Secrets

Do not commit:

- `.env`
- `cloudflared/*.json` credentials
- `cloudflared/cert.pem`
- `cloudflared/config.local.yml`
