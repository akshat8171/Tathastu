#!/usr/bin/env python3
"""
Batch Catalog Page Renderer
Renders catalog pages for all products in the Tathastu catalog.

Usage:
    python scripts/catalog/render-all-pages.py
"""

import json
import os
import subprocess
import sys
from pathlib import Path
from typing import List, Dict


def load_products(repo_root: Path) -> List[Dict]:
    """Load products from catalog entries or source file."""
    
    # Try catalog entries first
    catalog_entries = repo_root / 'docs' / 'catalog' / 'briefs' / '03-catalog-entries.json'
    if catalog_entries.exists():
        print(f"✓ Loading products from {catalog_entries}")
        with open(catalog_entries, 'r', encoding='utf-8') as f:
            return json.load(f)
    
    # Fallback to products-source.json
    products_source = repo_root / 'docs' / 'catalog' / 'briefs' / 'products-source.json'
    if products_source.exists():
        print(f"✓ Loading products from {products_source}")
        with open(products_source, 'r', encoding='utf-8') as f:
            return json.load(f)
    
    print("Error: No product data found!")
    sys.exit(1)


def render_product_page(repo_root: Path, product: Dict, page_number: int, output_dir: Path) -> Dict:
    """Render a single product page using render-catalog-page.py."""
    
    product_id = product['id']
    output_filename = f"page-{page_number:03d}-{product_id}.png"
    output_path = output_dir / output_filename
    
    # Skip sold-out products only if explicitly marked
    is_sold_out = product.get('isSoldOut', False)
    if is_sold_out:
        print(f"⊘ Skipping sold-out product: {product_id}")
        return None
    
    # Call render-catalog-page.py
    render_script = repo_root / 'scripts' / 'catalog' / 'render-catalog-page.py'
    
    try:
        cmd = [
            sys.executable,
            str(render_script),
            '--id', product_id,
            '--out', str(output_path)
        ]
        
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            check=True
        )
        
        # Print output from render script
        if result.stdout:
            print(result.stdout.strip())
        
        return {
            'productId': product_id,
            'pageNumber': page_number,
            'outputPath': str(output_path.relative_to(repo_root)),
            'productName': product['name'],
            'category': product.get('category', ''),
            'price': product.get('price', 0)
        }
        
    except subprocess.CalledProcessError as e:
        print(f"✗ Error rendering {product_id}: {e.stderr}")
        return None
    except Exception as e:
        print(f"✗ Unexpected error rendering {product_id}: {e}")
        return None


def write_manifest(repo_root: Path, manifest_entries: List[Dict]):
    """Write the pages manifest file."""
    
    manifest_path = repo_root / 'docs' / 'catalog' / 'briefs' / '04-pages-manifest.json'
    
    manifest = {
        'generatedPages': len(manifest_entries),
        'pages': manifest_entries
    }
    
    os.makedirs(manifest_path.parent, exist_ok=True)
    
    with open(manifest_path, 'w', encoding='utf-8') as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)
    
    print(f"\n✓ Wrote manifest: {manifest_path}")


def main():
    # Determine repo root
    repo_root = Path(__file__).parent.parent.parent
    
    # Load products
    products = load_products(repo_root)
    
    print(f"\n📄 Rendering {len(products)} product pages...\n")
    
    # Create output directory
    output_dir = repo_root / 'docs' / 'catalog' / 'pages'
    os.makedirs(output_dir, exist_ok=True)
    
    # Render all pages
    manifest_entries = []
    page_number = 1
    
    for product in products:
        result = render_product_page(repo_root, product, page_number, output_dir)
        
        if result:
            manifest_entries.append(result)
            page_number += 1
    
    # Write manifest
    write_manifest(repo_root, manifest_entries)
    
    # Summary
    print(f"\n{'='*60}")
    print(f"✓ Batch rendering complete!")
    print(f"  Total products: {len(products)}")
    print(f"  Pages rendered: {len(manifest_entries)}")
    print(f"  Skipped (sold out): {len(products) - len(manifest_entries)}")
    print(f"{'='*60}\n")
    
    return len(manifest_entries)


if __name__ == '__main__':
    page_count = main()
    sys.exit(0)
