#!/usr/bin/env bash
# Lists recent Instagram media IDs so you can map reels → DM messages.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="${ROOT_DIR}/.env"

if [[ -f "${ENV_FILE}" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "${ENV_FILE}"
  set +a
fi

: "${META_PAGE_ACCESS_TOKEN:?Set META_PAGE_ACCESS_TOKEN in .env}"
: "${META_IG_USER_ID:?Set META_IG_USER_ID in .env}"
GRAPH_VERSION="${META_GRAPH_VERSION:-v21.0}"

URL="https://graph.facebook.com/${GRAPH_VERSION}/${META_IG_USER_ID}/media?fields=id,caption,media_type,media_product_type,permalink,timestamp&limit=25&access_token=${META_PAGE_ACCESS_TOKEN}"

echo "Fetching recent IG media for ${META_IG_USER_ID}..."
curl -sS "${URL}" | python3 -c "
import json, sys
payload = json.load(sys.stdin)
if 'error' in payload:
    print(json.dumps(payload['error'], indent=2))
    raise SystemExit(1)
for item in payload.get('data', []):
    caption = (item.get('caption') or '').replace('\n', ' ')[:60]
    kind = item.get('media_product_type') or item.get('media_type')
    print('%s | %s | %s | %s' % (item.get('id'), kind, item.get('timestamp'), caption))
    print('  %s' % item.get('permalink'))
"
