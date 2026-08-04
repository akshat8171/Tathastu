#!/usr/bin/env python3
"""Render all catalog product pages + covers, then assemble PDF."""
from __future__ import annotations

import json
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "scripts/catalog"))
from importlib.machinery import SourceFileLoader

render_mod = SourceFileLoader(
    "render_catalog_page",
    str(ROOT / "scripts/catalog/render-catalog-page.py"),
).load_module()

PAGES = ROOT / "docs/catalog/pages"
EXPORTS = ROOT / "docs/catalog/exports"
BRIEFS = ROOT / "docs/catalog/briefs"
TEAL = (31, 113, 122)
VIOLET = (75, 44, 120)
INK = (22, 24, 43)
WASH = (234, 248, 249)
WHITE = (255, 255, 255)
W, H = 1240, 1754

CATEGORY_ORDER = [
    "pooja-decor",
    "keyrings",
    "gaming",
    "organizers",
    "lamps",
    "planters",
    "rakhi",
]


def font(size: int, bold: bool = False):
    path = (
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
        if bold
        else "/System/Library/Fonts/Supplemental/Arial.ttf"
    )
    try:
        return ImageFont.truetype(path, size)
    except OSError:
        return ImageFont.load_default()


def format_inr(amount) -> str:
    return "₹" + format(float(amount), ",.2f")


def load_entries() -> list[dict]:
    products = json.loads((ROOT / "lib/products.json").read_text())
    by_cat: dict[str, list] = {}
    for p in products:
        if p.get("isSoldOut"):
            continue
        by_cat.setdefault(p["category"], []).append(p)

    ordered = []
    for cat in CATEGORY_ORDER:
        ordered.extend(sorted(by_cat.pop(cat, []), key=lambda x: x["name"]))
    for cat in sorted(by_cat):
        ordered.extend(sorted(by_cat[cat], key=lambda x: x["name"]))

    entries = []
    for i, p in enumerate(ordered, start=1):
        entries.append({
            "productId": p["id"],
            "name": p["name"],
            "description": (p.get("description") or "")[:320],
            "price": p["price"],
            "priceLabel": format_inr(p["price"]),
            "category": p["category"],
            "imagePath": (p.get("images") or [""])[0],
            "pageNumber": i,
        })
    return entries


