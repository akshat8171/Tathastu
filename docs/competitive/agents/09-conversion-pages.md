# Agent report: 09-conversion-pages

## Scope: Conversion Pages

Benchmark: typical Indian 3D-print / gift e-com (3dprintshop.in-class) — sticky purchase bar, rich gallery, stock clarity, Buy Now + COD trust near pay, phone-OTP login, account order actions, customize → quote with portfolio/pricing cues.

---

### Product detail (PDP)

**Competitor-class typically shows:** sticky mobile ATC / Buy Now; zoom/lightbox; video; stock count or urgency; size chart; pincode ETA; dual CTA (ATC + Buy Now); sold-out / notify-me; share; Q&A; image-rich reviews.

**We have:** two-column gallery + info, thumbs, qty, options/colors, custom text, wishlist, coupon strip, trust badges, accordions, reviews, related.
Evidence: `/Users/akshat.garg/Documents/GitHub new/Tathastu/app/products/[id]/page.tsx`, `components/products/product-gallery.tsx`, `components/products/product-info.tsx`, `components/products/product-options.tsx`

| ID | Gap |
|----|-----|
| **CV-01** | No sticky ATC / Buy Now bar — ATC is in-flow only (`product-info.tsx`); scrolls away on mobile. |
| **CV-02** | No Buy Now → checkout; only `AddToCartButton` (`product-info.tsx`, `add-to-cart-button.tsx`). |
| **CV-03** | Gallery: thumbs + arrows exist; no zoom, lightbox, 360°, or video (`product-gallery.tsx`). ~42/66 products are single-image (`lib/products.json`). |
| **CV-04** | PDP ignores `isSoldOut` — not passed into `ProductInfo`; no sold-out CTA / notify-me (catalog cards handle it; PDP does not). |
| **CV-05** | No live stock qty / low-stock urgency (DB has `stock_quantity` in `lib/supabase/client.ts`; PDP is static JSON). |
| **CV-06** | No pincode delivery check / ETA estimator. |
| **CV-07** | No size chart / dimension diagram (specs accordion only when `specs` present). |
| **CV-08** | Coupon is static marketing copy (`FIRST20`), not an apply field on PDP (`product-info.tsx` ~197–220). |
| **CV-09** | No social share / “Ask a question” beyond WhatsApp link. |
| **CV-10** | Reviews: text cards only — no photo reviews, helpful votes, or write-a-review CTA (`app/products/[id]/page.tsx`). |
| **CV-11** | Qty has no max / stock cap (`product-info.tsx` stepper unbounded). |

---

### Cart (+ mini-cart)

**Competitor-class:** coupon, save-for-later, gift note, COD hint, login-to-save, trust near checkout CTA, sidebar coupon parity.

**We have:** full cart page with free-ship bar, qty, coupon, summary, trust row, related; drawer with free-ship + qty.
Evidence: `app/cart/page.tsx`, `components/cart/cart-sidebar.tsx`, `components/checkout/checkout-context.tsx`

| ID | Gap |
|----|-----|
| **CV-12** | Mini-cart (`cart-sidebar.tsx`) has no coupon field — only full `/cart` and checkout summary do. |
| **CV-13** | No “Save for later” / move-to-wishlist from cart line items. |
| **CV-14** | No order notes / gift message / gift wrap. |
| **CV-15** | No “Login to save cart” / guest persistence messaging on cart. |
| **CV-16** | Cart trust is thin (Secure + Pan-India only); no COD / UPI / Razorpay icon strip near Proceed CTA. |
| **CV-17** | Line items don’t deep-link back to PDP for edit-options; customText/selectedOptions not clearly surfaced in UI (`CartLineItem` shows `variant` string only). |

---

### Checkout

**Competitor-class:** progress stepper, guest vs login, billing≠shipping, landmark/address autocomplete, payment logos, COD fee clarity, trust adjacent to Pay.

**We have:** 2-step details→payment, Razorpay + COD, coupon in summary, saved-address picker, prefill API, sticky summary.
Evidence: `app/checkout/page.tsx`, `components/checkout/checkout-form.tsx`, `components/checkout/order-summary.tsx`, `components/payment/razorpay-checkout.tsx`

