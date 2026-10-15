#!/usr/bin/env python3
"""Build the eight-shot catalog set for dual-name planks and append SKUs.

Hero and lifestyle frames are original studio shots (not supplier photos).
This script turns each pair into the same 01–08 listing set used by the
Amazon / Meesho photoshoot import, then appends the SKUs to lib/products.json
if they are not already there.
"""

from __future__ import annotations

import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parents[1]
ASSETS = Path(
    "/Users/akshat.garg/.cursor/projects/"
    "Users-akshat-garg-Documents-GitHub-new-Tathastu/assets"
)
PUBLIC = ROOT / "public" / "images" / "products" / "home-decor"
CATALOG = ROOT / "lib" / "products.json"
SIZE = 1024
FONT = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial.ttf", 28)
FONT_SM = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial.ttf", 22)

CARE = (
    "Wipe gently with a soft, dry cloth. Avoid harsh chemicals and prolonged "
    "direct sunlight to keep colours vivid."
)
SHIPPING = (
    "Made to order and dispatched in 2–4 days. Free shipping on orders over ₹199. "
    "Tracked & insured pan-India delivery."
)
CREATED = "2026-10-14T00:00:00.000Z"
COLORS = [
    "Blue",
    "Gold",
    "Purple",
    "Yellow",
    "Baby Pink",
    "White",
    "Black",
    "Sky Blue",
    "Red",
    "Green",
]


def square(path: Path) -> Image.Image:
    image = Image.open(path).convert("RGB")
    side = min(image.size)
    left = (image.width - side) // 2
    top = (image.height - side) // 2
    return image.crop((left, top, left + side, top + side)).resize(
        (SIZE, SIZE), Image.Resampling.LANCZOS
    )


def zoom(image: Image.Image, scale: float) -> Image.Image:
    big = image.resize((int(SIZE * scale), int(SIZE * scale)), Image.Resampling.LANCZOS)
    left = (big.width - SIZE) // 2
    top = (big.height - SIZE) // 2
    return big.crop((left, top, left + SIZE, top + SIZE))


def grade(image: Image.Image, color: float, contrast: float, bright: float) -> Image.Image:
    image = ImageEnhance.Color(image).enhance(color)
    image = ImageEnhance.Contrast(image).enhance(contrast)
    return ImageEnhance.Brightness(image).enhance(bright)


def dimension_plate(image: Image.Image, width: str, height: str, thick: str) -> Image.Image:
    canvas = image.copy()
    draw = ImageDraw.Draw(canvas)
    ink = (14, 90, 72)
    panel = (255, 255, 255)

    def label(text: str, xy: tuple[int, int]) -> None:
        bbox = draw.textbbox((0, 0), text, font=FONT_SM)
        pad = 10
        box = (
            xy[0] - pad,
            xy[1] - pad,
            xy[0] + (bbox[2] - bbox[0]) + pad,
            xy[1] + (bbox[3] - bbox[1]) + pad,
        )
        draw.rounded_rectangle(box, radius=14, fill=panel, outline=ink, width=3)
        draw.text(xy, text, fill=ink, font=FONT_SM)

    draw.line((120, 900, 900, 900), fill=ink, width=4)
    draw.polygon([(120, 900), (148, 888), (148, 912)], fill=ink)
    draw.polygon([(900, 900), (872, 888), (872, 912)], fill=ink)
    label(f"Width {width}", (430, 860))

    draw.line((80, 160, 80, 820), fill=ink, width=4)
    label(f"Height {height}", (96, 460))
    label(f"Thick {thick}", (760, 140))
    return canvas


def gift_box(product: Image.Image) -> Image.Image:
    canvas = Image.new("RGB", (SIZE, SIZE), (236, 226, 210))
    draw = ImageDraw.Draw(canvas)
    draw.rounded_rectangle((180, 420, 844, 900), radius=18, fill=(176, 122, 74))
    draw.rectangle((180, 420, 844, 500), fill=(150, 98, 58))
    draw.rectangle((492, 420, 532, 900), fill=(196, 154, 96))
    draw.polygon([(180, 420), (250, 340), (790, 340), (844, 420)], fill=(196, 146, 92))
    piece = product.resize((560, 560), Image.Resampling.LANCZOS)
    canvas.paste(piece, (232, 80))
    return canvas


