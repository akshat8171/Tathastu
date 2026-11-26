#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WORKFLOW_FILE="${ROOT_DIR}/workflows/auto-insta-dm.json"

if [[ ! -f "${WORKFLOW_FILE}" ]]; then
  echo "Missing workflow file: ${WORKFLOW_FILE}"
  exit 1
fi

echo "Importing ${WORKFLOW_FILE} into local n8n..."
n8n import:workflow --input="${WORKFLOW_FILE}"
echo "Done. Open http://localhost:5678 and activate: Auto Insta DM — Comment → Reply + DM"
