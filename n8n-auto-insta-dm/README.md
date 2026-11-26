# Auto Insta DM (local n8n)

Comment on a mapped Reel → public reply **"Please check your DM"** → private DM with that Reel’s mapped message.

n8n on this machine: `/opt/homebrew/bin/n8n` (v2.7.5) · data in `~/.n8n`

## Flow

```
Instagram comment webhook
  → identify media_id (which reel)
  → lookup reel → message map
  → POST /{comment-id}/replies                 ("Please check your DM")
  → POST /{ig-user-id}/messages                (mapped DM via recipient.comment_id)
```

Each reel can have its own message (or a list — pick `first`, `random`, or join `all`).

## 1. Configure env

```bash
cd "n8n-auto-insta-dm"
cp config/env.example .env
```

Fill in:

| Variable | What it is |
|---|---|
| `META_VERIFY_TOKEN` | Any secret string; same value in Meta webhook settings |
| `META_PAGE_ACCESS_TOKEN` | Long-lived **Page** access token |
| `META_IG_USER_ID` | Instagram Business/Creator account ID |
| `WEBHOOK_URL` | Public base URL. **Production:** `https://n8n.tathastukeepsakes.in` (Cloudflare named tunnel). Quick `trycloudflare` URLs are temporary only. |

## 2. Meta app setup (one-time)

1. [Meta Developers](https://developers.facebook.com/) → App → add **Instagram** + **Webhooks**.
2. Connect Instagram Professional account to a Facebook Page.
3. Permissions (App Review for live; Dev mode works for testers):
   - `instagram_basic`
   - `instagram_manage_comments`
   - `instagram_manage_messages`
   - `pages_show_list`
   - `pages_manage_metadata`
   - `pages_messaging`
4. Webhooks → Instagram → subscribe field: **`comments`**.
5. Callback URL (after tunnel + n8n are up) — **hyphen, not slash**:
   - **Stable (use this in Meta):** `https://n8n.tathastukeepsakes.in/webhook/instagram-comments`
   - Wrong path shape: `…/webhook/instagram/comments` (404 in n8n)
   - Verify token = `META_VERIFY_TOKEN` from `.env`
   - Subscribe webhook field **`comments`** (not `instagram_manage_comments`)
   - Prefer **Instagram → API setup with Instagram login → Configure webhooks**, not the permissions-style Webhooks table
   - Laptop restart: **do not** change Meta — only restart local n8n + named `cloudflared` (see `deploy/DNS-FIX.md`)

## 3. Map reels → DMs (mapping sheet)

List media IDs:

```bash
./scripts/list-ig-media.sh
```

**Edit the mapping sheet** (one row per **product**):

| Column | Meaning |
|---|---|
| `enabled` | `TRUE` / `FALSE` |
| `media_id` | Optional. One or more Instagram media IDs, separated by `\|` |
| `reel_name` | Product name |
| `reel_url` | One or more Instagram reel/post links, separated by `\|` |
| `dm_message` | Exact private DM text sent after comment |
| `notes` | Optional |

Multiple reels can share one product message — put all links in `reel_url` like:

`https://www.instagram.com/p/AAAA/ | https://www.instagram.com/reel/BBBB/`

Every DM is sent as:

```text
<permalink of the commented reel/post>

<dm_message from the sheet>
```

Toggle with `prepend_reel_link` in `config/settings.csv` (default `TRUE`).

Files:

1. **Local sheet (used by automation):** `config/reel-message-map.csv`  
   Open in Excel / Numbers / Google Sheets desktop. Edit `dm_message`, save.
2. **Browser Google Sheet:** [Tathastu Auto Insta DM — Reel Map](https://docs.google.com/spreadsheets/d/1YMRtxyWcCj3zol2vgh-6Ht7byDEoS6eoTkT4JyaB_l4/edit)  
   Edit there, then copy rows into the local CSV (org policy blocks public CSV export).
3. **Public reply text:** `config/settings.csv` → `public_comment_reply`

After CSV edits, either:

- Restart n8n with `./scripts/start-n8n.sh` (CSV is read live via `REEL_MAP_CSV_PATH`), or
- Run `./scripts/sync-reel-map.sh` to refresh JSON + embedded workflow fallback

Example CSV row:

```csv
TRUE,1789xxxxxxxxxxxx,Diwali reel,https://www.instagram.com/reel/XXXX/,Hey! Your Diwali offer: https://www.tathastukeepsakes.in/,
```

## 4. Start locally

Terminal A — n8n:

```bash
chmod +x scripts/*.sh
./scripts/start-n8n.sh
```

Terminal B — public tunnel (Meta cannot hit localhost):

```bash
./scripts/start-tunnel.sh
```

Put the tunnel HTTPS URL into `.env` as `WEBHOOK_URL`, restart n8n, then import/activate:

```bash
./scripts/import-workflow.sh
```

Open http://localhost:5678 → open **Auto Insta DM — Comment → Reply + DM** → **Active**.

Production webhook path:

`{{WEBHOOK_URL}}/webhook/instagram-comments`

## 5. Test

1. Comment on a mapped reel from a **different** IG account (own comments are ignored).
2. Expect public reply + DM within a few seconds.
3. Check n8n **Executions** for `Log Result` / API errors.

## Important Instagram limits

- **Private reply** only works from a **comment** (API: `private_replies`), once per commenter/thread rules Meta enforces.
- User must allow message requests / you need messaging access.
- Webhooks need a **public HTTPS** URL — use the tunnel while hosting locally.
- Replace placeholder `REPLACE_WITH_REEL_MEDIA_ID_*` or those reels will never match.

## Folder layout

```
n8n-auto-insta-dm/
  config/env.example
  config/reel-message-map.json
  workflows/auto-insta-dm.json
  scripts/start-n8n.sh
  scripts/start-tunnel.sh
  scripts/import-workflow.sh
  scripts/list-ig-media.sh
```
