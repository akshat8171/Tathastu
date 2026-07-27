# Branch Protection Settings for `main`

This document describes the recommended branch protection rules for the `main` branch. These settings must be configured manually via the GitHub UI or applied idempotently using the script in `scripts/ci/apply-branch-protection.sh`.

## Why Branch Protection?

Branch protection prevents:
- Direct pushes to `main` that skip code review
- Merging PRs with failing CI checks
- Force-pushes that rewrite history and break deployments
- Merging stale branches that haven't rebased on the latest `main`

## Recommended Settings

### 1. **Require Pull Request Before Merge**
   - **Setting**: Require a pull request before merging
   - **Minimum approvals**: 1 (adjust to 0 for solo dev, 2+ for team workflows)
   - **Why**: Enforces code review and prevents accidental direct pushes to `main`.

### 2. **Require Status Checks to Pass**
   - **Setting**: Require status checks to pass before merging
   - **Required check**: `Typecheck · Lint · Test · Build` (the `quality` job from `.github/workflows/ci.yml`)
   - **How to find the check name**:
     1. Open any PR and scroll to the "Checks" section at the bottom.
     2. Look for the workflow named **CI**. Under it, you'll see a check named **Typecheck · Lint · Test · Build**.
     3. That is the status-check context name that must pass before merge.
   - **Why**: Prevents merging code that doesn't compile, lint, test, or build.

### 3. **Require Branches to Be Up to Date**
   - **Setting**: Require branches to be up to date before merging
   - **Why**: Ensures the PR has been tested against the latest `main`, reducing merge-conflict surprises and integration bugs post-merge.

### 4. **Require Conversation Resolution**
   - **Setting**: Require conversation resolution before merging
   - **Why**: Ensures all PR review comments are addressed (or explicitly resolved as "won't fix") before merge.

### 5. **Do Not Allow Force-Push**
   - **Setting**: Do not allow force-pushing
   - **Why**: Prevents rewriting `main` history, which breaks deployed commits and causes confusion in CI/CD logs.

### 6. **Do Not Allow Deletion**
   - **Setting**: Do not allow deletion
   - **Why**: Prevents accidental deletion of the main branch.

### 7. **(Optional) Require CodeQL Scan**
   - **Setting**: Require the CodeQL status check to pass
   - **Check name**: `CodeQL JavaScript/TypeScript` (from `.github/workflows/codeql.yml`)
   - **Why**: Enforces security scanning before merge. Enable this once CodeQL runs are stable and not producing false positives.

## How to Apply These Settings

### Option A: GitHub UI (Manual)
1. Navigate to: **Settings → Branches → Branch protection rules**
2. Click **Add rule** (or edit the existing rule for `main`)
3. Configure the settings listed above
4. Click **Save changes**

### Option B: Automated Script (Recommended)
Run the idempotent script that applies these settings via the GitHub API:

```bash
cd scripts/ci
CONFIRM=1 bash apply-branch-protection.sh
```

See `scripts/ci/apply-branch-protection.sh` for details. The script requires:
- `gh` CLI authenticated
- `CONFIRM=1` environment variable to prevent accidental execution

## Verification

After applying, verify the settings by attempting to:
1. Push directly to `main` (should be blocked)
2. Merge a PR with a failing CI check (should be blocked)
3. Merge a stale PR without rebasing (should require update)

## Notes

- The CI status-check context name (`Typecheck · Lint · Test · Build`) comes from the `name` field in the `quality` job in `.github/workflows/ci.yml`.
- If you rename the CI job, you must update the branch protection rule accordingly.
- CodeQL runs weekly on a schedule and on every push/PR to `main`. Enable it as a required check once you're confident in the scan results.
