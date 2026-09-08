# Tathastu — Deployment Guide

## How to Deploy (Vercel Dashboard — no CLI token needed)

### Step 1 — Import the project

1. Go to https://vercel.com and sign in (or sign up) with GitHub.
2. Click **Add New → Project**.
3. Find **akshat8171/Tathastu** in the repository list and click **Import**.
4. Vercel auto-detects Next.js. Leave all build settings at their defaults:
   - Framework: **Next.js**
   - Build Command: `next build`
   - Output Directory: `.next`
   - Install Command: `npm install`

### Step 2 — Set environment variables

Before clicking Deploy, expand **Environment Variables** and add each of the following.

**Public variables** (safe to expose in browser bundles — prefix `NEXT_PUBLIC_`):

| Name | Where to get it |
|------|-----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase dashboard → Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` | Supabase dashboard → Project Settings → API → anon/public key |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Razorpay Dashboard → Settings → API Keys → Key ID |

**Server-only configuration** (not inlined into the browser bundle):

| Name | Where to get it |
|------|-----------------|
| `APP_URL` | Your production URL, e.g. `https://www.tathastukeepsakes.in` |

**Secret variables** (server-side only — never exposed to browsers):

| Name | Where to get it |
|------|-----------------|
| `RAZORPAY_KEY_ID` | Same Key ID as above (server copy) |
| `RAZORPAY_KEY_SECRET` | Razorpay Dashboard → Settings → API Keys → Key Secret |
| `RAZORPAY_WEBHOOK_SECRET` | Razorpay Dashboard → Settings → Webhooks → Secret |
| `ADMIN_EMAILS` | Comma-separated allowlist of admin email addresses. If unset, falls back to `tathastukeepsakes@gmail.com` (see Admin access below) |

Set all variables for **Production**, **Preview**, and **Development** unless you want separate test keys for preview deploys (recommended: use Razorpay `test` keys for Preview).

### Step 3 — Deploy

Click **Deploy**. The first build takes 2–3 minutes. Your site will be live at a URL like `https://tathastu.vercel.app`.

---

## Automatic deploys after initial setup

| Event | What Vercel does |
|-------|-----------------|
| Push to `main` | Builds and promotes to **Production** |
| Open or push to any PR | Builds a **Preview** deploy with a unique URL |
| Merge PR to `main` | Triggers a new Production deploy |

All pushes and PRs are also gated by **GitHub Actions CI** (see `.github/workflows/ci.yml`), which runs typecheck → lint → test → build before Vercel ever starts. A red CI check blocks the PR from merging.

---

## Adding a custom domain (optional)

1. In your Vercel project, go to **Settings → Domains**.
2. Add your domain (e.g. `tathastu.in`).
3. Follow the DNS instructions (CNAME or A record) from Vercel.
4. Update `APP_URL` in your environment variables to match.

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Build fails with missing env var | Add the variable in Vercel → Settings → Environment Variables and redeploy |
| Images not loading | Check `next.config.js` → `remotePatterns`; add the hostname if it's a new image source |
| 404 on dynamic routes | Clear Vercel cache and redeploy; ensure `generateStaticParams` covers the slug |
| Supabase auth not working | Verify `NEXT_PUBLIC_SUPABASE_URL` and key match your Supabase project |

---

*Keep `.env.local` out of version control. Real secrets live in Vercel's dashboard, never in the repo.*

---

## Complete Environment Variable Reference

The table in Step 2 above is a **quick-start subset**. Below is the **complete** environment matrix for Production, Preview, and Development.

### Public Variables (NEXT_PUBLIC_* — safe to expose in browser bundles)

