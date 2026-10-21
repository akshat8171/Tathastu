#!/usr/bin/env python3
"""Copy locked dashboard-idol shots into public/ and upsert SKUs in lib/products.json.

Intel from docs/catalog/research/selfmini-idols-2026-10-21.json informs assortment
and pricing only — images and copy are original Tathastu PLA work from Agra.
"""

from __future__ import annotations

import json
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LOCKED = ROOT / "docs" / "catalog" / "generated" / "locked"
PUBLIC = ROOT / "public" / "images" / "products"
CATALOG = ROOT / "lib" / "products.json"

CARE = (
    "Wipe gently with a soft, dry cloth. Avoid harsh chemicals and prolonged "
    "direct sunlight to keep colours vivid. PLA softens in a closed hot car — "
    "keep the idol shaded on the dash."
)
SHIPPING = (
    "Made to order and dispatched in 2–4 days. Free shipping on orders over ₹199. "
    "Tracked & insured pan-India delivery."
)
CREATED = "2026-10-21T00:00:00.000Z"
CATEGORY = "pooja-decor"

SHOTS = [
    ("s1-hero-studio", "01-hero.png"),
    ("s2-studio", "02-studio.png"),
    ("s3-lifestyle", "03-lifestyle.png"),
    ("s4-macro", "04-macro.png"),
    ("s5-dimensions", "05-dimensions.png"),
    ("s6-inuse", "06-inuse.png"),
    ("s7-box", "07-box.png"),
    ("s8-inhand", "08-inhand.png"),
]

