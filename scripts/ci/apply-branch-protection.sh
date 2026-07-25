#!/usr/bin/env bash
# apply-branch-protection.sh
# Idempotent script to apply branch protection rules to the `main` branch
# via the GitHub API.
#
# Usage:
#   CONFIRM=1 bash scripts/ci/apply-branch-protection.sh
#
# Requirements:
#   - `gh` CLI authenticated (run `gh auth login` if needed)
#   - CONFIRM=1 environment variable (safety guard against accidental execution)

set -euo pipefail

# ── Configuration ─────────────────────────────────────────────────────────────
REPO="${REPO:-akshat8171/Tathastu}"
BRANCH="${BRANCH:-main}"

# ── Safety check ──────────────────────────────────────────────────────────────
if [[ "${CONFIRM:-}" != "1" ]]; then
  echo "ERROR: This script applies branch protection rules via the GitHub API."
  echo "To confirm execution, set CONFIRM=1:"
  echo ""
  echo "  CONFIRM=1 bash $0"
  echo ""
  exit 1
fi

# ── Preflight ─────────────────────────────────────────────────────────────────
if ! command -v gh &>/dev/null; then
  echo "ERROR: gh CLI not found. Install it from https://cli.github.com"
  exit 1
fi

if ! gh auth status &>/dev/null; then
  echo "ERROR: gh CLI not authenticated. Run: gh auth login"
  exit 1
fi

echo "Applying branch protection rules to ${REPO}:${BRANCH}..."
echo ""

# ── Payload ───────────────────────────────────────────────────────────────────
# GitHub API: PUT /repos/{owner}/{repo}/branches/{branch}/protection
# https://docs.github.com/en/rest/branches/branch-protection
PAYLOAD=$(cat <<'EOF'
{
  "required_status_checks": {
    "strict": true,
    "contexts": [
      "Typecheck · Lint · Test · Build"
    ]
  },
  "enforce_admins": false,
  "required_pull_request_reviews": {
    "dismiss_stale_reviews": false,
    "require_code_owner_reviews": false,
    "required_approving_review_count": 0
  },
  "restrictions": null,
  "required_conversation_resolution": true,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "block_creations": false,
  "required_linear_history": false,
  "lock_branch": false
}
EOF
)

echo "Payload:"
echo "$PAYLOAD" | jq .
echo ""

# ── Apply ─────────────────────────────────────────────────────────────────────
echo "Sending PUT /repos/${REPO}/branches/${BRANCH}/protection..."
gh api \
  --method PUT \
  -H "Accept: application/vnd.github+json" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  "/repos/${REPO}/branches/${BRANCH}/protection" \
  --input - <<< "$PAYLOAD"

echo ""
echo "✓ Branch protection applied successfully."
echo "Verify at: https://github.com/${REPO}/settings/branches"
