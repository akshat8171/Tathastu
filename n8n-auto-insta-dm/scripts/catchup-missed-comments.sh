#!/usr/bin/env bash
# Fetch recent comments on mapped media and replay any that have no business reply yet.
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
# shellcheck disable=SC1091
set -a; source "${ROOT_DIR}/.env"; set +a
export ROOT_DIR
python3 << 'PY'
import csv, json, os, re, time, urllib.parse, urllib.request
from pathlib import Path

root = Path(os.environ["ROOT_DIR"])
token = os.environ["META_PAGE_ACCESS_TOKEN"]
ig = os.environ["META_IG_USER_ID"]
ver = os.environ.get("META_GRAPH_VERSION", "v27.0")
hours = float(os.environ.get("CATCHUP_HOURS", "24"))
n8n = os.environ.get("N8N_LOCAL_URL", "http://127.0.0.1:5678")

media_ids = []
with (root / "config" / "reel-message-map.csv").open(newline="", encoding="utf-8") as f:
    for row in csv.DictReader(f):
        for part in str(row.get("media_id") or "").split("|"):
            part = part.strip()
            if part.isdigit():
                media_ids.append(part)
media_ids = sorted(set(media_ids))
cutoff = time.time() - hours * 3600
print(f"Scanning {len(media_ids)} media IDs for comments in last {hours}h...")

def get(url):
    with urllib.request.urlopen(url) as r:
        return json.loads(r.read().decode())

def post_webhook(payload):
    data = json.dumps(payload).encode()
    req = urllib.request.Request(
        f"{n8n}/webhook/instagram-comments",
        data=data,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req) as r:
        return r.status, r.read().decode()

replayed = 0
skipped = 0
for mid in media_ids:
    url = (
        f"https://graph.instagram.com/{ver}/{mid}/comments"
        f"?fields=id,text,username,timestamp,from,replies{{text,username}}"
        f"&limit=25&access_token={urllib.parse.quote(token)}"
    )
    try:
        d = get(url)
    except Exception as e:
        print("media ERR", mid, e)
        continue
    for c in d.get("data") or []:
        ts = c.get("timestamp") or ""
        # 2026-11-25T17:26:38+0000
        try:
            t = time.mktime(time.strptime(ts.replace("+0000", "UTC"), "%Y-%m-%dT%H:%M:%S%Z")) if False else None
        except Exception:
            t = None
        # parse with fromisoformat-ish
        try:
            from datetime import datetime, timezone
            dt = datetime.strptime(ts, "%Y-%m-%dT%H:%M:%S%z")
            t = dt.timestamp()
        except Exception:
            continue
        if t < cutoff:
            continue
        fr = c.get("from") or {}
        uname = fr.get("username") or c.get("username") or ""
        if uname == "tathastukeepsakes" or fr.get("id") == ig:
            skipped += 1
            continue
        replies = ((c.get("replies") or {}).get("data") or [])
        already = any("please check your dm" in str(r.get("text") or "").lower() for r in replies)
        if already:
            skipped += 1
            continue
        payload = {
            "object": "instagram",
            "entry": [{
                "id": ig,
                "time": int(t),
                "changes": [{
                    "field": "comments",
                    "value": {
                        "id": c["id"],
                        "text": c.get("text") or "",
                        "from": {"id": fr.get("id") or "", "username": uname},
                        "media": {"id": mid, "media_product_type": "REELS"},
                    },
                }],
            }],
        }
        status, body = post_webhook(payload)
        print(f"REPLAY {uname} {c.get('text')!r} on {mid} -> {status} {body[:80]}")
        replayed += 1
        time.sleep(1.2)

print(f"Done. replayed={replayed} skipped={skipped}")
PY