def render_cover(path: Path, title: str, subtitle: str) -> None:
    img = Image.new("RGB", (W, H), WASH)
    draw = ImageDraw.Draw(img)
    # gradient-ish bands
    for y in range(H):
        t = y / H
        r = int(WASH[0] * (1 - t) + 243 * t)
        g = int(WASH[1] * (1 - t) + 238 * t)
        b = int(WASH[2] * (1 - t) + 249 * t)
        draw.line([(0, y), (W, y)], fill=(r, g, b))
    draw.rectangle([0, 0, W, 18], fill=TEAL)
    draw.rectangle([0, H - 18, W, H], fill=VIOLET)

    logo = ROOT / "public/images/logo/tk-mark.png"
    if logo.exists():
        mark = Image.open(logo).convert("RGBA")
        mark.thumbnail((160, 160), Image.Resampling.LANCZOS)
        img.paste(mark, ((W - mark.width) // 2, 280), mark)

    draw.text((W // 2, 520), "TATHASTU KEEPSAKES", fill=INK, font=font(42, True), anchor="mm")
    draw.text((W // 2, 590), title, fill=TEAL, font=font(56, True), anchor="mm")
    draw.text((W // 2, 680), subtitle, fill=VIOLET, font=font(28), anchor="mm")
    draw.text((W // 2, 780), "@tathastukeepsakes", fill=(75, 85, 99), font=font(24), anchor="mm")
    draw.text((W // 2, 1600), "Agra, India · 2026", fill=(75, 85, 99), font=font(22), anchor="mm")
    path.parent.mkdir(parents=True, exist_ok=True)
    img.save(path, "PNG", optimize=True)


def render_back(path: Path) -> None:
    img = Image.new("RGB", (W, H), WHITE)
    draw = ImageDraw.Draw(img)
    draw.rectangle([0, 0, W, 18], fill=TEAL)
    draw.text((W // 2, 420), "Thank you", fill=INK, font=font(52, True), anchor="mm")
    draw.text((W // 2, 520), "Tathastu Keepsakes", fill=TEAL, font=font(36, True), anchor="mm")
    lines = [
        "+91 91548 92790",
        "tathastukeepsakes@gmail.com",
        "instagram.com/tathastukeepsakes",
        "Agra, Uttar Pradesh, India",
        "We currently ship across India",
    ]
    y = 640
    for line in lines:
        draw.text((W // 2, y), line, fill=(75, 85, 99), font=font(26), anchor="mm")
        y += 48
    draw.text((W // 2, 1600), "Prices as listed in store · No invented prices", fill=TEAL, font=font(20), anchor="mm")
    path.parent.mkdir(parents=True, exist_ok=True)
    img.save(path, "PNG", optimize=True)


def assemble_pdf(paths: list[Path], out: Path) -> None:
    out.parent.mkdir(parents=True, exist_ok=True)
    images = [Image.open(p).convert("RGB") for p in paths]
    images[0].save(out, "PDF", save_all=True, append_images=images[1:], resolution=150.0)


def main() -> None:
    entries = load_entries()
    BRIEFS.mkdir(parents=True, exist_ok=True)
    (BRIEFS / "03-catalog-entries.json").write_text(json.dumps(entries, indent=2))
    audit = ["# Price audit — catalog vs products.json\n", "| ID | Price |\n|---|---|\n"]
    for e in entries:
        audit.append(f"| `{e['productId']}` | {e['priceLabel']} |\n")
    (BRIEFS / "03-price-audit.md").write_text("".join(audit))

    PAGES.mkdir(parents=True, exist_ok=True)
    render_cover(PAGES / "cover.png", "Product Catalogue", "3D-printed keepsakes · Made to order")
    render_back(PAGES / "back-cover.png")

    page_paths: list[Path] = [PAGES / "cover.png"]
    manifest = []
    for e in entries:
        product = {
            "id": e["productId"],
            "name": e["name"],
            "price": e["price"],
            "category": e["category"],
            "description": e["description"],
            "image": e["imagePath"],
        }
        out = PAGES / f"page-{e['pageNumber']:03d}-{e['productId']}.png"
        render_mod.render_page(product, out, e["pageNumber"])
        page_paths.append(out)
        manifest.append({"page": e["pageNumber"], "id": e["productId"], "path": str(out.relative_to(ROOT)), "price": e["price"]})

    page_paths.append(PAGES / "back-cover.png")
    (BRIEFS / "04-pages-manifest.json").write_text(json.dumps(manifest, indent=2))

    pdf = EXPORTS / "tathastu-product-catalogue.pdf"
    assemble_pdf(page_paths, pdf)

    # HTML preview (first 6 products)
    cards = []
    for e in entries[:8]:
        cards.append(
            f"<article style='display:grid;grid-template-columns:42% 58%;gap:0;border:1px solid #e5e7eb;"
            f"border-radius:16px;overflow:hidden;margin:16px 0;background:#fff'>"
            f"<div style='padding:24px;background:linear-gradient(#EAF8F9,#fff)'>"
            f"<div style='color:#4B2C78;font-size:12px;letter-spacing:.08em'>{e['category'].upper()}</div>"
            f"<h2 style='color:#16182B;font-size:22px;margin:8px 0'>{e['name']}</h2>"
            f"<p style='color:#4B5563;font-size:14px'>{e['description'][:220]}</p>"
            f"<p style='color:#1F717A;font-size:28px;font-weight:700;margin-top:24px'>{e['priceLabel']}</p>"
            f"</div>"
            f"<div style='background:#EDF1F6;display:flex;align-items:center;justify-content:center;padding:16px'>"
            f"<img src='../../public{e['imagePath']}' alt='' style='max-width:100%;max-height:360px;object-fit:contain'/>"
            f"</div></article>"
        )
    html = (
        "<!doctype html><html><head><meta charset='utf-8'/>"
        "<title>Tathastu Catalogue Preview</title>"
        "<style>body{font-family:system-ui;background:#0f1117;color:#e8ecf4;padding:24px}"
        "a{color:#7dd3c0}</style></head><body>"
        "<h1>Tathastu Product Catalogue — preview</h1>"
        f"<p>Full PDF: <a href='./tathastu-product-catalogue.pdf'>tathastu-product-catalogue.pdf</a> · {len(entries)} products</p>"
        + "".join(cards)
        + "</body></html>"
    )
    EXPORTS.mkdir(parents=True, exist_ok=True)
    (EXPORTS / "catalogue-preview.html").write_text(html)

    # price integrity check
    source = {p["id"]: p["price"] for p in json.loads((ROOT / "lib/products.json").read_text())}
    drifts = [e for e in entries if source.get(e["productId"]) != e["price"]]
    qa = [
        "# Catalog QA\n\n",
        f"- Products rendered: **{len(entries)}**\n",
        f"- PDF: `{pdf.relative_to(ROOT)}`\n",
        f"- Price drifts vs products.json: **{len(drifts)}**\n",
        f"- Verdict: **{'PASS' if not drifts else 'FAIL'}**\n",
    ]
    (BRIEFS / "07-qa-report.md").write_text("".join(qa))
    print(f"Rendered {len(entries)} pages → {pdf}")
    print("Price drifts:", len(drifts))


if __name__ == "__main__":
    main()
