# AdSense Account Fill Sheet — Tathastu Keepsakes

**Purpose:** Copy-paste values into [Google AdSense](https://www.google.com/adsense/) account setup (profile, site, payments, tax).  
**Source of truth for public brand fields:** `lib/site.ts`  
**Last prepared:** August 2026  
**Status:** Pre-filled from site; blanks marked `⟦DIRECTOR INPUT⟧` must be entered only by the account owner in AdSense (never commit secrets).

---

## 1. Account / site application

| AdSense field | Value | Notes |
|---------------|-------|-------|
| Website URL | `https://www.tathastukeepsakes.in` | Canonical production domain (also in `app/layout.tsx` metadataBase) |
| Site language | English | `lang="en"` on root layout |
| Country / region | India | |
| Account email | `tathastukeepsakes@gmail.com` | Same as `SITE.email` / admin allowlist |
| Contact phone | `+91 91548 92790` | `SITE.phone` |
| Product category | Shopping / E‑commerce / Custom gifts & home décor | 3D-printed keepsakes, lamps, keyrings, pooja décor |
| Site description (short) | Premium 3D-printed keepsakes, home decor, and personalised gifts — crafted in Agra, shipped PAN-India. | From `SITE.description` |
| How you make money | Product sales (Razorpay prepaid + COD) + display ads (AdSense) once approved | Primary revenue is commerce |

---

## 2. Business / payee identity

| AdSense field | Value |
|---------------|-------|
| Payee / legal name | ⟦DIRECTOR INPUT⟧ Full legal name (individual) **or** registered business name |
| Account type | ⟦DIRECTOR INPUT⟧ Individual **or** Business / Organisation |
| Business type (if org) | ⟦DIRECTOR INPUT⟧ e.g. Proprietorship / Private Limited |
| Trading / brand name | Tathastu Keepsakes |
| Address line 1 | ⟦DIRECTOR INPUT⟧ Street / building |
| Address line 2 | ⟦DIRECTOR INPUT⟧ Area / landmark (optional) |
| City | Agra |
| State / province | Uttar Pradesh |
| PIN / postal code | ⟦DIRECTOR INPUT⟧ 6-digit PIN |
| Country | India |
| Phone | `+91 91548 92790` |

---

## 3. Payments (India)

| AdSense field | Value |
|---------------|-------|
| Payment country | India |
| Payment method | Bank account (EFT) — typical for India |
| Account holder name | ⟦DIRECTOR INPUT⟧ Must match payee / KYC name |
| Bank name | ⟦DIRECTOR INPUT⟧ |
| Account number | ⟦DIRECTOR INPUT⟧ |
| IFSC | ⟦DIRECTOR INPUT⟧ |
| Account type | ⟦DIRECTOR INPUT⟧ Savings / Current |

Google pays after the payment threshold is met and after tax/identity verification. Do not paste bank details into this repo or chat logs.

---

## 4. Tax (India)

| AdSense field | Value |
|---------------|-------|
| Tax info country | India |
| PAN | ⟦DIRECTOR INPUT⟧ |
| GSTIN (if registered) | ⟦DIRECTOR INPUT⟧ or “Not registered” |
| Form / residency answers | Complete exactly as shown in AdSense Tax centre |

---

## 5. Site verification & ads code (after Google issues IDs)

| Item | Value / action |
|------|----------------|
| Publisher ID (`ca-pub-…`) | ⟦DIRECTOR INPUT⟧ From AdSense → Account → Account information |
| `ads.txt` publisher | Same digits as `pub-…` (without `ca-` prefix) |
| Env on Vercel (Production) | `NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-XXXXXXXXXXXXXXXX` |
| Code on site | Auto-wired by `components/ads/adsense-script.tsx` when env is set + production deploy |
| `https://www.tathastukeepsakes.in/ads.txt` | Served by `app/ads.txt/route.ts` once client ID is set |

Until the publisher ID is set in Vercel env and redeployed, ads script and `ads.txt` stay off (fail-safe).

---

## 6. Policy pages Google expects (already live)

| Requirement | URL | Status |
|-------------|-----|--------|
| Privacy policy | https://www.tathastukeepsakes.in/privacy | Live (updated to disclose AdSense) |
| Terms of service | https://www.tathastukeepsakes.in/terms | Live |
| Contact | https://www.tathastukeepsakes.in/contact | Live (phone, email, WhatsApp, Agra) |
| About / clear ownership | https://www.tathastukeepsakes.in/about | Live |
| Original content / products | https://www.tathastukeepsakes.in/products | Live catalogue |

---

## 7. Recommended AdSense console choices

- **Auto ads:** ON after approval (site uses Auto Ads script only — no hard-coded ad units until inventory is stable).
- **Sites:** add `tathastukeepsakes.in` and `www.tathastukeepsakes.in` if prompted.
- **Blocked topics / advertisers:** leave default until first payment; tighten later if brand-sensitive.
- **Ad review centre:** enable so low-quality ads can be blocked.

---

## 8. Owner checklist (copy into AdSense in order)

1. Sign in at https://www.google.com/adsense/ with `tathastukeepsakes@gmail.com` (or the Google account that owns the property).
2. Add site URL: `https://www.tathastukeepsakes.in`.
3. Paste payee + address + PIN from sections 2–3 (`⟦DIRECTOR INPUT⟧` fields).
4. Complete Payments → bank + Tax → PAN.
5. Copy **Publisher ID** (`ca-pub-…`) into Vercel Production env `NEXT_PUBLIC_ADSENSE_CLIENT_ID` and redeploy.
6. Confirm live: page source contains `pagead2.googlesyndication.com/pagead/js/adsbygoogle.js` and `/ads.txt` returns a `google.com, pub-…, DIRECT, …` line.
7. Submit site for review; wait for email. Do not click around removing content during review.

---

## 9. What agents cannot fill for you

Bank account number, IFSC, PAN/GSTIN, full street address, and legal entity type are owner-only KYC fields. Once Publisher ID exists in Vercel, the codebase activates ads + `ads.txt` automatically on the next production deploy.
