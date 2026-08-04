#!/usr/bin/env python3
"""
Elite Catalog Page Renderer
Creates stunning A4 catalog pages for Tathastu products.

Usage:
    python scripts/catalog/render-catalog-page.py --id PRODUCT_ID --out PATH
"""

import argparse
import json
import os
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter
from typing import Optional, Tuple


# Brand colors
BRAND_TEAL = "#1F717A"
SOFT_WASH_START = "#EAF8F9"
SOFT_WASH_END = "#FFFFFF"
PHOTO_PANEL_BG = "#EDF1F6"
TEXT_DARK = "#2C2C2C"
TEXT_LIGHT = "#666666"

# Default canvas size (A4 at 150dpi for speed)
DEFAULT_WIDTH = 1748
DEFAULT_HEIGHT = 2480
DEFAULT_DPI = 150


def hex_to_rgb(hex_color: str) -> Tuple[int, int, int]:
    """Convert hex color to RGB tuple."""
    hex_color = hex_color.lstrip('#')
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))


def create_gradient(draw, width, height, start_color, end_color):
    """Create a vertical gradient from start_color to end_color."""
    start_rgb = hex_to_rgb(start_color)
    end_rgb = hex_to_rgb(end_color)
    
    for y in range(height):
        ratio = y / height
        r = int(start_rgb[0] + (end_rgb[0] - start_rgb[0]) * ratio)
        g = int(start_rgb[1] + (end_rgb[1] - start_rgb[1]) * ratio)
        b = int(start_rgb[2] + (end_rgb[2] - start_rgb[2]) * ratio)
        
        draw.rectangle([(0, y), (width, y + 1)], fill=(r, g, b))


def load_font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    """Load font with fallback options."""
    font_paths = [
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf" if bold else "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
    ]
    
    for font_path in font_paths:
        if os.path.exists(font_path):
            try:
                return ImageFont.truetype(font_path, size)
            except Exception:
                continue
    
    # Fallback to default
    return ImageFont.load_default()


def wrap_text(text: str, font: ImageFont.FreeTypeFont, max_width: int) -> list:
    """Wrap text to fit within max_width."""
    words = text.split()
    lines = []
    current_line = []
    
    for word in words:
        test_line = ' '.join(current_line + [word])
        bbox = font.getbbox(test_line)
        width = bbox[2] - bbox[0]
        
        if width <= max_width:
            current_line.append(word)
        else:
            if current_line:
                lines.append(' '.join(current_line))
                current_line = [word]
            else:
                lines.append(word)
    
    if current_line:
        lines.append(' '.join(current_line))
    
    return lines


def load_product_data(products_file: str, product_id: str) -> Optional[dict]:
    """Load product data from JSON file."""
    try:
        with open(products_file, 'r', encoding='utf-8') as f:
            products = json.load(f)
        
        for product in products:
            if product['id'] == product_id:
                return product
        
        return None
    except Exception as e:
        print(f"Error loading product data: {e}")
        return None