| ID | Gap |
|----|-----|
| **CV-18** | No visual checkout progress (Address → Payment → Confirm); only internal `step` state. |
| **CV-19** | No “Sign in for faster checkout” banner for guests (prefill only if already authed via `/api/account/checkout-prefill`). |
| **CV-20** | No separate billing address; no landmark / alternate phone / delivery instructions. |
| **CV-21** | No pincode serviceability check before payment. |
| **CV-22** | Trust near pay is one Razorpay line in summary (`order-summary.tsx`); payment step has method radios but no UPI/card/wallet logos or COD fee/limit disclosure. |
| **CV-23** | No “save this address” checkbox for guests (silent best-effort save only after order in API). |
| **CV-24** | Email helper mentions Google/password for tracking but no OTP/phone path at checkout (aligned with retired OTP UI). |

---

### Auth (login / signup)

**Competitor-class (India e-com):** phone OTP primary; Google secondary; password optional; clear OTP UX (resend cooldown, mask).

**We have:** Google + email/password; forgot-password; legal links; login trust chips.
Evidence: `app/login/page.tsx`, `app/signup/page.tsx`, `components/auth/login-form.tsx`, `components/auth/signup-form.tsx`, `components/auth/phone-otp-form.tsx`, `app/api/auth/send-otp/route.ts`

| ID | Gap |
|----|-----|
| **CV-25** | Phone OTP retired from login UI (`login-form.tsx` comment); `PhoneOtpForm` exists + tested but not mounted on `/login` or `/signup` — biggest India-conversion miss vs 3dprintshop-class. |
| **CV-26** | Signup has no name/phone fields — email+password only; profile name collected later (`app/account/profile/page.tsx`). |
| **CV-27** | No “Continue as guest” on auth pages when `?next=/checkout`. |
| **CV-28** | Signup page lacks login’s trust row (`app/signup/page.tsx` vs `app/login/page.tsx`). |

---

### Account (+ post-purchase)

**Competitor-class:** order cards with images, reorder, cancel/return, invoice, live AWB map, returns portal.

**We have:** sidebar (Orders / Profile / Addresses / Wishlist / Track), order list → confirmation, track-by-number+email, confirmation timeline + tracking fields.
Evidence: `app/account/layout.tsx`, `components/account/account-sidebar.tsx`, `app/account/page.tsx`, `app/account/track-order/page.tsx`, `app/order-confirmation/[orderNumber]/page.tsx`

| ID | Gap |
|----|-----|
| **CV-29** | Order list has no product thumbnails — text snippet only (`app/account/page.tsx` `OrderCard`). |
| **CV-30** | No Reorder / Cancel / Return / Download invoice actions from account or confirmation. |
| **CV-31** | Track-order is lookup→confirmation only; no dedicated tracking map / shipment event list beyond confirmation’s tracking block (often mock via `getTrackingStatus`). |
| **CV-32** | Account gate requires auth for entire `/account/*` — guest track lives behind login (`account/layout.tsx` `requireAuth`); public guest track path is not a top-level conversion page. |
| **CV-33** | No order filters (status/date) or search in My Orders. |

---

### Customize (custom quote)

**Competitor-class:** configurator with live price bands, material/color pickers, portfolio gallery, STL viewer, deposit checkout.

**We have:** quote form (type, file upload, contact), how-it-works, why-us, customizable product rail, FAQ, WhatsApp — explicitly quote-first (no upfront pay).
Evidence: `app/customize/page.tsx`, `app/customize/layout.tsx`

| ID | Gap |
|----|-----|
| **CV-34** | No interactive price estimator / material-dimension calculator — wait for 24h quote. |
| **CV-35** | No before/after / portfolio gallery of past custom prints (marketing sections only). |
| **CV-36** | No 3D/STL preview after upload — filename + image preview only. |
| **CV-37** | No path from approved quote → in-app deposit/checkout (FAQ says 50% advance offline; form posts `/api/custom-quote` only). |
| **CV-38** | “Customize now” on rail goes to PDP; PDP custom fields don’t deep-link back into customize upload with product context beyond scroll-to-form. |

---

### Funnel summary (what’s solid vs missing)

| Stage | Solid today | Highest-leverage gaps |
|-------|-------------|------------------------|
| PDP | Qty, variants, thumbs, trust, reviews | **CV-01/02** sticky + Buy Now; **CV-04** sold-out; **CV-03** zoom |
| Cart | Coupon, free-ship, qty | **CV-12–14** sidebar coupon / save-later / notes |
| Checkout | COD + Razorpay, coupon carry, addresses | **CV-18–22** stepper, login prompt, trust-at-pay |
| Auth | Google + email | **CV-25** OTP not on login |
| Account | Nav parity with reference | **CV-29–30** rich order actions |
| Customize | Quote UX clear | **CV-34/37** price + pay path |

**GOAT Reminder**: Ship the boring conversion basics (sticky ATC, sold-out truth, OTP where Indians expect it) before another clever funnel abstraction. 🐐
