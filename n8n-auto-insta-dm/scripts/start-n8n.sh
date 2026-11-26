#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="${ROOT_DIR}/.env"

if [[ -f "${ENV_FILE}" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "${ENV_FILE}"
  set +a
  echo "Loaded env from ${ENV_FILE}"
else
  echo "WARNING: ${ENV_FILE} not found. Copy config/env.example to .env first."
fi

export N8N_HOST="${N8N_HOST:-0.0.0.0}"
export N8N_PORT="${N8N_PORT:-5678}"
export N8N_PROTOCOL="${N8N_PROTOCOL:-http}"
export GENERIC_TIMEZONE="${GENERIC_TIMEZONE:-Asia/Kolkata}"
export N8N_EDITOR_BASE_URL="${N8N_EDITOR_BASE_URL:-http://localhost:${N8N_PORT}}"

# Required so Meta can call your public tunnel URL mapped to local n8n
if [[ -n "${WEBHOOK_URL:-}" ]]; then
  export WEBHOOK_URL
  echo "WEBHOOK_URL=${WEBHOOK_URL}"
else
  echo "NOTE: Set WEBHOOK_URL to your tunnel (ngrok/cloudflared) production webhook base."
fi

# Expose Meta vars to workflow Code/HTTP nodes via $env.*
export META_VERIFY_TOKEN="${META_VERIFY_TOKEN:-tathastu_insta_verify_change_me}"
export META_PAGE_ACCESS_TOKEN="${META_PAGE_ACCESS_TOKEN:-}"
export META_IG_USER_ID="${META_IG_USER_ID:-}"
export META_GRAPH_VERSION="${META_GRAPH_VERSION:-v21.0}"

# Allow $env access inside Code nodes
export N8N_BLOCK_ENV_ACCESS_IN_NODE="${N8N_BLOCK_ENV_ACCESS_IN_NODE:-false}"

# Reel → DM mapping sheet (CSV). Edit CSV, next comment picks it up.
export REEL_MAP_CSV_PATH="${REEL_MAP_CSV_PATH:-${ROOT_DIR}/config/reel-message-map.csv}"
export REEL_MAP_SETTINGS_PATH="${REEL_MAP_SETTINGS_PATH:-${ROOT_DIR}/config/settings.csv}"
export NODE_FUNCTION_ALLOW_BUILTIN="${NODE_FUNCTION_ALLOW_BUILTIN:-fs}"
echo "REEL_MAP_CSV_PATH=${REEL_MAP_CSV_PATH}"

echo "Starting n8n on ${N8N_PROTOCOL}://${N8N_HOST}:${N8N_PORT}"
echo "UI: http://localhost:${N8N_PORT}"
exec n8n start
