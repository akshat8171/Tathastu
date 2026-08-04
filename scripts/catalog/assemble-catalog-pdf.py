#!/usr/bin/env python3
"""
Tathastu Product Catalog PDF Assembly Script

Assembles PNG images from docs/catalog/pages/ into a professional PDF catalog.
Order: cover.png → section dividers → page-*.png (sorted) → back-cover.png
"""

import os
import sys
import time
import re
from pathlib import Path
from typing import List, Tuple

# Try to import required libraries
try:
    import img2pdf
    from PIL import Image
except ImportError:
    print("Installing required packages...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "img2pdf", "pillow"])
    import img2pdf
    from PIL import Image


# Configuration
REPO_ROOT = Path(__file__).resolve().parent.parent.parent
CATALOG_PAGES_DIR = REPO_ROOT / "docs" / "catalog" / "pages"
EXPORTS_DIR = REPO_ROOT / "docs" / "catalog" / "exports"
PDF_OUTPUT = EXPORTS_DIR / "tathastu-product-catalogue.pdf"
HTML_PREVIEW = EXPORTS_DIR / "catalogue-preview.html"

# A4 size in pixels at 300 DPI (standard print resolution)
A4_WIDTH_PX = 2480
A4_HEIGHT_PX = 3508

# Polling settings
MAX_POLL_TIME = 240  # 4 minutes in seconds
POLL_INTERVAL = 5  # Check every 5 seconds


def wait_for_images(timeout: int = MAX_POLL_TIME) -> bool:
    """
    Poll the catalog pages directory for images.
    Returns True if at least cover and back-cover exist, False if timeout.
    """
    print(f"📂 Polling {CATALOG_PAGES_DIR} for catalog images...")
    start_time = time.time()
    
    while time.time() - start_time < timeout:
        if CATALOG_PAGES_DIR.exists():
            png_files = list(CATALOG_PAGES_DIR.glob("*.png"))
            
            has_cover = any("cover.png" in f.name for f in png_files)
            has_back = any("back-cover.png" in f.name for f in png_files)
            page_count = len([f for f in png_files if f.name.startswith("page-")])
            
            if has_cover and has_back:
                print(f"✓ Found cover, back-cover, and {page_count} product pages")
                return True
            elif png_files:
                print(f"  Partial: {len(png_files)} images found, waiting for cover + back-cover...")
        
        time.sleep(POLL_INTERVAL)
    
    # Timeout reached
    elapsed = time.time() - start_time
    print(f"⏱ Timeout after {elapsed:.1f}s - will assemble whatever exists")
    return False


def get_ordered_images() -> List[Path]:
    """
    Get all PNG images in the correct order:
    1. cover.png
    2. section-*.png (sorted alphabetically)
    3. page-*.png (sorted numerically)
    4. back-cover.png
    """
    if not CATALOG_PAGES_DIR.exists():
        print(f"❌ Error: Directory not found: {CATALOG_PAGES_DIR}")
        return []
    
    all_pngs = list(CATALOG_PAGES_DIR.glob("*.png"))
    
    cover = None
    back_cover = None
    sections = []
    pages = []
    
    for png in all_pngs:
        name = png.name.lower()
        
        if name == "cover.png":
            cover = png
        elif name == "back-cover.png":
            back_cover = png
        elif name.startswith("section-"):
            sections.append(png)
        elif name.startswith("page-"):
            # Extract page number for proper sorting
            match = re.search(r'page-(\d+)', name)
            if match:
                page_num = int(match.group(1))
                pages.append((page_num, png))
    
    # Sort sections alphabetically
    sections.sort(key=lambda p: p.name)
    
    # Sort pages numerically
    pages.sort(key=lambda x: x[0])
    page_files = [p[1] for p in pages]
    
    # Assemble final order
    ordered = []
    if cover:
        ordered.append(cover)
    ordered.extend(sections)
    ordered.extend(page_files)
    if back_cover:
        ordered.append(back_cover)
    
    return ordered


def validate_images(images: List[Path]) -> Tuple[bool, List[str]]:
    """
    Validate that all images are readable and reasonably sized.
    Returns (is_valid, list_of_warnings)
    """
    warnings = []
    
    for img_path in images:
        try:
            with Image.open(img_path) as img:
                width, height = img.size
                
                # Check if image is too small
                if width < 1000 or height < 1000:
                    warnings.append(f"⚠️  {img_path.name}: Low resolution ({width}x{height})")
                
                # Check if aspect ratio is wildly off from A4
                aspect = width / height
                a4_aspect = A4_WIDTH_PX / A4_HEIGHT_PX
                if abs(aspect - a4_aspect) > 0.3:
                    warnings.append(f"⚠️  {img_path.name}: Unusual aspect ratio ({width}x{height})")
        
        except Exception as e:
            warnings.append(f"❌ {img_path.name}: Cannot open - {str(e)}")
            return False, warnings
    
    return True, warnings


def create_pdf(images: List[Path], output_path: Path) -> bool:
    """
    Create PDF from images using img2pdf (preserves quality, no re-encoding).
    """
    if not images:
        print("❌ No images to process")
        return False
    
    print(f"\n📄 Creating PDF with {len(images)} pages...")
    
    try:
        # Ensure output directory exists
        output_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Use img2pdf for best quality (no re-encoding)
        # A4 size: 210mm x 297mm
        a4_size = (img2pdf.mm_to_pt(210), img2pdf.mm_to_pt(297))
        layout_fun = img2pdf.get_layout_fun(a4_size)
        
        with open(output_path, "wb") as f:
            f.write(img2pdf.convert(
                [str(img) for img in images],
                layout_fun=layout_fun
            ))
        
        print(f"✅ PDF created: {output_path}")
        return True
    
    except Exception as e:
        print(f"❌ PDF creation failed: {str(e)}")
        return False


def create_html_preview(images: List[Path], output_path: Path) -> bool:
    """
    Create an HTML preview with left/right page layout for spot checks.
    """
    if not images:
        return False
    
    print(f"\n🌐 Creating HTML preview...")
    
    try:
        output_path.parent.mkdir(parents=True, exist_ok=True)
        
        html = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tathastu Product Catalogue - Preview</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: #1a1a1a;
            color: #ffffff;
            padding: 20px;
        }
        .header {
            text-align: center;
            padding: 40px 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 12px;
            margin-bottom: 40px;
        }
        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
        }
        .header p {
            font-size: 1.1rem;
            opacity: 0.9;
        }
        .spread-container {
            max-width: 1600px;
            margin: 0 auto;
        }
        .spread {
            display: flex;
            gap: 20px;
            margin-bottom: 40px;
            background: #2a2a2a;
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        }
        .page {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        .page img {
            width: 100%;
            height: auto;
            border-radius: 8px;
            box-shadow: 0 4px 16px rgba(0,0,0,0.4);
        }
        .page-label {
            margin-top: 12px;
            font-size: 0.9rem;
            color: #a0a0a0;
            font-weight: 500;
        }
        .single {
            justify-content: center;
        }
        .single .page {
            max-width: 50%;
        }
        .stats {
            text-align: center;
            padding: 30px;
            background: #2a2a2a;
            border-radius: 12px;
            margin-top: 40px;
        }
        .stats h2 {
            font-size: 1.5rem;
            margin-bottom: 15px;
            color: #667eea;
        }
        .stats p {
            font-size: 1.1rem;
            color: #c0c0c0;
            margin: 8px 0;
        }
        @media (max-width: 1200px) {
            .spread {
                flex-direction: column;
            }
            .single .page {
                max-width: 100%;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>📚 Tathastu Product Catalogue</h1>
        <p>HTML Preview - Left/Right Spread Layout</p>
    </div>
    
    <div class="spread-container">
"""
        
        # Add images in pairs (spread layout)
        for i in range(0, len(images), 2):
            if i + 1 < len(images):
                # Two-page spread
                left_img = images[i]
                right_img = images[i + 1]
                
                left_rel = os.path.relpath(left_img, output_path.parent)
                right_rel = os.path.relpath(right_img, output_path.parent)
                
                html += f"""
        <div class="spread">
            <div class="page">
                <img src="{left_rel}" alt="{left_img.name}">
                <div class="page-label">Page {i + 1}: {left_img.name}</div>
            </div>
            <div class="page">
                <img src="{right_rel}" alt="{right_img.name}">
                <div class="page-label">Page {i + 2}: {right_img.name}</div>
            </div>
        </div>
"""
            else:
                # Single page (odd number of pages)
                img = images[i]
                img_rel = os.path.relpath(img, output_path.parent)
                
                html += f"""
        <div class="spread single">
            <div class="page">
                <img src="{img_rel}" alt="{img.name}">
                <div class="page-label">Page {i + 1}: {img.name}</div>
            </div>
        </div>
"""
        
        html += f"""
    </div>
    
    <div class="stats">
        <h2>📊 Catalogue Statistics</h2>
        <p><strong>Total Pages:</strong> {len(images)}</p>
        <p><strong>Generated:</strong> {time.strftime('%Y-%m-%d %H:%M:%S')}</p>
    </div>
</body>
</html>
"""
        
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(html)
        
        print(f"✅ HTML preview created: {output_path}")
        return True
    
    except Exception as e:
        print(f"❌ HTML preview creation failed: {str(e)}")
        return False


def main():
    """Main execution function."""
    print("=" * 60)
    print("🎨 Tathastu Product Catalog PDF Assembly")
    print("=" * 60)
    
    # Wait for images (with timeout)
    wait_for_images()
    
    # Get ordered list of images
    images = get_ordered_images()
    
    if not images:
        print("\n❌ No images found to assemble. Exiting.")
        print(f"   Expected location: {CATALOG_PAGES_DIR}")
        return 1
    
    print(f"\n📋 Found {len(images)} images:")
    for i, img in enumerate(images, 1):
        print(f"   {i:2d}. {img.name}")
    
    # Validate images
    is_valid, warnings = validate_images(images)
    
    if warnings:
        print("\n⚠️  Validation warnings:")
        for warning in warnings:
            print(f"   {warning}")
    
    if not is_valid:
        print("\n❌ Image validation failed. Please fix errors and try again.")
        return 1
    
    # Create PDF
    pdf_success = create_pdf(images, PDF_OUTPUT)
    
    # Create HTML preview
    html_success = create_html_preview(images, HTML_PREVIEW)
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 ASSEMBLY SUMMARY")
    print("=" * 60)
    
    if pdf_success:
        file_size = PDF_OUTPUT.stat().st_size / (1024 * 1024)  # MB
        print(f"✅ PDF: {PDF_OUTPUT}")
        print(f"   Size: {file_size:.2f} MB")
        print(f"   Pages: {len(images)}")
    
    if html_success:
        print(f"✅ HTML Preview: {HTML_PREVIEW}")
        print(f"   Open in browser for spot checks")
    
    print("=" * 60)
    
    return 0 if (pdf_success and html_success) else 1


if __name__ == "__main__":
    sys.exit(main())
