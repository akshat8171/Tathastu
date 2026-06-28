# Layerix

> **"If it exists, we can print it."**

A full-featured e-commerce platform for 3D-printed miniatures, lamps, home decor, and custom prints. Built with Next.js 14, TypeScript, Tailwind CSS, Supabase, Firebase, and Razorpay.

**Live:** https://layerixx-layerixs-projects.vercel.app

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 14 (App Router, React 18) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS |
| **Database** | Supabase (PostgreSQL + Row Level Security) |
| **Auth** | Hybrid — Firebase Phone OTP + Supabase Email/Password + Google OAuth |
| **Payments** | Razorpay (UPI, cards, netbanking, wallets) + COD |
| **Deployment** | Vercel (Singapore PoP) |
| **Testing** | Jest (539 tests, 15 suites) |

---

## Features

### Storefront
- Responsive mobile-first design matching [3dprintshop.in](https://www.3dprintshop.in/)
- Homepage with hero carousel, category navigation, trending/editor picks sections
- Product listing with category filters (Pooja Decor, Lamps, Gaming, Keyrings, Signs, Organizers)
- Product detail pages with image gallery, reviews, and "Add to Cart"
- Watch & Shop video section
- Bulk order and custom 3D printing quote forms

### Authentication
- **Firebase Phone OTP** — primary login (httpOnly session cookie)
- **Google OAuth** — one-tap sign-in
- **Supabase Email/Password** — fallback auth
- Unified `getCurrentUser()` across all providers

### Shopping & Checkout
- Persistent cart (localStorage + server sync)
- Saved address picker (add/select delivery addresses)
- Payment: Razorpay (UPI/card/netbanking/wallet) + Cash on Delivery
- Coupon system with server-side validation and abuse protection
- Order confirmation with tracking info

### Account Area
- Order history with status tracking
- Address book (CRUD)
- Profile management
- Wishlist

### Security & Performance
- Server-authoritative pricing — client prices NEVER trusted (`repriceItems()`)
- OTP rate limiting (Upstash Redis in production, in-memory locally)
- Lazy-init Supabase clients — build passes without runtime secrets
- Narrowed middleware matcher — `getUser()` only on protected routes
- Input validation and sanitization on all API routes

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- Supabase project ([supabase.com](https://supabase.com))
- Firebase project ([console.firebase.google.com](https://console.firebase.google.com))
- Razorpay account ([razorpay.com](https://razorpay.com)) — or use mock payments locally

### 1. Clone & Install

```bash
git clone https://github.com/akshat8171/Tathastu.git
cd Tathastu
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local` — the file has detailed comments for each variable. Key groups:

| Group | Variables | Where to get them |
|-------|-----------|-------------------|
| Supabase | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API |
| Firebase (client) | `NEXT_PUBLIC_FIREBASE_*` (6 vars) | Firebase Console → Project Settings → General → Your apps |
| Firebase (admin) | `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` | Firebase Console → Service Accounts → Generate new private key |
| Razorpay | `NEXT_PUBLIC_RAZORPAY_KEY_ID`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` | Razorpay Dashboard → Settings → API Keys |
| App | `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` for dev |

### 3. Set Up Database

Run the schema in your Supabase SQL editor:

```sql
-- 1. Create tables, RLS policies, functions
-- Run: supabase/schema.sql

-- 2. (Optional) Seed sample products
-- Run: supabase/seed-all-products.sql
```

Enable Phone Auth and Google OAuth in the Supabase dashboard under Authentication → Providers.

### 4. Set Up Firebase

1. Enable **Phone** authentication in Firebase Console → Authentication → Sign-in method
2. (Optional) Add test phone numbers under Firebase → Authentication → Phone → Phone numbers for testing
3. Enable **Google** sign-in provider

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 6. Run Tests

```bash
npm test              # Run all 539 tests
npm run test:watch    # Watch mode
npm run test:coverage # With coverage report
```

---

## Project Structure

```
Tathastu/
├── app/                        # Next.js App Router
│   ├── (store)/                # Store layout group
│   ├── about/                  # About page
│   ├── account/                # Account area (orders, profile, addresses, wishlist)
│   ├── api/
│   │   ├── auth/               # Firebase session, Google OAuth callbacks
│   │   ├── orders/             # Order CRUD + lookup
│   │   ├── payment/            # Razorpay create-order, verify, webhook
│   │   ├── products/           # Product API
│   │   ├── coupons/            # Coupon validation
│   │   ├── custom-quote/       # Custom 3D print quotes
│   │   └── newsletter/         # Newsletter signup
│   ├── bulk-order/             # Bulk order form
│   ├── cart/                   # Shopping cart
│   ├── checkout/               # Checkout flow
│   ├── contact/                # Contact page
│   ├── custom-3d-printing/     # Custom printing info
│   ├── login/                  # Auth (phone OTP + Google + email)
│   ├── order-confirmation/     # Post-purchase confirmation
│   ├── products/               # PLP + PDP (SSG)
│   ├── shop/                   # Category browsing
│   ├── watch-shop/             # Video shopping section
│   └── wishlist/               # Wishlist page
├── components/
│   ├── auth/                   # OTP form, Google button, logout
│   ├── cart/                   # Cart context, sidebar, add-to-cart
│   ├── checkout/               # Address picker, payment selector, order summary
│   ├── homepage/               # Hero, categories, trending, editors picks
│   ├── layout/                 # Header, Footer, navigation
│   ├── payment/                # Razorpay checkout component
│   ├── products/               # Product card, gallery, info, reviews
│   ├── ui/                     # Shared UI (spinners, modals, toasts)
│   └── wishlist/               # Wishlist components
├── lib/
│   ├── auth/                   # Unified auth (getCurrentUser, cookies, session)
│   ├── firebase/               # Firebase client + admin SDK (lazy-init)
│   ├── supabase/               # Supabase clients (browser, server, admin — all lazy-init)
│   ├── validation/             # Input validation schemas
│   ├── coupons.ts              # Server-side coupon logic + abuse protection
│   ├── pricing.ts              # Server-authoritative repricing
│   ├── razorpay.ts             # Razorpay client
│   ├── rate-limit.ts           # OTP rate limiting (Redis/in-memory)
│   ├── products.json           # Static product catalog
│   └── utils.ts                # Helpers
├── middleware.ts               # Auth middleware (narrowed to /account/* + /login only)
├── public/                     # Static assets, product images
├── supabase/                   # DB schema + seed files
└── __tests__/                  # Jest test suites
```

---

## Deployment

### Vercel (Production)

The site auto-deploys on push to `main` via Vercel's GitHub integration.

**For feature branches** (manual deploy):

```bash
# Build locally for production
vercel build --prod

# Deploy the prebuilt output
vercel deploy --prebuilt --prod
```

**Required Vercel environment variables:**

Set these in Vercel Dashboard → Project → Settings → Environment Variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`
- `NEXT_PUBLIC_RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `RAZORPAY_WEBHOOK_SECRET`
- `NEXT_PUBLIC_APP_URL` (your production URL)

> **Note:** The build passes WITHOUT these env vars (lazy-init pattern). They're only needed at runtime for the site to function.

### Local Network Testing

```bash
npm run dev:network    # Dev server accessible on LAN
npm run start:network  # Production build accessible on LAN
```

---

## E2E Testing (Mock Payments)

For local end-to-end testing without real Razorpay:

```bash
# In .env.local
NEXT_PUBLIC_MOCK_PAYMENT=true
```

This skips the Razorpay modal and writes a real order to Supabase. Hard-disabled in production builds (`NODE_ENV=production`).

Phone OTP testing: add test numbers in Firebase Console → Authentication → Phone → Phone numbers for testing.

---

## Architecture Decisions

| Decision | Rationale |
|----------|-----------|
| **Hybrid auth (Firebase + Supabase)** | Firebase excels at phone OTP (carrier-grade delivery); Supabase handles email + provides the DB. Unified behind `getCurrentUser()`. |
| **Server-authoritative pricing** | Client-side prices are never trusted. `repriceItems()` re-fetches from `products.json` before any order write. |
| **Lazy-init clients (Proxy pattern)** | Supabase/Firebase clients defer construction to first use. Modules are side-effect-free — build passes without secrets. |
| **Narrowed middleware** | `getUser()` is a blocking network RTT. Only runs on `/account/*` + `/login` — public pages serve from CDN with zero Edge overhead. |
| **COD + Razorpay** | India market expects both options. COD creates order with `payment_status: pending`; Razorpay webhook confirms paid orders. |
| **Coupon abuse protection** | Rate-limited validation, server-side-only discount application, per-user usage tracking. |

---

## License

MIT
