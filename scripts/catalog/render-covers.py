#!/usr/bin/env python3
"""
Catalog Cover Generator for Tathastu Keepsakes
===============================================
Generates premium catalog covers and section dividers with teal/lavender aesthetics.

Usage:
    python scripts/catalog/render-covers.py
"""

import os
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter
from typing import Tuple

# ============================================================================
# Configuration
# ============================================================================

# Paths (relative to project root)
PROJECT_ROOT = Path(__file__).parent.parent.parent
LOGO_PATH = PROJECT_ROOT / "public/images/logo/tk-mark.png"
OUTPUT_DIR = PROJECT_ROOT / "docs/catalog/pages"

# Page dimensions (A4 portrait at 300 DPI for print quality)
PAGE_WIDTH = 2480  # 210mm at 300 DPI
PAGE_HEIGHT = 3508  # 297mm at 300 DPI

# Brand colors (cool teal + soft lavender)
COLOR_TEAL = (31, 139, 142)  # #1f8b8e - cool petrol teal
COLOR_LAVENDER = (184, 169, 217)  # #b8a9d9 - soft lavender
COLOR_TEAL_DARK = (22, 99, 101)  # darker teal for accents
COLOR_CREAM = (250, 248, 245)  # off-white for elegance
COLOR_CHARCOAL = (45, 45, 50)  # deep gray for text

# Brand information
BRAND_NAME = "Tathastu Keepsakes"
TAGLINE = "India's Premium 3D Printing & Custom Keepsakes Store"
YEAR = "2026"
INSTAGRAM_HANDLE = "@tathastukeepsakes"
PHONE = "+91 91548 92790"
EMAIL = "tathastukeepsakes@gmail.com"
LOCATION = "Agra, India"

# Categories for section dividers
CATEGORIES = [
    ("pooja-decor", "Pooja & Decor"),
    ("keyrings", "Keyrings"),
    ("gaming", "Gaming"),
    ("organizers", "Organizers"),
    ("lamps", "Lamps"),
    ("planters", "Planters"),
    ("rakhi", "Rakhi"),
]


# ============================================================================
# Typography Helpers
# ============================================================================


def get_font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    """
    Get system font. Falls back to DejaVu Sans (cross-platform).
    """
    font_names = [
        # macOS
        ("/System/Library/Fonts/Supplemental/Arial.ttf", "Arial"),
        ("/System/Library/Fonts/SFNS.ttf", "SF Pro"),
        # Linux
        ("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", "DejaVu Sans Bold"),
        ("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", "DejaVu Sans"),
        # Windows
        ("C:/Windows/Fonts/arial.ttf", "Arial"),
    ]
    
    try:
        if bold:
            for path, _ in font_names:
                if "Bold" in path and os.path.exists(path):
                    return ImageFont.truetype(path, size)
        
        for path, _ in font_names:
            if os.path.exists(path):
                return ImageFont.truetype(path, size)
    except Exception:
        pass
    
    # Fallback to default
    return ImageFont.load_default()


def draw_text_centered(
    draw: ImageDraw.ImageDraw,
    text: str,
    y_pos: int,
    font: ImageFont.FreeTypeFont,
    fill: Tuple[int, int, int],
    width: int,
) -> None:
    """Draw text centered horizontally."""
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    x_pos = (width - text_width) // 2
    draw.text((x_pos, y_pos), text, font=font, fill=fill)


# ============================================================================
# Cover Generation
# ============================================================================


def create_gradient_background(
    width: int, height: int, color_top: Tuple[int, int, int], color_bottom: Tuple[int, int, int]
) -> Image.Image:
    """Create a smooth vertical gradient background."""
    img = Image.new("RGB", (width, height))
    draw = ImageDraw.Draw(img)
    
    for y in range(height):
        # Linear interpolation
        ratio = y / height
        r = int(color_top[0] * (1 - ratio) + color_bottom[0] * ratio)
        g = int(color_top[1] * (1 - ratio) + color_bottom[1] * ratio)
        b = int(color_top[2] * (1 - ratio) + color_bottom[2] * ratio)
        draw.line([(0, y), (width, y)], fill=(r, g, b))
    
    return img