PRODUCTS = [
    {
        "id": "pooja-decor-dashboard-shiva",
        "prefix": "p34-dash-shiva",
        "name": "Lord Shiva Car Dashboard Idol",
        "price": 799,
        "originalPrice": 2500,
        "sizes": ["4 Inch", "5 Inch"],
        "dims": "4–5 inch height (~10–13 cm)",
        "weight": "~80 g",
        "desc": (
            "Compact Lord Shiva (Mahadev) idol for a car dashboard, desk, or home mandir. "
            "3D printed in durable PLA in Agra with a flat, stable base. Choose 4 inch or "
            "5 inch at checkout. Packed in a Tathastu Keepsakes gift box."
        ),
        "perfect": ["Car dashboard", "Home mandir", "Desk blessings", "Festive gifting"],
        "features": ["Flat dashboard base", "Size choice at checkout", "Made to order in Agra"],
    },
    {
        "id": "pooja-decor-dashboard-baby-shiva",
        "prefix": "p35-dash-babyshiva",
        "name": "Baby Shiva Car Dashboard Idol",
        "price": 1399,
        "originalPrice": 2500,
        "sizes": ["4 Inch", "5 Inch"],
        "dims": "4–5 inch height (~10–13 cm)",
        "weight": "~90 g",
        "desc": (
            "Cute Baby Shiva idol sized for a car dashboard or office desk. Printed in PLA "
            "in our Agra workshop with a wide, flat base so it sits steady. Pick 4 inch or "
            "5 inch. Gift-box packed by Tathastu Keepsakes."
        ),
        "perfect": ["Car dashboard", "Office desk", "Kids spiritual gifts", "Home mandir"],
        "features": ["Adorable bal form", "Stable flat base", "PLA printed to order"],
    },
    {
        "id": "pooja-decor-dashboard-shiva-nandi",
        "prefix": "p36-dash-shivanandi",
        "name": "Lord Shiva on Nandi Idol",
        "price": 2899,
        "originalPrice": 4500,
        "sizes": ["5 Inch", "6 Inch", "8 Inch"],
        "dims": "5–8 inch height (~13–20 cm)",
        "weight": "~180 g",
        "desc": (
            "Lord Shiva seated on Nandi — a statement PLA idol for home mandir shelves and "
            "larger dashboards. Printed to order in Agra. Available in 5 inch, 6 inch, or "
            "8 inch. Packed ready to gift."
        ),
        "perfect": ["Home mandir", "Shelf décor", "Housewarming gifts", "Mahashivratri"],
        "features": ["Shiva with Nandi pose", "Three size options", "Gift-box packed"],
    },
    {
        "id": "pooja-decor-dashboard-ganesha",
        "prefix": "p37-dash-ganesha",
        "name": "Lord Ganesha Car Dashboard Idol",
        "price": 1199,
        "originalPrice": 2900,
        "sizes": ["4 Inch", "5 Inch"],
        "dims": "4–5 inch height (~10–13 cm)",
        "weight": "~85 g",
        "desc": (
            "Lord Ganesha idol for car dashboard, new beginnings, and daily puja. "
            "Multi-colour PLA print from Agra with a flat base. Choose 4 inch or 5 inch. "
            "Ships in a Tathastu Keepsakes gift box."
        ),
        "perfect": ["Car dashboard", "Ganesh Chaturthi", "Housewarming", "Office desk"],
        "features": ["Vighnaharta form", "Dashboard-ready base", "Size selectable"],
    },
    {
        "id": "pooja-decor-dashboard-bal-ganesha",
        "prefix": "p38-dash-balganesha",
        "name": "Bal Ganesha Car Dashboard Idol",
        "price": 1199,
        "originalPrice": 3000,
        "sizes": ["4 Inch", "5 Inch"],
        "dims": "4–5 inch height (~10–13 cm)",
        "weight": "~85 g",
        "desc": (
            "Joyful Bal Ganesha idol sized for dashboard and desk. Printed in PLA in Agra, "
            "with a stable base and 4 inch or 5 inch size choice. A warm gift for new "
            "journeys and new homes."
        ),
        "perfect": ["Car dashboard", "Kids gifts", "New car blessing", "Home mandir"],
        "features": ["Bal Ganesha pose", "Flat stable base", "Made in Agra"],
    },
    {
        "id": "pooja-decor-dashboard-krishna-flute",
        "prefix": "p39-dash-krishnaflute",
        "name": "Krishna with Flute Car Dashboard Idol",
        "price": 1199,
        "originalPrice": 3000,
        "sizes": ["4 Inch", "5 Inch"],
        "dims": "4–5 inch height (~10–13 cm)",
        "weight": "~85 g",
        "desc": (
            "Shri Krishna with flute — a compact PLA idol for car dashboard or Janmashtami "
            "gifting. Flat base, printed to order in Agra. Select 4 inch or 5 inch at "
            "checkout."
        ),
        "perfect": ["Car dashboard", "Janmashtami", "Home mandir", "Desk décor"],
        "features": ["Flute pose", "Dashboard footprint", "Gift-box packed"],
    },
    {
        "id": "pooja-decor-dashboard-krishna-bust",
        "prefix": "p40-dash-krishnabust",
        "name": "Krishna Bust Car Dashboard Idol",
        "price": 999,
        "originalPrice": 2400,
        "sizes": ["4 Inch", "5 Inch"],
        "dims": "4–5 inch height (~10–13 cm)",
        "weight": "~70 g",
        "desc": (
            "Peaceful Krishna bust murti for dashboard, mandir shelf, or gifting. "
            "3D printed in PLA in Agra with a compact footprint. Available in 4 inch and "
            "5 inch sizes."
        ),
        "perfect": ["Car dashboard", "Mandir shelf", "Spiritual gifts", "Study desk"],
        "features": ["Bust form", "Compact base", "Two size options"],
    },
    {
        "id": "pooja-decor-dashboard-hanuman",
        "prefix": "p41-dash-hanuman",
        "name": "Bal Hanuman Car Dashboard Idol",
        "price": 1499,
        "originalPrice": 3000,
        "sizes": ["4 Inch", "5 Inch"],
        "dims": "4–5 inch height (~10–13 cm)",
        "weight": "~95 g",
        "desc": (
            "Bal Hanuman (Bajrangbali) idol for car dashboard strength and calm. "
            "Printed in PLA in our Agra workshop with a flat base. Choose 4 inch or "
            "5 inch. Packed by Tathastu Keepsakes."
        ),
        "perfect": ["Car dashboard", "Hanuman Jayanti", "Office desk", "Home mandir"],
        "features": ["Bal Hanuman form", "Stable dash base", "Made to order"],
    },
    {
        "id": "pooja-decor-dashboard-laxmi-ganesh",
        "prefix": "p42-dash-laxmiganesh",
        "name": "Laxmi Ganesh Pair Idol",
        "price": 2149,
        "originalPrice": 4000,
        "sizes": ["4 Inch", "5 Inch"],
        "dims": "4–5 inch height (~10–13 cm)",
        "weight": "~140 g",
        "desc": (
            "Laxmi and Ganesh pair idol for Diwali puja, home temple, or a blessed "
            "dashboard. Multi-colour PLA, printed to order in Agra. Available in 4 inch "
            "and 5 inch. Gift-box ready."
        ),
        "perfect": ["Diwali puja", "Home mandir", "Housewarming", "Car dashboard"],
        "features": ["Laxmi + Ganesh pair", "Size choice", "Festive gift packing"],
    },
]


