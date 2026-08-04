# Agent report: 06-footer-pages

## Scope: Footer & Pages

Sources: `components/layout/footer.tsx`, `lib/site.ts`, `app/**/page.tsx` (37 routes), live footer HTML from https://www.3dprintshop.in/ (parsed `<footer>`), HTTP probes of competitor URLs.

### Competitor footer structure (live)

| Block | Contents |
|---|---|
| CTA band | “Have an idea? We’ll print it.” → **Customize in the Lab** (`/lab`) + WhatsApp |
| Brand | Tagline + multi-color India blurb |
| **Shop** | All Products, Pooja & Decor, Home Decor, Keyrings / Bag Tags, Workspace, **Gifting** |
| **Services** | 3DPrintShop Lab, Upload Your Design (`/lab#upload`), Track Order, My Account, **Wishlist**, Cart |
| **Contact** | Phone, email, WhatsApp + **COD / Pan-India / Made to order** + **PayU secure — UPI · Cards · NetBanking** |
| Legal row | About Us, Blog, Contact Us, FAQs, Shipping, Returns & Refunds, Privacy, Terms |
| Social | Instagram, Facebook |
| Bottom | © 2026 · **Made in India** |

### Tathastu footer structure (code)

| Block | Contents |
|---|---|
| Brand (2 cols) | Logo, description, IG/FB/WA icons, trust strip (COD, secure payments, dispatch, Agra address) |
| **Shop** | Pooja, Keyrings, Lamps, Desk/Workspace, Gaming, All Products (`/products?category=…`) |
| **Services** | Customise Now, Upload Design (both → `/customize`), Track Order → `/account`, My Account, Cart, **Bulk Orders** |
| **Help & Policies** | About, Blog, Contact, FAQs, Shipping, Refund, Privacy, Terms + phone/email/**hours** |
| Bottom | © · **Made in India** + text badges **UPI / CARD / COD** |

---

### Exhaustive route inventory

| Page / intent | Competitor | Tathastu | Status |
|---|---|---|---|
| Home | `/` | `/` | Parity |
| All products / shop | `/shop` | `/shop`, `/products` | Parity (+ dual catalog) |
| Pooja & Decor | `/pooja-decor` | `/products?category=pooja-decor`, `/shop/pooja-decor` | **URL shape gap** |
| Home Decor | `/homedecor` | Lamps via `?category=lamps` / `/shop/lamps` | **Naming + clean slug gap** |
| Keyrings | `/keyrings` | `?category=keyrings` / `/shop/keyrings` | **URL shape gap** |
| Workspace | `/workspace` | `?category=organizers` / `/shop/organizers` | **Slug mismatch** |
| Gaming | `/gaming` | `?category=gaming` / `/shop/gaming` | **URL shape gap** |
| Gifting | `/gifting` | — | **Missing page** |
| Customized category | `/customized` | CTA → `/customize` | Partial |
| Lab / customize hub | `/lab`, `/lab#upload` | `/customize` | **No `/lab` alias** |
| Custom 3D printing | `/custom-3d-printing` (308) | `/custom-3d-printing` | Parity |
| Customize alias | `/customize` (308) | `/customize` | Parity |
| Product PDP | `/product/[slug]` | `/products/[id]` | Different pattern |
| Cart | `/cart` | `/cart` | Parity |
| Wishlist | `/wishlist` | `/wishlist`, `/account/wishlist` | Parity (footer omit) |
| Account | `/account` | `/account` (+ profile, addresses) | Parity |
| Track order (guest) | `/track-order` | — (footer → `/account`, real page `/account/track-order` **auth-gated**) | **Missing public track** |
| Bulk order | `/bulk-order` | `/bulk-order` | Parity (Tathastu also footer-links) |
| About | `/about-us`, `/about` | `/about` only | **Alias gap** |
| Contact | `/contact-us`, `/contact` | `/contact` only | **Alias gap** |
| Blog | `/blog` | `/blog`, `/blog/[slug]` | Parity |
| FAQs | `/faqs`, `/faq` | `/faqs` only | Minor alias gap |
| Shipping policy | `/shipping-policy` | `/shipping-policy` | Parity |
| Refunds | `/refund-and-returns-policy` | `/refund-and-returns-policy` | Parity |
| Privacy | `/privacy-policy` | `/privacy` | **Slug gap** |
| Terms | `/terms-conditions`, `/terms` | `/terms` | **Slug gap** |
| Login / signup | (account flow) | `/login`, `/signup`, forgot/reset | Tathastu-only explicit |
| Checkout | (implied) | `/checkout` | Tathastu |
| Order confirmation | — | `/order-confirmation/[orderNumber]` | Tathastu |
| Rakhi hub | — | `/rakhi` | Tathastu seasonal |
| Watch shop | — | `/watch-shop` | Tathastu (not footer) |
| Planters category | — | taxonomy + `/shop/planters` | Tathastu (not footer) |
| Admin | — | `/admin/*` | Tathastu internal |
| Lamps / organizers root | `/lamps`, `/organizers` (200) | via shop/products filters | Competitor clean roots |

---

### Gaps FP-01…

| ID | Gap | Severity |
|---|---|---|
| **FP-01** | No dedicated **Contact** footer column — phone/email/hours sit under Help & Policies; competitor isolates Contact + trust badges | High |
| **FP-02** | No footer **CTA band** (“Have an idea? We’ll print it” → Lab + WhatsApp) | Medium |
| **FP-03** | **Gifting** shop link/page missing (`/gifting` on competitor) | High |
| **FP-04** | Shop links use query URLs (`/products?category=…`) instead of competitor-style clean roots (`/keyrings`, `/homedecor`, `/workspace`); `/shop/[category]` exists but footer doesn’t use it | Medium |
| **FP-05** | Footer Shop label **“Lamps & Lighting”** vs competitor **“Home Decor”**; no **Home Decor** naming parity | Low–Med |
| **FP-06** | Services missing **Wishlist**; competitor lists it | Medium |
| **FP-07** | No **/lab** (or Lab-branded) service entry; Upload deep-link `#upload` absent; Customise + Upload both point at same `/customize` | Medium |
| **FP-08** | **Track Order** footer href is `/account` (login wall). Competitor has public `/track-order`. Real form is `/account/track-order` (also auth-gated via middleware) | **High** |
| **FP-09** | Payment/trust badges are plain **UPI / CARD / COD** chips — missing **PayU** (or gateway) brand + **NetBanking**; competitor puts PayU line in Contact | Medium |
| **FP-10** | COD / Pan-India / Made-to-order live in brand trust strip, not adjacent to Contact like competitor | Low |
| **FP-11** | Legal slug aliases missing: `/privacy-policy`, `/terms-conditions`, `/about-us`, `/contact-us` (and `/faq`) | Medium (SEO/parity) |
| **FP-12** | `SITE.facebook` is still a **placeholder** comment in `lib/site.ts` | Medium |
| **FP-13** | No YouTube/Pinterest in either footer (parity OK); only 2 confirmed socials on competitor — Tathastu adds WA icon (good) but FB may be wrong | Low |
| **FP-14** | **Planters**, **Rakhi**, **watch-shop** exist as routes but are absent from footer Shop (seasonal/extra inventory not surfaced) | Low |
| **FP-15** | Made in India — **present** (parity, not a gap) | — |
| **FP-16** | Legal pages themselves — **present** and linked (parity); structure folds them into one long Help column vs competitor’s flatter legal row | Low |
| **FP-17** | Support hours + Agra address — Tathastu **ahead**; competitor footer sample showed no hours/full address | Advantage |
| **FP-18** | Bulk Orders in Services — Tathastu **ahead** (competitor has page, not footer Services) | Advantage |

### Bottom line

Routing coverage for core commerce + legal is largely in place. Biggest footer/page gaps vs 3dprintshop.in: **Contact column + payment trust presentation (FP-01/09)**, **guest track-order (FP-08)**, **Gifting + Lab/clean category URLs (FP-03/04/07)**, and **legal/contact slug aliases (FP-11)**.

**GOAT Reminder**: Ship the guest track page and fix the footer link before polishing PayU chips — broken order-status UX pages you harder than missing NetBanking badges. 🐐