| Variable | Description | Where to get it | Required? |
|----------|-------------|-----------------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Supabase dashboard → Project Settings → API → Project URL | **Required** |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` | Supabase anon/public key | Supabase dashboard → Project Settings → API → anon/public key | **Required** |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Razorpay Key ID (browser) | Razorpay Dashboard → Settings → API Keys | **Required** |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase client API key | Firebase console → Project settings → General → Your apps → SDK setup | **Required** |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase auth domain | Firebase console → Project settings → General → Your apps → SDK setup | **Required** |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID | Firebase console → Project settings → General → Your apps → SDK setup | **Required** |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket | Firebase console → Project settings → General → Your apps → SDK setup | **Required** |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID | Firebase console → Project settings → General → Your apps → SDK setup | **Required** |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase app ID | Firebase console → Project settings → General → Your apps → SDK setup | **Required** |
| `NEXT_PUBLIC_MOCK_PAYMENT` | E2E test mode (LOCAL ONLY) | Set to `true` for local mock payments; **NEVER set in Vercel** | Optional (dev only) |

### Server-Only Variables (NO NEXT_PUBLIC_ prefix — never inlined into browser bundles)

| Variable | Description | Where to get it | Required? |
|----------|-------------|-----------------|-----------|
| `APP_URL` | Canonical site origin (not a secret; kept server-side so Next.js does not inline it into the browser) | Production/preview URL, e.g. `https://www.tathastukeepsakes.in` | **Required** |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (bypasses RLS for order writes) | Supabase dashboard → Project Settings → API → service_role (secret) | **Required** |
| `RAZORPAY_KEY_ID` | Razorpay Key ID (server) | Razorpay Dashboard → Settings → API Keys | **Required** |
| `RAZORPAY_KEY_SECRET` | Razorpay Key Secret | Razorpay Dashboard → Settings → API Keys | **Required** |
| `RAZORPAY_WEBHOOK_SECRET` | Razorpay webhook HMAC secret | Razorpay Dashboard → Settings → Webhooks | Optional (required for webhook) |
| `FIREBASE_PROJECT_ID` | Firebase admin project ID | Firebase console → Project settings → Service accounts → Generate new private key (JSON) | **Required** |
| `FIREBASE_CLIENT_EMAIL` | Firebase admin service account email | Firebase console → Project settings → Service accounts → Generate new private key (JSON) | **Required** |
| `FIREBASE_PRIVATE_KEY` | Firebase admin private key | Firebase console → Project settings → Service accounts → Generate new private key (JSON) | **Required** |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST URL for OTP rate limiting | Upstash console → your Redis DB → REST API | Optional (prod rec.) |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST token | Upstash console → your Redis DB → REST API | Optional (prod rec.) |
| `ADMIN_EMAILS` | Comma-separated admin email allowlist (case-insensitive) | Any addresses you control; must be able to sign in + verify them | Optional (falls back to `tathastukeepsakes@gmail.com`) |

### Admin access — REQUIRED auth configuration

Admin access to `/admin` and `/api/admin/*` is granted to any user whose **verified** email is on the `ADMIN_EMAILS` allowlist (`lib/auth/admin.ts`). Sign in through the normal `/login` flow (Google or email/password) with an allowlisted address.

> **⚠️ Security prerequisite — Supabase "Confirm email" MUST be ON.**
> Supabase dashboard → Authentication → Providers → Email → enable **Confirm email** (and, recommended, **Secure email change**). With confirmation OFF, Supabase marks emails verified at sign-up and lets `updateUser({ email })` succeed without re-verification — meaning a customer could repoint their account to an admin address and inherit admin. With it ON, both sign-up and email changes require clicking a link sent to that inbox, which is what makes the `emailVerified` gate real.

**⚠️ CRITICAL SECURITY WARNINGS:**
- **NEVER** prefix service-role keys or private keys with `NEXT_PUBLIC_` — that would leak server secrets to the browser and compromise your database and auth.
- `FIREBASE_PRIVATE_KEY`: In Vercel, paste the entire key from the JSON file INCLUDING the literal `\n` sequences (e.g., `"-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n"`). The server code converts them back to newlines.
- For **Preview** deploys, consider using separate Razorpay **test-mode** keys and an isolated Supabase project to avoid polluting production data.

---

## Preview Deploys (Pull Requests)

Every pull request automatically receives a **Preview** deploy with a unique URL (e.g., `https://tathastu-git-feat-branch-akshat8171.vercel.app`).

### Preview Environment Behavior
- **Isolated URL**: Each PR gets its own subdomain. Safe for testing without affecting production.
- **Same env vars**: By default, Preview deploys inherit Production environment variables. If you want separate test keys:
  - In Vercel → Settings → Environment Variables, set variables for **Preview** environment only.
  - Use Razorpay **test-mode** keys (`rzp_test_*`) for Preview to avoid real charges.
  - Optionally, create a separate Supabase project for Preview to isolate test orders from production data.

### Database Migrations for Preview
- The app does **not** auto-apply Supabase SQL migrations on deploy. Preview deploys use the same Supabase project as Production unless you explicitly set a separate `NEXT_PUBLIC_SUPABASE_URL` for Preview.
- If testing a branch with a new migration (e.g., `supabase/migration-008-order-geography.sql`), manually apply the migration to your Preview Supabase instance via the Supabase SQL Editor before testing the Preview URL.

---

## Post-Deploy Verification Checklist

After any Production deploy (initial or update), verify the following:

- [ ] **Site loads**: Visit your production URL. Ensure the homepage renders without errors.
- [ ] **Analytics flowing**: Open Vercel dashboard → Analytics. Verify that page views and Web Vitals appear within ~5 minutes.
- [ ] **End-to-end order flow**:
  1. Add a product to cart.
  2. Proceed to checkout and enter a test phone number.
  3. Complete Firebase OTP login.
  4. Submit the order form (use Razorpay test keys if testing).
  5. Complete a test payment (test card: `4111 1111 1111 1111`, any future expiry, any CVV).
  6. Verify you land on the order confirmation page (`/order/confirmation/[id]`).
  7. Check that the order appears in Supabase → `orders` table with `payment_status = 'paid'`.
- [ ] **Admin dashboard reachable**: Visit `https://your-domain.vercel.app/admin` and verify the admin dashboard loads (if Firebase auth is configured for admin roles).
- [ ] **Admin analytics geography breakdown**: If using the admin geography chart (migration-008 adds `user_state` and `user_country` columns), verify the map renders without errors.

**Note**: The geography breakdown requires `supabase/migration-008-order-geography.sql` to be applied manually to your Supabase database. See the sibling migrations doc (if present) for step-by-step instructions.

---

## Security Headers

**Single source of truth**: Security headers are defined in **`next.config.js`** via the `async headers()` function. They apply to all routes (`source: '/:path*'`) and include:

- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` — enforce HTTPS for 2 years, including subdomains.
- `X-Content-Type-Options: nosniff` — prevent MIME type sniffing.
- `X-Frame-Options: SAMEORIGIN` — prevent clickjacking (only allow same-origin framing).
- `Referrer-Policy: strict-origin-when-cross-origin` — send referrer to same-origin requests only.
- `Permissions-Policy: camera=(), microphone=(), geolocation=()` — disable unused browser features.
- `X-XSS-Protection: 1; mode=block` — legacy XSS protection for older browsers.
- `Cross-Origin-Opener-Policy: same-origin-allow-popups` — process isolation while allowing Razorpay checkout popups.
- `X-DNS-Prefetch-Control: on` — enable DNS prefetching for Google Fonts and CDN resources.

**CSP (Content Security Policy)**: NOT currently enforced. The app loads scripts from multiple third-party origins (Razorpay checkout, Firebase, Supabase, Vercel analytics/speed-insights, Google Fonts). A strict CSP would require careful allow-listing of all these origins to avoid breaking payments, auth, or analytics. Implementing CSP is recommended as a future enhancement once all script sources are documented and tested.

**Why next.config.js and not vercel.json?** Headers are set in next.config.js because it's the canonical place for app-wide Next.js middleware-like behavior. `vercel.json` is reserved for platform-level deploy settings (regions, build commands). Keeping headers in next.config.js ensures they work identically in both Vercel and any other Next.js hosting environment (e.g., self-hosted, Docker).

---

## Troubleshooting (Expanded)

| Symptom | Fix |
|---------|-----|
| Build fails with missing env var | Add the variable in Vercel → Settings → Environment Variables (check Production/Preview/Development scopes) and redeploy. |
| Images not loading | Check `next.config.js` → `images.remotePatterns`; add the hostname if it's a new image source. |
| 404 on dynamic routes | Clear Vercel cache and redeploy; ensure `generateStaticParams` (if used) covers the slug. |
| Supabase auth not working | Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` match your Supabase project. |
| Firebase OTP login fails | Verify all 6 `NEXT_PUBLIC_FIREBASE_*` client config vars are set AND that server-side `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PRIVATE_KEY` are set correctly. |
| Orders stuck in "pending" | Verify `SUPABASE_SERVICE_ROLE_KEY` is set (server-side only, NO NEXT_PUBLIC_ prefix). This key is required for the server to write payment confirmations to Supabase. |
| Razorpay payment modal doesn't open | Check browser console for errors. Verify `NEXT_PUBLIC_RAZORPAY_KEY_ID` matches your Razorpay dashboard. Ensure `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and `RAZORPAY_WEBHOOK_SECRET` are set server-side. |
| Admin analytics geography chart blank | Apply `supabase/migration-008-order-geography.sql` to your Supabase database (adds `user_state` and `user_country` columns). |
| Vercel build succeeds but app crashes at runtime | Check Vercel → Deployments → [your deploy] → Functions logs for runtime errors (e.g., missing server-side env vars, Firebase admin key format issues). |
| Preview deploy shows production data | Set separate environment variables for **Preview** environment in Vercel settings (e.g., test Razorpay keys, separate Supabase URL). |

---