def add_subtle_texture(img: Image.Image) -> Image.Image:
    """Add a subtle noise texture for premium feel."""
    import random
    
    texture = Image.new("RGBA", img.size, (255, 255, 255, 0))
    pixels = texture.load()
    
    # Add sparse noise
    for _ in range(img.width * img.height // 100):  # 1% coverage
        x = random.randint(0, img.width - 1)
        y = random.randint(0, img.height - 1)
        alpha = random.randint(10, 30)
        pixels[x, y] = (255, 255, 255, alpha)
    
    # Convert base to RGBA and composite
    img_rgba = img.convert("RGBA")
    return Image.alpha_composite(img_rgba, texture).convert("RGB")


def create_cover() -> Image.Image:
    """Generate the front cover."""
    print("📄 Generating cover.png...")
    
    # Create gradient background (teal to lavender)
    img = create_gradient_background(PAGE_WIDTH, PAGE_HEIGHT, COLOR_TEAL_DARK, COLOR_LAVENDER)
    img = add_subtle_texture(img)
    draw = ImageDraw.Draw(img)
    
    # Load and place logo
    if LOGO_PATH.exists():
        try:
            logo = Image.open(LOGO_PATH).convert("RGBA")
            # Resize logo to reasonable size
            logo_width = PAGE_WIDTH // 3
            logo.thumbnail((logo_width, logo_width), Image.Resampling.LANCZOS)
            
            # Center logo in upper third
            logo_x = (PAGE_WIDTH - logo.width) // 2
            logo_y = PAGE_HEIGHT // 5
            
            # Paste logo with alpha channel
            img.paste(logo, (logo_x, logo_y), logo)
        except Exception as e:
            print(f"⚠️  Could not load logo: {e}")
    
    # Typography
    font_brand = get_font(140, bold=True)
    font_title = get_font(110, bold=False)
    font_year = get_font(90, bold=False)
    font_tagline = get_font(50, bold=False)
    font_instagram = get_font(45, bold=False)
    
    # Brand name
    y_offset = PAGE_HEIGHT // 2 - 200
    draw_text_centered(draw, BRAND_NAME, y_offset, font_brand, COLOR_CREAM, PAGE_WIDTH)
    
    # Main title
    y_offset += 200
    draw_text_centered(draw, "Product Catalogue", y_offset, font_title, COLOR_CREAM, PAGE_WIDTH)
    
    # Year
    y_offset += 160
    draw_text_centered(draw, YEAR, y_offset, font_year, COLOR_TEAL_DARK, PAGE_WIDTH)
    
    # Decorative line
    y_offset += 140
    line_width = PAGE_WIDTH // 3
    line_x = (PAGE_WIDTH - line_width) // 2
    draw.rectangle([line_x, y_offset, line_x + line_width, y_offset + 3], fill=COLOR_CREAM)
    
    # Tagline
    y_offset += 100
    draw_text_centered(draw, TAGLINE, y_offset, font_tagline, COLOR_CREAM, PAGE_WIDTH)
    
    # Instagram handle
    y_offset = PAGE_HEIGHT - 250
    draw_text_centered(draw, INSTAGRAM_HANDLE, y_offset, font_instagram, COLOR_CREAM, PAGE_WIDTH)
    
    return img


def create_back_cover() -> Image.Image:
    """Generate the back cover with contact information."""
    print("📄 Generating back-cover.png...")
    
    # Create gradient background (reversed: lavender to teal)
    img = create_gradient_background(PAGE_WIDTH, PAGE_HEIGHT, COLOR_LAVENDER, COLOR_TEAL_DARK)
    img = add_subtle_texture(img)
    draw = ImageDraw.Draw(img)
    
    # Typography
    font_title = get_font(100, bold=True)
    font_contact = get_font(60, bold=False)
    font_small = get_font(50, bold=False)
    
    # Title
    y_offset = PAGE_HEIGHT // 3
    draw_text_centered(draw, "Get in Touch", y_offset, font_title, COLOR_CREAM, PAGE_WIDTH)
    
    # Decorative line
    y_offset += 140
    line_width = PAGE_WIDTH // 4
    line_x = (PAGE_WIDTH - line_width) // 2
    draw.rectangle([line_x, y_offset, line_x + line_width, y_offset + 3], fill=COLOR_CREAM)
    
    # Contact details
    y_offset += 150
    contact_lines = [
        ("Phone", PHONE),
        ("Email", EMAIL),
        ("Instagram", INSTAGRAM_HANDLE),
        ("Location", LOCATION),
    ]
    
    for label, value in contact_lines:
        # Label in charcoal
        label_text = f"{label}:"
        bbox = draw.textbbox((0, 0), label_text, font=font_small)
        label_width = bbox[2] - bbox[0]
        
        # Center the whole line
        bbox_value = draw.textbbox((0, 0), value, font=font_contact)
        value_width = bbox_value[2] - bbox_value[0]
        total_width = label_width + 40 + value_width
        
        x_start = (PAGE_WIDTH - total_width) // 2
        
        draw.text((x_start, y_offset), label_text, font=font_small, fill=COLOR_TEAL_DARK)
        draw.text((x_start + label_width + 40, y_offset - 5), value, font=font_contact, fill=COLOR_CREAM)
        
        y_offset += 120
    
    # Brand name at bottom
    y_offset = PAGE_HEIGHT - 200
    draw_text_centered(draw, BRAND_NAME, y_offset, font_title, COLOR_CREAM, PAGE_WIDTH)
    
    return img


def create_section_divider(category_slug: str, category_name: str) -> Image.Image:
    """Generate a section divider page."""
    print(f"📄 Generating section-{category_slug}.png...")
    
    # Create gradient background (subtle teal to lavender)
    color_mid = tuple((COLOR_TEAL[i] + COLOR_LAVENDER[i]) // 2 for i in range(3))
    img = create_gradient_background(PAGE_WIDTH, PAGE_HEIGHT, COLOR_CREAM, color_mid)
    img = add_subtle_texture(img)
    draw = ImageDraw.Draw(img)
    
    # Typography
    font_category = get_font(140, bold=True)
    font_small = get_font(50, bold=False)
    
    # Category name centered
    y_offset = PAGE_HEIGHT // 2 - 100
    draw_text_centered(draw, category_name, y_offset, font_category, COLOR_TEAL_DARK, PAGE_WIDTH)
    
    # Decorative elements
    y_offset += 180
    
    # Left ornament
    left_x = PAGE_WIDTH // 4
    draw.ellipse([left_x - 15, y_offset - 15, left_x + 15, y_offset + 15], fill=COLOR_LAVENDER)
    
    # Right ornament
    right_x = 3 * PAGE_WIDTH // 4
    draw.ellipse([right_x - 15, y_offset - 15, right_x + 15, y_offset + 15], fill=COLOR_LAVENDER)
    
    # Connecting line
    draw.line([(left_x, y_offset), (right_x, y_offset)], fill=COLOR_LAVENDER, width=3)
    
    # Small brand mark at bottom
    y_offset = PAGE_HEIGHT - 200
    draw_text_centered(draw, BRAND_NAME, y_offset, font_small, COLOR_TEAL, PAGE_WIDTH)
    
    return img


# ============================================================================
# Main Execution
# ============================================================================


def main():
    """Generate all catalog pages."""
    print("🎨 Tathastu Keepsakes Catalog Generator")
    print("=" * 50)
    
    # Ensure output directory exists
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    # Generate cover
    cover = create_cover()
    cover_path = OUTPUT_DIR / "cover.png"
    cover.save(cover_path, "PNG", dpi=(300, 300), optimize=True)
    print(f"✅ Saved: {cover_path}")
    
    # Generate back cover
    back_cover = create_back_cover()
    back_cover_path = OUTPUT_DIR / "back-cover.png"
    back_cover.save(back_cover_path, "PNG", dpi=(300, 300), optimize=True)
    print(f"✅ Saved: {back_cover_path}")
    
    # Generate section dividers
    for slug, name in CATEGORIES:
        divider = create_section_divider(slug, name)
        divider_path = OUTPUT_DIR / f"section-{slug}.png"
        divider.save(divider_path, "PNG", dpi=(300, 300), optimize=True)
        print(f"✅ Saved: {divider_path}")
    
    print("\n" + "=" * 50)
    print(f"🎉 Generated {2 + len(CATEGORIES)} catalog pages successfully!")
    print(f"📁 Output directory: {OUTPUT_DIR}")


if __name__ == "__main__":
    main()
