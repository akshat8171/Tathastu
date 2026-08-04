#!/usr/bin/env python3
"""
Instagram Media Fetcher - Meta Graph API Integration

Fetches media (reels, posts) from @tathastukeepsakes Instagram Business account
using the Meta Graph API. Saves metadata to JSON and downloads thumbnails.

PREREQUISITES:
1. Convert @tathastukeepsakes to Instagram Business or Creator account
2. Link to a Facebook Page
3. Create a Meta App at https://developers.facebook.com/apps/
4. Generate access token with scopes: instagram_basic, pages_read_engagement
5. Add to .env.local:
   IG_ACCESS_TOKEN=<your_long_lived_token>
   IG_USER_ID=<instagram_business_account_id>

USAGE:
    python scripts/catalog/fetch-instagram-media.py [--limit N] [--download-thumbnails]

OPTIONS:
    --limit N               Fetch only N most recent posts (default: 50)
    --download-thumbnails   Download and save thumbnail images locally
    --output PATH           Output JSON file path (default: docs/catalog/briefs/instagram-media.json)
    --thumbnail-dir PATH    Thumbnail save directory (default: public/images/catalog/ig/)

EXAMPLES:
    # Fetch metadata only (no downloads)
    python scripts/catalog/fetch-instagram-media.py

    # Fetch and download thumbnails
    python scripts/catalog/fetch-instagram-media.py --download-thumbnails

    # Fetch latest 20 posts
    python scripts/catalog/fetch-instagram-media.py --limit 20

API RATE LIMITS:
    - 200 calls per hour per user
    - Long-lived tokens expire after 60 days
    - Refresh tokens before expiration

MORE INFO:
    https://developers.facebook.com/docs/instagram-api/reference/user/media
"""

import os
import sys
import json
import argparse
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Optional
from urllib.parse import urlparse

# Optional: Install with `pip install requests python-dotenv`
try:
    import requests
    from dotenv import load_dotenv
    DEPENDENCIES_AVAILABLE = True
except ImportError:
    DEPENDENCIES_AVAILABLE = False
    print("⚠️  Missing dependencies. Install with:")
    print("   pip install requests python-dotenv")
    print()