def load_theme_config(theme_file: str) -> Optional[dict]:
    """Load theme configuration if it exists."""
    if not os.path.exists(theme_file):
        return None
    
    try:
        with open(theme_file, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception:
        return None


def render_catalog_page(product: dict, output_path: str, theme: Optional[dict] = None):
    """Render a catalog page for the given product."""
    
    # Determine canvas size
    if theme and 'canvas' in theme:
        width = theme['canvas'].get('width', DEFAULT_WIDTH)
        height = theme['canvas'].get('height', DEFAULT_HEIGHT)
        dpi = theme['canvas'].get('dpi', DEFAULT_DPI)
    else:
        width = DEFAULT_WIDTH
        height = DEFAULT_HEIGHT
        dpi = DEFAULT_DPI
    
    # Create canvas
    canvas = Image.new('RGB', (width, height), 'white')
    draw = ImageDraw.Draw(canvas)
    
    # Calculate panel widths
    left_panel_width = int(width * 0.42)
    right_panel_start = left_panel_width
    right_panel_width = width - left_panel_width
    
    # Draw gradient background on left panel
    left_panel = Image.new('RGB', (left_panel_width, height), 'white')
    left_draw = ImageDraw.Draw(left_panel)
    create_gradient(left_draw, left_panel_width, height, SOFT_WASH_START, SOFT_WASH_END)
    canvas.paste(left_panel, (0, 0))
    
    # Draw right panel background
    draw.rectangle([(right_panel_start, 0), (width, height)], fill=hex_to_rgb(PHOTO_PANEL_BG))
    
    # Load fonts
    eyebrow_font = load_font(int(28 * (width / DEFAULT_WIDTH)), False)
    title_font = load_font(int(56 * (width / DEFAULT_WIDTH)), True)
    description_font = load_font(int(32 * (width / DEFAULT_WIDTH)), False)
    price_font = load_font(int(72 * (width / DEFAULT_WIDTH)), True)
    footer_font = load_font(int(24 * (width / DEFAULT_WIDTH)), False)
    
    # Render text on left panel
    margin = int(60 * (width / DEFAULT_WIDTH))
    y_position = int(120 * (height / DEFAULT_HEIGHT))
    text_width = left_panel_width - (2 * margin)
    
    # Category eyebrow (uppercase)
    category = product.get('category', '').upper().replace('-', ' ')
    draw.text((margin, y_position), category, fill=hex_to_rgb(TEXT_LIGHT), font=eyebrow_font)
    y_position += int(60 * (height / DEFAULT_HEIGHT))
    
    # Product name
    name_lines = wrap_text(product['name'], title_font, text_width)
    for line in name_lines:
        draw.text((margin, y_position), line, fill=hex_to_rgb(TEXT_DARK), font=title_font)
        y_position += int(70 * (height / DEFAULT_HEIGHT))
    
    y_position += int(40 * (height / DEFAULT_HEIGHT))
    
    # Description
    description_lines = wrap_text(product['description'], description_font, text_width)
    max_description_lines = 8
    for i, line in enumerate(description_lines[:max_description_lines]):
        draw.text((margin, y_position), line, fill=hex_to_rgb(TEXT_LIGHT), font=description_font)
        y_position += int(45 * (height / DEFAULT_HEIGHT))
    
    y_position += int(60 * (height / DEFAULT_HEIGHT))
    
    # Price in brand teal
    price = product['price']
    price_text = f"₹{price:,}"
    draw.text((margin, y_position), price_text, fill=hex_to_rgb(BRAND_TEAL), font=price_font)
    
    if 'originalPrice' in product and product['originalPrice'] > price:
        original_price_text = f"₹{product['originalPrice']:,}"
        bbox = price_font.getbbox(price_text)
        price_width = bbox[2] - bbox[0]
        
        small_price_font = load_font(int(40 * (width / DEFAULT_WIDTH)), False)
        draw.text(
            (margin + price_width + 30, y_position + 15),
            original_price_text,
            fill=hex_to_rgb(TEXT_LIGHT),
            font=small_price_font
        )
        
        # Strikethrough
        bbox = small_price_font.getbbox(original_price_text)
        strike_width = bbox[2] - bbox[0]
        strike_y = y_position + 35
        draw.line(
            [(margin + price_width + 30, strike_y), 
             (margin + price_width + 30 + strike_width, strike_y)],
            fill=hex_to_rgb(TEXT_LIGHT),
            width=2
        )
    
    # Footer
    footer_y = height - int(80 * (height / DEFAULT_HEIGHT))
    draw.text((margin, footer_y), "Tathastu Keepsakes", fill=hex_to_rgb(TEXT_LIGHT), font=footer_font)
    
    # Load and render product photo on right panel
    repo_root = Path(__file__).parent.parent.parent
    image_path = product['image'].lstrip('/')
    full_image_path = repo_root / 'public' / image_path
    
    if full_image_path.exists():
        try:
            product_image = Image.open(full_image_path)
            
            # Calculate target size (maintain aspect ratio, fit within panel with margins)
            panel_margin = int(80 * (width / DEFAULT_WIDTH))
            max_img_width = right_panel_width - (2 * panel_margin)
            max_img_height = height - (2 * panel_margin)
            
            # Resize to fit
            product_image.thumbnail((max_img_width, max_img_height), Image.Resampling.LANCZOS)
            
            # Create rounded corners
            mask = Image.new('L', product_image.size, 0)
            mask_draw = ImageDraw.Draw(mask)
            corner_radius = int(30 * (width / DEFAULT_WIDTH))
            mask_draw.rounded_rectangle(
                [(0, 0), product_image.size],
                radius=corner_radius,
                fill=255
            )
            
            # Apply mask
            rounded_image = Image.new('RGBA', product_image.size, (0, 0, 0, 0))
            rounded_image.paste(product_image.convert('RGBA'), (0, 0))
            rounded_image.putalpha(mask)
            
            # Create shadow
            shadow = Image.new('RGBA', (rounded_image.width + 40, rounded_image.height + 40), (0, 0, 0, 0))
            shadow_draw = ImageDraw.Draw(shadow)
            shadow_draw.rounded_rectangle(
                [(20, 20), (rounded_image.width + 20, rounded_image.height + 20)],
                radius=corner_radius,
                fill=(0, 0, 0, 40)
            )
            shadow = shadow.filter(ImageFilter.GaussianBlur(radius=15))
            
            # Calculate centered position
            img_x = right_panel_start + (right_panel_width - rounded_image.width) // 2
            img_y = (height - rounded_image.height) // 2
            
            # Paste shadow and image
            shadow_x = img_x - 20
            shadow_y = img_y - 20
            canvas.paste(shadow, (shadow_x, shadow_y), shadow)
            canvas.paste(rounded_image, (img_x, img_y), rounded_image)
            
        except Exception as e:
            print(f"Warning: Could not load product image: {e}")
    
    # Save the catalog page
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    canvas.save(output_path, dpi=(dpi, dpi))
    print(f"✓ Rendered catalog page: {output_path}")


def main():
    parser = argparse.ArgumentParser(description='Render a catalog page for a product')
    parser.add_argument('--id', required=True, help='Product ID')
    parser.add_argument('--out', required=True, help='Output path for PNG')
    
    args = parser.parse_args()
    
    # Locate data files
    repo_root = Path(__file__).parent.parent.parent
    products_file = repo_root / 'docs' / 'catalog' / 'briefs' / 'products-source.json'
    theme_file = repo_root / 'docs' / 'catalog' / 'briefs' / 'theme.json'
    
    # Load product data
    product = load_product_data(str(products_file), args.id)
    if not product:
        print(f"Error: Product '{args.id}' not found in {products_file}")
        sys.exit(1)
    
    # Load theme if available
    theme = load_theme_config(str(theme_file))
    
    # Render the page
    render_catalog_page(product, args.out, theme)


if __name__ == '__main__':
    main()