def write_shots(product_id: str, hero_name: str, life_name: str, dims: tuple[str, str, str]) -> None:
    folder = PUBLIC / product_id
    folder.mkdir(parents=True, exist_ok=True)
    hero = square(ASSETS / hero_name)
    life = square(ASSETS / life_name)
    shots = {
        "01-hero.png": hero,
        "02-studio.png": grade(zoom(hero, 1.12), 0.92, 1.05, 1.04),
        "03-lifestyle.png": life,
        "04-macro.png": zoom(hero, 1.7),
        "05-dimensions.png": dimension_plate(hero, *dims),
        "06-inuse.png": grade(zoom(life, 1.18), 1.05, 1.04, 0.98),
        "07-box.png": gift_box(hero),
        "08-inhand.png": zoom(hero, 1.35).filter(ImageFilter.SHARPEN),
    }
    for name, image in shots.items():
        image.save(folder / name, "PNG", optimize=True)


def listing(
    product_id: str,
    name: str,
    description: str,
    price: int,
    original: int,
    colors: list[str],
    dims: str,
    weight: str,
    features: list[str],
    perfect: list[str],
    why: str,
    placeholder: str,
) -> dict:
    images = [
        f"/images/products/home-decor/{product_id}/{shot}"
        for shot in (
            "01-hero.png",
            "02-studio.png",
            "03-lifestyle.png",
            "04-macro.png",
            "05-dimensions.png",
            "06-inuse.png",
            "07-box.png",
            "08-inhand.png",
        )
    ]
    return {
        "id": product_id,
        "name": name,
        "description": description,
        "price": price,
        "originalPrice": original,
        "images": images,
        "category": "home-decor",
        "rating": 5,
        "reviewCount": 0,
        "badge": "New Arrival",
        "labelType": "new",
        "isSoldOut": False,
        "careGuide": CARE,
        "shippingInfo": SHIPPING,
        "colors": colors,
        "customizable": True,
        "customText": {
            "label": "Two names",
            "maxLength": 24,
            "placeholder": placeholder,
        },
        "options": [{"name": "Color", "values": colors}],
        "specs": {
            "material": "PLA / PLA+",
            "printTech": "Multi-colour FDM",
            "finish": "Matte",
            "origin": "Made in India",
            "dimensions": dims,
            "weight": weight,
        },
        "benefits": [
            "Printed to order in Agra, India",
            "Two names on one piece",
            "Packed in a Tathastu Keepsakes gift box",
            "Colour chosen at checkout",
            "Studio listing photos of the example names",
        ],
        "about": description,
        "keyFeatures": features,
        "perfectFor": perfect,
        "whyBuy": why,
        "createdAt": CREATED,
    }


SHOTS = [
    ("home-decor-dual-name-plank", "dual-name-plank-hero.jpg", "dual-name-plank-lifestyle.jpg", ("22 cm", "10 cm", "4 cm")),
    ("home-decor-dual-name-photo-frame", "dual-name-photo-frame-hero.jpg", "dual-name-photo-frame-lifestyle.jpg", ("15 cm", "20 cm", "4 cm")),
    ("home-decor-dual-name-plank-light", "dual-name-plank-light-hero.jpg", "dual-name-plank-light-lifestyle.jpg", ("22 cm", "10 cm", "4 cm")),
    ("home-decor-soulmate-combo", "soulmate-combo-hero.jpg", "soulmate-combo-lifestyle.jpg", ("24 cm", "12 cm", "4 cm")),
    ("home-decor-soulmate-combo-light", "soulmate-combo-light-hero.jpg", "soulmate-combo-light-lifestyle.jpg", ("24 cm", "12 cm", "4 cm")),
    ("home-decor-premium-dual-name-plank", "premium-dual-name-plank-hero.jpg", "premium-dual-name-plank-lifestyle.jpg", ("24 cm", "12 cm", "5 cm")),
]

