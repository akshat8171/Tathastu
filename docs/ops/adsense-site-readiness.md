# AdSense Site Readiness Audit — Tathastu Keepsakes

**Date:** August 2026  
**Verdict:** Ready to submit for AdSense review once Publisher ID is set in Vercel and KYC/payments are completed in the AdSense console.

## Pass

| Check | Evidence |
|-------|----------|
| Live HTTPS domain | `https://www.tathastukeepsakes.in` |
| Clear navigation / original product content | `/products`, category pages, PDPs |
| Contact details | `/contact` — phone, email, WhatsApp, Agra |
| About / ownership | `/about` |
| Privacy policy | `/privacy` — discloses AdSense + Google Ads Settings opt-out |
| Terms | `/terms` |
| Production-gated ads script | `components/ads/adsense-script.tsx` (mirrors GA4 gate) |
| `ads.txt` route | `app/ads.txt/route.ts` — emits Google DIRECT line when client ID set |

## Pending (owner)

| Item | Action |
|------|--------|
| Publisher ID | `ca-pub-3744909748780337` baked in as default — merge + deploy to activate |
| Payee / tax / bank | Fill `⟦DIRECTOR INPUT⟧` fields in `docs/ops/adsense-account-fill-sheet.md` inside AdSense UI |
| Site review | Submit after code is live with `ca-pub-…` |

## Notes

- Ads stay off until env is set (fail-closed) — avoids claiming a wrong `pub-` ID.
- No hard-coded ad unit slots yet; Auto ads only after approval.
