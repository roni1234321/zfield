#!/usr/bin/env python3
"""
Convert PNG logo to ICO format for Windows installer.
Requires Pillow: pip install Pillow
"""
import sys
import os
from pathlib import Path
from PIL import Image

# Set UTF-8 encoding for Windows console
if sys.platform == 'win32':
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')
    if hasattr(sys.stderr, 'reconfigure'):
        sys.stderr.reconfigure(encoding='utf-8')

def convert_png_to_ico(png_path, ico_path, sizes=None):
    """
    Convert PNG to ICO with multiple resolutions.
    
    Args:
        png_path: Path to input PNG file
        ico_path: Path to output ICO file
        sizes: List of sizes to include (default: [16, 32, 48, 64, 128, 256])
    """
    if sizes is None:
        sizes = [16, 32, 48, 64, 128, 256]
    
    # Open the PNG image
    img = Image.open(png_path)
    
    # Convert to RGBA if not already
    if img.mode != 'RGBA':
        img = img.convert('RGBA')
    
    # Create list of resized images
    icon_sizes = []
    for size in sizes:
        resized = img.resize((size, size), Image.Resampling.LANCZOS)
        icon_sizes.append(resized)
    
    # Save as ICO
    icon_sizes[0].save(
        ico_path,
        format='ICO',
        sizes=[(s, s) for s in sizes],
        append_images=icon_sizes[1:]
    )
    
    print(f"[OK] Created {ico_path} with sizes: {sizes}")

if __name__ == '__main__':
    # Get paths relative to this script
    script_dir = Path(__file__).parent
    backend_dir = script_dir.parent.parent
    
    png_path = backend_dir / '../frontend/logo.png'
    ico_path = script_dir / 'logo.ico'
    
    if not png_path.exists():
        print(f"Error: {png_path} not found!")
        sys.exit(1)
    
    convert_png_to_ico(png_path, ico_path)
    print(f"Icon ready for Inno Setup at: {ico_path}")
