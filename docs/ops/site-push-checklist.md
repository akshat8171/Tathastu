# Site push checklist — catalog + Google Merchant

Use this **before every push** that changes products, prices, images, PDPs, or the Merchant feed. Merchant Center must stay in lockstep with the live site.

## How the listing stays in sync

- Storefront catalog: `lib/products.json` plus published admin catalog rows.
- Ads enrollment: `lib/google-merchant/listings.json` (`offerId` → site `productId`).
- Live feeds (built on each request from that catalog):
  - XML: `https://www.tathastukeepsakes.in/feeds/google-merchant.xml`
  - TSV: `https://www.tathastukeepsakes.in/feeds/google-merchant.txt`
- Feed label in Merchant Center: `TATHASTU-WEB`.

**Do not** upload `.xls` / `.xlsx`, and **do not** paste a Google Sheets `/edit` link as a scheduled fetch. Google treats those as XML and fails.

Point Merchant Center at the XML URL above (scheduled fetch, daily). After a site deploy, the listing updates without a manual re-upload.

## Add or change a product that should appear in Ads

1. Product is live on the site (`/products/<id>`) with a public hero image.
2. Add or update a row in `lib/google-merchant/listings.json`. Never change an existing `offerId` (Google treats that as a new product).
3. Run `npm run merchant:check`.
4. Push. After Vercel is green, open the XML feed and confirm the SKU, price, PDP link, and `01-hero` image.

Admin catalog uploads are included automatically **if** that product id is already in `listings.json`. New Ads products still need an enrollment row.

## Before pushing to the site

### Catalog and PDPs

- [ ] Product `id` / URL slug is unchanged for anything already live or enrolled in Ads.
- [ ] `name`, `description`, `price`, `originalPrice`, and `images` match what customers should see.
- [ ] `originalPrice` (MRP) is greater than or equal to `price` (selling).
- [ ] First image exists under `public/` (or a public HTTPS URL). Google needs a crawlable hero.
- [ ] Sold-out items have `isSoldOut: true` (feed emits `out_of_stock`).
- [ ] Customisable products still explain that name/colour is collected after order.

### Merchant listing

- [ ] Every row in `listings.json` still resolves in the catalog (check fails if not).
- [ ] Enrolled `offerId` values were not renamed.
- [ ] New Ads SKUs were added to `listings.json` before push.
- [ ] `npm run merchant:check` passes (well-formed XML, 1:1 SKU mapping, no Excel).

### Site safety (anything you touched)

- [ ] Checkout / Razorpay paths still compile if you touched orders or env.
- [ ] Admin catalog publish still works if you touched `lib/catalog`.
- [ ] `ads.txt` still serves if you touched ads routes.
- [ ] No secrets, `.env`, or service-role keys in the commit.
- [ ] `npm test` and the Vercel production deploy are green before you tell Merchant Center to refetch.

### After deploy

- [ ] `GET /feeds/google-merchant.xml` returns `200` and starts with `<?xml`.
- [ ] Item count matches enrolled SKUs.
- [ ] One PDP from the feed opens on production and shows the same price and hero as the XML.
- [ ] In Merchant Center, processing is XML or Google Sheets picker — not Excel.

## Local XML for a one-time upload

If Google needs a file instead of the URL, generate it after catalog changes:

```bash
npx tsx -e "import { writeFileSync } from 'node:fs'; import catalog from './lib/products.json'; import { buildMerchantProducts } from './lib/google-merchant/from-catalog.ts'; import { buildGoogleMerchantXml } from './lib/google-merchant/feed.ts'; writeFileSync('tathastu-google-merchant.xml', buildGoogleMerchantXml(buildMerchantProducts(catalog)))"
```

Upload that `.xml` file. Never save as Excel.
