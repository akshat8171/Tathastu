#!/usr/bin/env python3
"""Scrape @tathastukeepsakes public posts via imginn HTML mirror.

Direct Instagram web_profile_info / login-walled HTML does not expose media
without Graph API. This script mirrors the public profile, downloads
thumbnails to public/images/catalog/ig/, and writes short descriptions.
"""
from __future__ import annotations

import json
import re
import urllib.request
import ssl
from html import unescape
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT_IMG = ROOT / "public/images/catalog/ig"
BRIEFS = ROOT / "docs/catalog/briefs"
UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
CTX = ssl.create_default_context()


def fetch(url: str) -> str:
    req = urllib.request.Request(
        url,
        headers={"User-Agent": UA, "Referer": "https://imginn.com/", "Accept": "text/html"},
    )
    with urllib.request.urlopen(req, context=CTX, timeout=40) as r:
        return r.read().decode("utf-8", "replace")


def download(url: str, dest: Path) -> int:
    if url.startswith("//"):
        url = "https:" + url
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Referer": "https://imginn.com/"})
    data = urllib.request.urlopen(req, context=CTX, timeout=40).read()
    dest.write_bytes(data)
    return len(data)


def clean_desc(caption: str, max_len: int = 170) -> str:
    text = caption or ""
    text = re.sub(r"^tathastukeepsakes:\s*", "", text, flags=re.I)
    text = re.sub(r"(?:Video|Photo|Image)\s+by\s+Tathastu Keepsakes.*$", "", text, flags=re.I)
    text = re.sub(r"#\w+", "", text)
    text = re.sub(r"@\w+", "", text)
    text = re.sub(r"\s+", " ", text).strip(" .-")
    parts = re.split(r"(?<=[.!?])\s+", text)
    desc = parts[0] if parts else text
    if len(desc) < 40 and len(parts) > 1:
        desc = f"{parts[0]} {parts[1]}"
    if len(desc) > max_len:
        desc = desc[: max_len - 1].rsplit(" ", 1)[0] + "…"
    return desc or "Custom 3D-printed keepsake from Tathastu Keepsakes."


def parse_profile(html_text: str) -> list[dict]:
    items = []
    chunks = re.split(r'(?=<a[^>]+href="/(?:p|reel|tv)/)', html_text)
    for ch in chunks:
        m = re.search(r'href="/(?:p|reel|tv)/([A-Za-z0-9_-]+)/"', ch)
        if not m:
            continue
        code = m.group(1)
        img = re.search(r"<img[^>]+>", ch, re.I)
        if not img:
            continue
        tag = img.group(0)
        alt_m = re.search(r'alt="([^"]*)"', tag)
        src_m = re.search(r'(?:data-src|src)="([^"]+)"', tag)
        if not src_m:
            continue
        alt = unescape(alt_m.group(1)) if alt_m else ""
        src = unescape(src_m.group(1)).replace("&#38;", "&")
        if "profile avatar" in alt.lower() or "lazy.jpg" in src or "arrow-up" in src:
            continue
        items.append(
            {
                "shortcode": code,
                "caption": alt.strip(),
                "thumb_url": src,
                "permalink": f"https://www.instagram.com/p/{code}/",
            }
        )
    seen, out = set(), []
    for it in items:
        if it["shortcode"] in seen:
            continue
        seen.add(it["shortcode"])
        out.append(it)
    return out


def main() -> None:
    OUT_IMG.mkdir(parents=True, exist_ok=True)
    BRIEFS.mkdir(parents=True, exist_ok=True)
    html = fetch("https://imginn.com/tathastukeepsakes/")
    items = parse_profile(html)
    catalog = []
    for i, it in enumerate(items, 1):
        local_name = f"{i:02d}_{it['shortcode']}.jpg"
        dest = OUT_IMG / local_name
        try:
            size = download(it["thumb_url"], dest)
            rel = f"/images/catalog/ig/{local_name}"
        except Exception:
            # detail page fallback
            page = fetch(f"https://imginn.com/p/{it['shortcode']}/")
            og = re.search(r'property="og:image"\s+content="([^"]+)"', page)
            if not og:
                continue
            size = download(unescape(og.group(1)).replace("&#38;", "&"), dest)
            rel = f"/images/catalog/ig/{local_name}"
            od = re.search(r'property="og:description"\s+content="([^"]*)"', page)
            if od:
                it["caption"] = re.sub(r"^.*?-\s*", "", unescape(od.group(1)))
        desc = clean_desc(it["caption"])
        catalog.append(
            {
                "id": str(i),
                "type": "post",
                "shortcode": it["shortcode"],
                "permalink": it["permalink"],
                "title": desc.split(".")[0][:72],
                "caption": it["caption"][:800],
                "short_description": desc,
                "local_thumbnail": rel,
                "thumbnail_bytes": size,
                "source": "imginn_public_mirror",
                "instagram_profile": "https://www.instagram.com/tathastukeepsakes/",
            }
        )
        print(i, it["shortcode"], desc[:70])

    payload = {
        "metadata": {
            "handle": "tathastukeepsakes",
            "profile_url": "https://www.instagram.com/tathastukeepsakes/",
            "fetch_method": "web_scrape_imginn_public_mirror",
            "total_items": len(catalog),
            "note": "Direct Instagram API blocked; scraped public mirror of the same profile.",
        },
        "media": catalog,
    }
    (BRIEFS / "instagram-media.json").write_text(json.dumps(payload, indent=2, ensure_ascii=False))
    print("wrote", len(catalog), "items")


if __name__ == "__main__":
    main()
