# Catalog Scripts

Automation scripts for managing product catalog data from various sources.

## Instagram Media Fetcher

**Script**: `fetch-instagram-media.py`  
**Purpose**: Fetch Instagram media (reels, posts) from @tathastukeepsakes using Meta Graph API

### Prerequisites

1. **Convert Instagram account to Business/Creator**:
   - Open Instagram app → Settings → Account → Switch to Professional Account
   - Choose "Business" or "Creator"
   - Link to a Facebook Page (required)

2. **Create Meta App**:
   - Visit [Meta for Developers](https://developers.facebook.com/apps/)
   - Click "Create App" → Choose "Business" type
   - Add "Instagram Graph API" product

3. **Generate Access Token**:
   - In Meta App dashboard → Tools → Graph API Explorer
   - Select your app and permissions: `instagram_basic`, `pages_read_engagement`
   - Generate Token → Get Long-Lived Token (60-day expiry)
   - [Access Token Debugger](https://developers.facebook.com/tools/debug/accesstoken/)

4. **Find Instagram User ID**:
   - Use Graph API Explorer:
     ```
     GET /me/accounts (get Facebook Page ID)
     GET /{page-id}?fields=instagram_business_account (get IG User ID)
     ```

5. **Add credentials to `.env.local`**:
   ```env
   IG_ACCESS_TOKEN=your_long_lived_token_here
   IG_USER_ID=your_instagram_business_id_here
   ```

### Installation

```bash
cd /Users/akshat.garg/Documents/GitHub\ new/Tathastu
pip install requests python-dotenv
```

### Usage

```bash
# Fetch metadata only (no downloads)
python scripts/catalog/fetch-instagram-media.py

# Fetch and download thumbnails
python scripts/catalog/fetch-instagram-media.py --download-thumbnails

# Fetch latest 20 posts
python scripts/catalog/fetch-instagram-media.py --limit 20

# Custom output path
python scripts/catalog/fetch-instagram-media.py \
  --output custom-output.json \
  --thumbnail-dir public/images/custom/
```

### Output

**JSON File**: `docs/catalog/briefs/instagram-media.json`  
**Thumbnails**: `public/images/catalog/ig/*.jpg` (if `--download-thumbnails` used)

Example JSON structure:

```json
{
  "metadata": {
    "handle": "tathastukeepsakes",
    "fetch_method": "graph_api",
    "total_items": 25
  },
  "media": [
    {
      "id": "1",
      "type": "reel",
      "shortcode": "Dbf-GcnBa_-",
      "permalink": "https://www.instagram.com/tathastukeepsakes/reel/Dbf-GcnBa_-/",
      "caption_snippet": "Custom 3D printed name decor...",
      "local_thumbnail": "/images/catalog/ig/Dbf-GcnBa_-.jpg"
    }
  ],
  "statistics": {
    "reels": 20,
    "posts": 5
  }
}
```

### Rate Limits

- **200 calls/hour** per user
- Long-lived tokens expire after **60 days** (must refresh)
- Set up webhook to auto-refresh tokens (advanced)

### Troubleshooting

**Error: "Invalid OAuth access token"**
- Token expired or invalid
- Regenerate token in Graph API Explorer
- Ensure scopes: `instagram_basic`, `pages_read_engagement`

**Error: "Unsupported get request"**
- User ID is incorrect
- Ensure you're using Instagram *Business* Account ID, not username
- Verify account is Business/Creator type

**Error: "Missing required environment variables"**
- Add `IG_ACCESS_TOKEN` and `IG_USER_ID` to `.env.local`
- Do NOT commit `.env.local` (already in `.gitignore`)

### Manual Fallback

If Graph API setup is not feasible, continue with manual curation:

1. Visit [instagram.com/tathastukeepsakes](https://www.instagram.com/tathastukeepsakes/)
2. Select high-performing reels
3. Download cover images using browser DevTools or screenshot
4. Save to `public/images/reels/reel-N.jpg`
5. Update `lib/instagram-reels.ts` with shortcodes

See `docs/catalog/briefs/02-instagram-fetch-report.md` for more details.

---

## Future Scripts

- `fetch-shopify-products.py` - Import products from Shopify
- `sync-catalog-db.py` - Sync catalog JSON to Supabase
- `optimize-images.py` - Compress and resize product images
