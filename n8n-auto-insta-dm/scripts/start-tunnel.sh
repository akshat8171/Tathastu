#!/usr/bin/env bash
set -euo pipefail

PORT="${N8N_PORT:-5678}"

if command -v cloudflared >/dev/null 2>&1; then
  echo "Starting Cloudflare quick tunnel → http://localhost:${PORT}"
  echo "Copy the https://*.trycloudflare.com URL into .env as WEBHOOK_URL (no trailing slash),"
  echo "then restart n8n so production webhooks use that base."
  exec cloudflared tunnel --url "http://localhost:${PORT}"
fi

if command -v ngrok >/dev/null 2>&1; then
  echo "Starting ngrok tunnel → http://localhost:${PORT}"
  exec ngrok http "${PORT}"
fi

echo "Neither cloudflared nor ngrok found."
echo "Install one:"
echo "  brew install cloudflare/cloudflare/cloudflared"
echo "  brew install ngrok"
exit 1
