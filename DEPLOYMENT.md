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
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Razorpay dashboard → Settings → API Keys → Key ID |
| `NEXT_PUBLIC_APP_URL` | Your production URL, e.g. `https://tathastu.vercel.app` |

**Secret variables** (server-side only — never exposed to browsers):

| Name | Where to get it |
|------|-----------------|
| `RAZORPAY_KEY_ID` | Razorpay dashboard → Settings → API Keys → Key ID |
| `RAZORPAY_KEY_SECRET` | Razorpay dashboard → Settings → API Keys → Key Secret |
| `RAZORPAY_WEBHOOK_SECRET` | Razorpay dashboard → Webhooks → your webhook → Secret |

Set all variables for **Production**, **Preview**, and **Development** unless you want separate test keys for preview deploys (recommended: use Razorpay test-mode keys for Preview).

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
4. Update `NEXT_PUBLIC_APP_URL` in your environment variables to match.

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
