#!/bin/bash

# Script to convert SVG placeholders to JPG using ImageMagick
# Requires ImageMagick: brew install imagemagick (Mac) or apt-get install imagemagick (Linux)

echo "Converting SVG placeholders to JPG..."

cd "$(dirname "$0")/../public/images"

# Function to convert SVG to JPG
convert_svg() {
    local svg_file="$1"
    local jpg_file="${svg_file%.svg}.jpg"
    
    if [ -f "$svg_file" ]; then
        # Extract dimensions from SVG (basic extraction)
        width=$(grep -oP 'width="\K[0-9]+' "$svg_file" | head -1)
        height=$(grep -oP 'height="\K[0-9]+' "$svg_file" | head -1)
        
        if [ -n "$width" ] && [ -n "$height" ]; then
            magick "$svg_file" -resize "${width}x${height}" -background white -flatten -quality 85 "$jpg_file"
            echo "✓ Converted: $jpg_file"
        else
            echo "⚠ Could not extract dimensions from $svg_file"
        fi
    fi
}

# Convert all SVG files
find . -name "*.svg" -type f | while read -r svg_file; do
    convert_svg "$svg_file"
done

echo ""
echo "✅ Conversion complete!"
echo ""
echo "Note: If ImageMagick is not installed, you can:"
echo "1. Install it: brew install imagemagick (Mac) or apt-get install imagemagick (Linux)"
echo "2. Or manually convert SVGs using an image editor"
echo "3. Or use the AI image generation prompts in scripts/image-prompts.txt"
