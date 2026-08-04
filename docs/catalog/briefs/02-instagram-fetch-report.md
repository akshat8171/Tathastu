# Instagram Media Fetch Report

**Account**: @tathastukeepsakes  
**Date**: 2026-08-04  
**Goal**: Fetch Instagram media (reels, posts) without Meta Graph API tokens

---

## Executive Summary

Without Meta Graph API credentials, **public Instagram scraping is severely limited** in 2026. All viable approaches require either:
- A valid Meta Graph API access token + Instagram Business/Creator account ID
- Browser automation with session authentication
- Third-party paid scraping services

This report documents what was attempted and recommendations for future implementation.

---

## Approaches Tested

### 1. Direct Profile HTML Scraping ❌ FAILED

**Method**: Fetch `https://www.instagram.com/tathastukeepsakes/` via HTTP request  
**Result**: Instagram returns a minimal HTML shell. All media data is loaded client-side via JavaScript and requires authenticated API calls.

**Technical Details**:
```bash
curl -sS -L "https://www.instagram.com/tathastukeepsakes/" \
  -A "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
```

**Output**: Basic HTML structure with no embedded JSON data or media URLs. The page relies entirely on React hydration from authenticated endpoints.

**Conclusion**: Not viable for automated fetching.

---

### 2. Instagram oEmbed API ❌ REQUIRES TOKEN

**Method**: Use Facebook Graph API oEmbed endpoint  
**Endpoint**: `https://graph.facebook.com/v21.0/instagram_oembed`

**Test**:
```bash
curl "https://graph.facebook.com/v21.0/instagram_oembed?\
url=https://www.instagram.com/reel/Dbf-GcnBa_-/&access_token=test"
```

**Response**:
```json
{
  "error": {
    "message": "Invalid OAuth access token - Cannot parse access token",
    "type": "OAuthException",
    "code": 190
  }
}
```

**Conclusion**: Requires a valid Meta access token. Cannot be used without Graph API setup.

---

### 3. Legacy Private API (`?__a=1`) ❌ DEPRECATED

**Method**: Use Instagram's old JSON endpoint  
**Endpoint**: `https://www.instagram.com/p/{shortcode}/?__a=1&__d=dis`

**Result**: Returns "Page Not Found" (404). This endpoint was deprecated in 2023.

**Conclusion**: No longer functional.

---

### 4. Embed iframe URLs ✅ WORKS (VIEW ONLY)

**Method**: Use Instagram's public embed iframe  
**Endpoint**: `https://www.instagram.com/reel/{shortcode}/embed`

**Test URL**: `https://www.instagram.com/reel/Dbf-GcnBa_-/embed`

**Result**: ✅ Successfully loads the reel in an embeddable iframe. This is already implemented in the codebase.

**Limitations**:
- View-only (cannot extract metadata or thumbnail URLs)
- Requires user interaction to play
- No programmatic access to captions, likes, timestamps, etc.

**Current Implementation**: See `lib/instagram-reels.ts` → `getReelEmbedUrl()`

---

## Current Assets

### Curated Reels (Manually Added)

The following 6 reels have been manually curated with local thumbnail copies:

| ID | Shortcode | Title | Thumbnail | Status |
|----|-----------|-------|-----------|--------|
| 1 | `Dbf-GcnBa_-` | Kids name decor reel | `/images/reels/reel-1.jpg` | ✅ Local |
| 2 | `DbdUkO9BeFB` | Custom name keychain reel | `/images/reels/reel-2.jpg` | ✅ Local |
| 3 | `DbaqVLGBeXJ` | Couple initials keepsake reel | `/images/reels/reel-3.jpg` | ✅ Local |
| 4 | `DbIzZziB-iO` | Letter name decor reel | `/images/reels/reel-4.jpg` | ✅ Local |
| 5 | `DbLhwQtBif2` | Personalized nameplate collection reel | `/images/reels/reel-5.jpg` | ✅ Local |
| 6 | `DaDOy7ehb92` | 3D printer workshop reel | `/images/reels/reel-6.jpg` | ✅ Local |

**Thumbnail Files**: All thumbnails were manually downloaded and saved to `public/images/reels/`.

---

## Recommendations

### Short Term: Manual Curation (Current Approach) ✅

**Status**: Already implemented  
**Process**:
1. Visit Instagram profile manually
2. Select high-performing reels
3. Download cover images via browser tools
4. Add entries to `lib/instagram-reels.ts`
5. Save thumbnails to `public/images/reels/`

**Pros**:
- No API tokens required
- Full control over which content to showcase
- Reliable (no rate limits or auth issues)

**Cons**:
- Manual effort required for updates
- Cannot auto-sync new posts

---

### Medium Term: Meta Graph API Integration ⏳ READY TO IMPLEMENT

**Requirements**:
1. Convert @tathastukeepsakes to an Instagram **Business** or **Creator** account
2. Link it to a Facebook Page
3. Create a Meta App at [developers.facebook.com](https://developers.facebook.com)
4. Generate a long-lived access token with `instagram_basic` and `pages_read_engagement` scopes
5. Add to `.env`:
   ```env
   IG_ACCESS_TOKEN=<your_token>
   IG_USER_ID=<business_account_id>
   ```

**Implementation**: See `scripts/catalog/fetch-instagram-media.py` (stub provided)

**API Endpoints to Use**:
- `GET /{user-id}/media` → Fetch all posts
- `GET /{media-id}` → Get post details (caption, media_url, thumbnail_url, timestamp, media_type)
- `GET /{user-id}/media?fields=media_url,thumbnail_url,caption,timestamp,media_type` → Optimized query

**Pros**:
- Official, supported method
- Can fetch captions, timestamps, media URLs
- Rate limit: 200 calls/hour per user

**Cons**:
- Requires Business/Creator account conversion
- Tokens expire (long-lived = 60 days, must refresh)
- Requires app review for production use

---

### Long Term: Browser Automation (Fallback) 🤖

**Tools**: Playwright/Puppeteer with authenticated session  
**Process**:
1. Manually log in to Instagram once
2. Save session cookies
3. Use headless browser to scrape profile page with authenticated session
4. Extract JSON data from page

**Pros**:
- Can access any Instagram account
- Works for personal accounts

**Cons**:
- Fragile (breaks when Instagram changes HTML)
- Violates Instagram Terms of Service
- Risk of account ban
- Requires maintenance

**Verdict**: Only use as a last resort if API is unavailable.

---

## Conclusion

**Current State**:
- ✅ 6 curated reels with local thumbnails
- ✅ Embed functionality working
- ❌ No automated fetching without Graph API

**Next Steps**:
1. Continue manual curation (no blockers)
2. If automated sync is needed → Set up Meta Graph API (requires Business account conversion)
3. Use `scripts/catalog/fetch-instagram-media.py` script once tokens are available

**Deliverables**:
- ✅ `docs/catalog/briefs/02-instagram-fetch-report.md` (this file)
- ✅ `docs/catalog/briefs/instagram-media.json` (all known media)
- ✅ `scripts/catalog/fetch-instagram-media.py` (Graph API stub script)

---

## Appendix: Useful Links

- [Instagram Graph API Docs](https://developers.facebook.com/docs/instagram-api)
- [Getting Started with Instagram API](https://developers.facebook.com/docs/instagram-api/getting-started)
- [Meta for Developers Console](https://developers.facebook.com/apps/)
- [Access Token Debugger](https://developers.facebook.com/tools/debug/accesstoken/)
