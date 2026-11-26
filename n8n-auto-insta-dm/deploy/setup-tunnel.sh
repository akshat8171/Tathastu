#!/usr/bin/env bash
# Creates a named Cloudflare tunnel + DNS route for stable n8n webhooks.
# Prerequisites:
#   1) Domain added to Cloudflare (Free plan) — NOT Vercel DNS
#   2) cloudflared installed
#   3) Browser login once
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CF_DIR="${ROOT_DIR}/cloudflared"
TUNNEL_NAME="${TUNNEL_NAME:-tathastu-n8n}"

if [[ -z "${TUNNEL_HOSTNAME:-}" ]]; then
  echo "Usage:"
  echo "  TUNNEL_HOSTNAME=n8n.yourdomain.com ./setup-tunnel.sh"
  echo
  echo "Your site tathastukeepsakes.in is currently on Vercel DNS."
  echo "Either:"
  echo "  A) Move the domain to Cloudflare (recommended), then use n8n.tathastukeepsakes.in"
  echo "  B) Use another domain that is already on Cloudflare"
  exit 1
fi

mkdir -p "${CF_DIR}"
cd "${CF_DIR}"

if [[ ! -f "${HOME}/.cloudflared/cert.pem" ]]; then
  echo "Opening Cloudflare login in your browser..."
  cloudflared tunnel login
fi

echo "Creating tunnel: ${TUNNEL_NAME}"
CREATE_OUT="$(cloudflared tunnel create "${TUNNEL_NAME}" 2>&1 || true)"
echo "${CREATE_OUT}"

# Resolve tunnel id
TUNNEL_ID="$(cloudflared tunnel list | awk -v n="${TUNNEL_NAME}" '$2==n {print $1; exit}')"
if [[ -z "${TUNNEL_ID}" ]]; then
  echo "Could not find tunnel id for ${TUNNEL_NAME}"
  exit 1
fi
echo "TUNNEL_ID=${TUNNEL_ID}"

# Copy credentials into deploy folder (docker mount)
CRED_SRC="${HOME}/.cloudflared/${TUNNEL_ID}.json"
if [[ ! -f "${CRED_SRC}" ]]; then
  echo "Missing credentials file: ${CRED_SRC}"
  exit 1
fi
cp "${CRED_SRC}" "${CF_DIR}/${TUNNEL_ID}.json"

cat > "${CF_DIR}/config.yml" <<EOF
tunnel: ${TUNNEL_ID}
credentials-file: /etc/cloudflared/${TUNNEL_ID}.json

ingress:
  - hostname: ${TUNNEL_HOSTNAME}
    service: http://n8n:5678
  - service: http_status:404
EOF

echo "Routing DNS ${TUNNEL_HOSTNAME} → tunnel ${TUNNEL_ID}"
cloudflared tunnel route dns "${TUNNEL_NAME}" "${TUNNEL_HOSTNAME}"

# Seed deploy .env WEBHOOK_URL
ENV_FILE="${ROOT_DIR}/.env"
if [[ ! -f "${ENV_FILE}" ]]; then
  cp "${ROOT_DIR}/.env.example" "${ENV_FILE}"
fi
python3 - <<PY
from pathlib import Path
env_path = Path("${ENV_FILE}")
url = "https://${TUNNEL_HOSTNAME}"
lines = []
found = False
for line in env_path.read_text().splitlines():
    if line.startswith("WEBHOOK_URL="):
        lines.append(f"WEBHOOK_URL={url}")
        found = True
    else:
        lines.append(line)
if not found:
    lines.append(f"WEBHOOK_URL={url}")
env_path.write_text("\n".join(lines) + "\n")
print(f"Updated {env_path}")
PY

echo
echo "Done."
echo "1) Fill META_* values in deploy/.env (copy token from n8n-auto-insta-dm/.env)"
echo "2) On the VPS: cd deploy && docker compose up -d"
echo "3) Meta Callback URL:"
echo "   https://${TUNNEL_HOSTNAME}/webhook/instagram-comments"
echo "   Verify token: tathastu_insta_verify_9f3k2m"