class InstagramMediaFetcher:
    """Fetches Instagram media via Meta Graph API."""

    GRAPH_API_VERSION = "v21.0"
    GRAPH_API_BASE = f"https://graph.facebook.com/{GRAPH_API_VERSION}"

    def __init__(self, access_token: str, user_id: str):
        """
        Initialize fetcher with Meta Graph API credentials.

        Args:
            access_token: Instagram Graph API long-lived access token
            user_id: Instagram Business Account ID (not username)
        """
        self.access_token = access_token
        self.user_id = user_id
        self.session = requests.Session()

    def fetch_media_list(self, limit: int = 50) -> List[Dict]:
        """
        Fetch list of media items from Instagram Business account.

        Args:
            limit: Maximum number of media items to fetch

        Returns:
            List of media dictionaries with metadata

        API Endpoint:
            GET /{user-id}/media
            Fields: id,media_type,media_url,thumbnail_url,permalink,caption,timestamp,shortcode
        """
        url = f"{self.GRAPH_API_BASE}/{self.user_id}/media"
        params = {
            "access_token": self.access_token,
            "fields": "id,media_type,media_url,thumbnail_url,permalink,caption,timestamp,shortcode",
            "limit": limit
        }

        print(f"📡 Fetching media from Instagram Graph API...")
        response = self.session.get(url, params=params)
        response.raise_for_status()

        data = response.json()
        media_items = data.get("data", [])
        print(f"✅ Found {len(media_items)} media items")

        return media_items

    def download_thumbnail(self, media_url: str, save_path: Path) -> bool:
        """
        Download thumbnail image from Instagram CDN.

        Args:
            media_url: URL of the thumbnail image
            save_path: Local file path to save image

        Returns:
            True if successful, False otherwise
        """
        try:
            save_path.parent.mkdir(parents=True, exist_ok=True)
            response = self.session.get(media_url, stream=True, timeout=30)
            response.raise_for_status()

            with open(save_path, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)

            print(f"  ✅ Downloaded: {save_path.name}")
            return True
        except Exception as e:
            print(f"  ❌ Failed to download {save_path.name}: {e}")
            return False

    def process_media_items(
        self,
        raw_media: List[Dict],
        download_thumbnails: bool = False,
        thumbnail_dir: Path = Path("public/images/catalog/ig")
    ) -> List[Dict]:
        """
        Process raw API response into structured media items.

        Args:
            raw_media: Raw media items from Graph API
            download_thumbnails: Whether to download thumbnail images
            thumbnail_dir: Directory to save thumbnails

        Returns:
            List of processed media dictionaries
        """
        processed = []

        for idx, item in enumerate(raw_media, start=1):
            media_type = item.get("media_type", "").lower()
            shortcode = item.get("shortcode", "")
            permalink = item.get("permalink", "")
            caption = item.get("caption", "")
            timestamp = item.get("timestamp", "")

            # Determine thumbnail URL
            if media_type == "video":
                thumbnail_url = item.get("thumbnail_url")
            else:
                thumbnail_url = item.get("media_url")

            # Extract shortcode from permalink if not provided
            if not shortcode and permalink:
                # Example: https://www.instagram.com/p/{shortcode}/
                parts = urlparse(permalink).path.strip('/').split('/')
                if len(parts) >= 2:
                    shortcode = parts[-1]

            # Local thumbnail path
            local_thumbnail = None
            if download_thumbnails and thumbnail_url:
                ext = "jpg"  # Instagram thumbnails are typically JPG
                filename = f"{shortcode}.{ext}" if shortcode else f"media-{idx}.{ext}"
                local_path = thumbnail_dir / filename
                
                print(f"⬇️  Downloading thumbnail {idx}/{len(raw_media)}...")
                if self.download_thumbnail(thumbnail_url, local_path):
                    # Save as web-relative path
                    local_thumbnail = f"/images/catalog/ig/{filename}"

            processed_item = {
                "id": str(idx),
                "type": "reel" if media_type == "video" else "post",
                "shortcode": shortcode,
                "permalink": permalink,
                "embed_url": f"https://www.instagram.com/reel/{shortcode}/embed" if media_type == "video" else None,
                "title": caption[:50] + "..." if len(caption) > 50 else caption,
                "caption_snippet": caption[:100] + "..." if len(caption) > 100 else caption,
                "local_thumbnail": local_thumbnail,
                "thumbnail_source": "graph_api_download" if local_thumbnail else "graph_api_url",
                "thumbnail_url": thumbnail_url if not local_thumbnail else None,
                "fetch_date": datetime.now().strftime("%Y-%m-%d"),
                "timestamp": timestamp
            }

            processed.append(processed_item)

        return processed

    def build_output_json(self, media_items: List[Dict], handle: str = "tathastukeepsakes") -> Dict:
        """
        Build final JSON structure for output.

        Args:
            media_items: Processed media items
            handle: Instagram handle

        Returns:
            Complete JSON structure
        """
        stats = {
            "reels": sum(1 for item in media_items if item["type"] == "reel"),
            "posts": sum(1 for item in media_items if item["type"] == "post"),
            "total_with_local_thumbnails": sum(1 for item in media_items if item["local_thumbnail"]),
            "total_with_remote_thumbnails": sum(1 for item in media_items if item["thumbnail_url"])
        }

        return {
            "metadata": {
                "handle": handle,
                "profile_url": f"https://www.instagram.com/{handle}/",
                "fetch_method": "graph_api",
                "last_updated": datetime.now().isoformat(),
                "total_items": len(media_items),
                "notes": "Fetched via Meta Graph API. See scripts/catalog/fetch-instagram-media.py"
            },
            "media": media_items,
            "statistics": stats,
            "api_requirements": {
                "meta_graph_api": {
                    "required": True,
                    "env_vars": ["IG_ACCESS_TOKEN", "IG_USER_ID"],
                    "account_type": "Business or Creator",
                    "scopes": ["instagram_basic", "pages_read_engagement"],
                    "documentation": "https://developers.facebook.com/docs/instagram-api"
                }
            }
        }


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description="Fetch Instagram media via Meta Graph API",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__
    )
    parser.add_argument("--limit", type=int, default=50, help="Maximum media items to fetch")
    parser.add_argument("--download-thumbnails", action="store_true", help="Download thumbnail images")
    parser.add_argument(
        "--output",
        type=Path,
        default=Path("docs/catalog/briefs/instagram-media.json"),
        help="Output JSON file path"
    )
    parser.add_argument(
        "--thumbnail-dir",
        type=Path,
        default=Path("public/images/catalog/ig"),
        help="Thumbnail save directory"
    )
    args = parser.parse_args()

    # Check dependencies
    if not DEPENDENCIES_AVAILABLE:
        print("❌ Cannot run: missing dependencies")
        sys.exit(1)

    # Load environment variables
    load_dotenv(".env.local")
    access_token = os.getenv("IG_ACCESS_TOKEN")
    user_id = os.getenv("IG_USER_ID")

    if not access_token or not user_id:
        print("❌ Missing required environment variables:")
        print()
        print("   IG_ACCESS_TOKEN=<your_access_token>")
        print("   IG_USER_ID=<your_instagram_business_id>")
        print()
        print("Add these to .env.local and try again.")
        print()
        print("📚 Setup Guide:")
        print("   1. Convert @tathastukeepsakes to Business/Creator account")
        print("   2. Visit https://developers.facebook.com/apps/")
        print("   3. Create app, add Instagram Graph API")
        print("   4. Generate long-lived access token")
        print("   5. Find your Instagram User ID")
        print()
        sys.exit(1)

    # Initialize fetcher
    fetcher = InstagramMediaFetcher(access_token, user_id)

    try:
        # Fetch media
        raw_media = fetcher.fetch_media_list(limit=args.limit)

        # Process and optionally download
        print()
        processed_media = fetcher.process_media_items(
            raw_media,
            download_thumbnails=args.download_thumbnails,
            thumbnail_dir=args.thumbnail_dir
        )

        # Build output JSON
        output_data = fetcher.build_output_json(processed_media)

        # Save to file
        args.output.parent.mkdir(parents=True, exist_ok=True)
        with open(args.output, 'w', encoding='utf-8') as f:
            json.dump(output_data, f, indent=2, ensure_ascii=False)

        print()
        print(f"✅ Successfully saved {len(processed_media)} media items to {args.output}")
        print()
        print("📊 Summary:")
        print(f"   Reels: {output_data['statistics']['reels']}")
        print(f"   Posts: {output_data['statistics']['posts']}")
        print(f"   Local thumbnails: {output_data['statistics']['total_with_local_thumbnails']}")
        print()

    except requests.exceptions.HTTPError as e:
        print(f"❌ API Error: {e}")
        if e.response is not None:
            print(f"   Response: {e.response.text}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