def find_shot(prefix: str, shot: str) -> Path:
    primary = LOCKED / f"{prefix}-{shot}.png"
    if primary.exists():
        return primary
    hero = LOCKED / f"{prefix}-s1-hero-studio.png"
    if hero.exists():
        return hero
    raise FileNotFoundError(f"Missing shot {prefix} {shot} (no s1-hero-studio fallback)")


def copy_images(product: dict) -> list[str]:
    dest_dir = PUBLIC / CATEGORY / product["id"]
    dest_dir.mkdir(parents=True, exist_ok=True)
    urls: list[str] = []
    for shot, filename in SHOTS:
        src = find_shot(product["prefix"], shot)
        dest = dest_dir / filename
        shutil.copy2(src, dest)
        urls.append(f"/images/products/{CATEGORY}/{product['id']}/{filename}")
    return urls


def build_payload(product: dict, images: list[str]) -> dict:
    sizes = product["sizes"]
    return {
        "id": product["id"],
        "name": product["name"],
        "description": product["desc"],
        "price": product["price"],
        "originalPrice": product["originalPrice"],
        "images": images,
        "category": CATEGORY,
        "rating": 5,
        "reviewCount": 0,
        "badge": "New Arrival",
        "labelType": "new",
        "isSoldOut": False,
        "careGuide": CARE,
        "shippingInfo": SHIPPING,
        "colors": ["Multi-colour"],
        "customizable": False,
        "customText": None,
        "options": [{"name": "Size", "values": sizes}],
        "specs": {
            "material": "PLA / PLA+",
            "printTech": "Multi-colour FDM",
            "finish": "Matte",
            "origin": "Made in India",
            "dimensions": product["dims"],
            "weight": product["weight"],
        },
        "benefits": [
            "Printed to order in Agra, India",
            "Premium multi-colour PLA",
            "Flat base suited to car dashboards and shelves",
            "Packed in a Tathastu Keepsakes gift box",
            "Size selectable at checkout",
        ],
        "about": product["desc"],
        "keyFeatures": product["features"],
        "perfectFor": product["perfect"],
        "whyBuy": (
            "An original Tathastu Keepsakes PLA idol — printed fresh in Agra so you get "
            "the same detail as our studio shots, not a stock replica."
        ),
        "createdAt": CREATED,
    }


def main() -> None:
    catalog = json.loads(CATALOG.read_text())
    existing = {row["id"] for row in catalog}
    added: list[str] = []
    for product in PRODUCTS:
        if product["id"] in existing:
            catalog = [row for row in catalog if row["id"] != product["id"]]
        images = copy_images(product)
        catalog.append(build_payload(product, images))
        added.append(product["id"])
        print(f"added {product['id']} ({len(images)} photos)")
    CATALOG.write_text(json.dumps(catalog, indent=2, ensure_ascii=False) + "\n")
    print(f"catalog now has {len(catalog)} products; wrote {len(added)} dashboard idol SKUs")


if __name__ == "__main__":
    main()