PRODUCTS = [
    listing(
        "home-decor-dual-name-plank",
        "Dual Name Plank",
        "Freestanding dual name plank for a shelf or desk. Share both names after order; we print them with a small heart between the lines. PLA plastic. Example shown: navy plank, AARAV and MEERA. Selling price is ₹100 below the usual ₹599 desk-plank rate.",
        499,
        799,
        COLORS,
        "22 × 4 × 10 cm",
        "~90 g",
        ["Two names, one plank", "Heart between the lines", "Freestanding base"],
        ["Anniversaries", "Weddings", "Desk gifts", "Couple shelves"],
        "A plain two-name plank, printed in Agra, priced ₹100 under the usual ₹599 rate.",
        "e.g. AARAV / MEERA",
    ),
    listing(
        "home-decor-dual-name-photo-frame",
        "Dual Name Photo Frame",
        "Standing photo frame with a dual-name base. Send the photo on WhatsApp after you order, plus the two names for the plank. PLA frame. Example shown: cream frame, gold base, KABIR and ANAYA. Price is ₹100 below the usual ₹1,999 frame.",
        1899,
        2499,
        ["Gold", "Red", "Yellow", "Sky Blue", "Purple", "Baby Pink", "White"],
        "15 × 4 × 20 cm",
        "~180 g",
        ["Photo window", "Dual-name base", "Stands on a table"],
        ["Couple gifts", "Bedside tables", "Anniversaries", "Family photos"],
        "Photo plus two names, made to order, ₹100 under the usual ₹1,999 frame price.",
        "e.g. KABIR / ANAYA",
    ),
    listing(
        "home-decor-dual-name-plank-light",
        "Dual Name Plank with Light",
        "Dual name plank with a warm battery light in the base. Share both names after order. We pack the cell with the piece. Keep it on a shelf — PLA softens in a closed hot car. Example shown: black body, gold RIYA and ARJUN. Price is ₹100 below the usual ₹898 lighted plank.",
        798,
        1198,
        ["Blue", "Gold", "Yellow", "Black", "Red", "Sky Blue"],
        "22 × 4 × 10 cm",
        "~110 g",
        ["Two names", "Warm base light", "Cell packed with the order"],
        ["Evening shelves", "Anniversary gifts", "Bedside", "Couple desks"],
        "The lighted plank, with the cell in the box, ₹100 under the usual ₹898 price.",
        "e.g. RIYA / ARJUN",
    ),
    listing(
        "home-decor-soulmate-combo",
        "Soulmate Combo",
        "Three-piece couple set: a dual name plank, a small rose, and a heart charm. Share both names after order. PLA plastic, packed as one gift. Example shown: pink plank NEHA and DEV, red rose, red heart. Price is ₹100 below the usual ₹749 combo.",
        649,
        999,
        ["Blue", "Yellow", "Black", "White", "Baby Pink", "Gold", "Sky Blue", "Red"],
        "24 × 6 × 12 cm set",
        "~140 g",
        ["Name plank", "Rose", "Heart charm"],
        ["Anniversaries", "Valentine gifts", "Proposal keepsakes", "Long-distance gifts"],
        "Plank, rose, and heart in one box, ₹100 under the usual ₹749 set.",
        "e.g. NEHA / DEV",
    ),
    listing(
        "home-decor-soulmate-combo-light",
        "Soulmate Combo with Light",
        "Soulmate set with a warm light in the name plank: plank, rose, and heart charm. Share both names after order. Cell is packed in the box. Shelf use only — PLA softens in strong heat. Example shown: sky-blue glowing plank, SARA and VIVAAN. Price is ₹100 below the usual ₹999 lighted set.",
        899,
        1399,
        ["Blue", "Yellow", "Black", "White", "Baby Pink", "Gold", "Sky Blue", "Red"],
        "24 × 6 × 12 cm set",
        "~160 g",
        ["Lighted name plank", "Rose", "Heart charm"],
        ["Evening gifts", "Anniversaries", "Date-night keepsakes", "Couple shelves"],
        "The lighted three-piece set, ₹100 under the usual ₹999 price.",
        "e.g. SARA / VIVAAN",
    ),
    listing(
        "home-decor-premium-dual-name-plank",
        "Premium Dual Name Plank",
        "Dual name plank inside a clear case. One name reads from the left and the other from the right, with a heart between them. Share both names after order. Example shown: gold letters ISHAN and MYRA in a clear case. Price is ₹100 below the usual ₹1,499 cased plank.",
        1399,
        1999,
        ["Purple", "Gold", "Yellow", "Blue", "Sky Blue", "Red", "White", "Pink"],
        "24 × 5 × 12 cm",
        "~200 g",
        ["Clear display case", "Names from both sides", "Heart between the names"],
        ["Wedding gifts", "Living-room consoles", "Anniversaries", "Premium couple gifts"],
        "The cased plank, printed to order, ₹100 under the usual ₹1,499 price.",
        "e.g. ISHAN / MYRA",
    ),
]


def append_products() -> None:
    catalog = json.loads(CATALOG.read_text())
    existing = {item["id"] for item in catalog}
    added = [item for item in PRODUCTS if item["id"] not in existing]
    if not added:
        print("catalog already has the dual-name SKUs")
        return
    fragment = json.dumps(added, indent=2, ensure_ascii=False)
    # Drop the wrapping array so the new objects sit inside products.json.
    inner = fragment.strip()[1:-1].strip()
    text = CATALOG.read_text().rstrip()
    if not text.endswith("]"):
        raise SystemExit("products.json does not end with an array")
    body = text[:-1].rstrip()
    if not body.endswith("}"):
        raise SystemExit("products.json array is empty or malformed")
    CATALOG.write_text(body + ",\n" + inner + "\n]\n")
    print(f"appended {len(added)} products")


def main() -> None:
    for product_id, hero, life, dims in SHOTS:
        write_shots(product_id, hero, life, dims)
        print("shots", product_id)
    append_products()


if __name__ == "__main__":
    main()
