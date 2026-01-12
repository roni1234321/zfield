#!/bin/bash
# Build script for Linux DEB package
# Requires: fpm (run install_fpm.sh first)

set -e  # Exit on error

echo "========================================"
echo "Building ZField DEB Package"
echo "========================================"
echo

# Change to backend directory
cd "$(dirname "$0")/../.."

# Read version from version.py
VERSION=$(python3 -c "import sys; sys.path.insert(0, 'app'); from version import VERSION; print(VERSION)")
echo "Building version: $VERSION"
echo

# Step 1: Build the PyInstaller executable
echo "[1/5] Building PyInstaller executable..."
pyinstaller zfield_gui_linux.spec
echo

# Step 2: Create temporary package structure
echo "[2/5] Creating package structure..."
PKG_DIR="dist/zfield-package"
rm -rf "$PKG_DIR"
mkdir -p "$PKG_DIR/opt/zfield"
mkdir -p "$PKG_DIR/usr/share/applications"
mkdir -p "$PKG_DIR/usr/share/icons/hicolor/256x256/apps"
mkdir -p "$PKG_DIR/usr/bin"
echo

# Step 3: Copy files to package structure
echo "[3/5] Copying files..."
# Copy the entire PyInstaller dist directory
cp -r dist/zfield/* "$PKG_DIR/opt/zfield/"

# Copy desktop file
cp packaging/linux/zfield.desktop "$PKG_DIR/usr/share/applications/"

# Copy icon
cp ../frontend/logo.png "$PKG_DIR/usr/share/icons/hicolor/256x256/apps/zfield.png"

# Create symlink in /usr/bin
ln -sf /opt/zfield/zfield "$PKG_DIR/usr/bin/zfield"
echo

# Step 4: Create installers directory
echo "[4/5] Preparing output directory..."
mkdir -p dist/installers
echo

# Step 5: Build DEB package with fpm
echo "[5/5] Building DEB package with fpm..."

# Check if fpm is installed
if ! command -v fpm &> /dev/null; then
    echo "ERROR: fpm is not installed!"
    echo "Please run: bash packaging/linux/install_fpm.sh"
    exit 1
fi

fpm -s dir -t deb \
    -n zfield \
    -v "$VERSION" \
    --vendor "Your Organization" \
    --maintainer "your-email@example.com" \
    --description "Serial terminal and device manager for Zephyr RTOS development" \
    --url "https://github.com/yourusername/zfield" \
    --license "MIT" \
    --category "devel" \
    --architecture amd64 \
    --depends "libxcb-cursor0" \
    --depends "libxcb1" \
    --depends "libxcb-xinerama0" \
    --depends "libxcb-xkb1" \
    --depends "libxkbcommon0" \
    --depends "libxkbcommon-x11-0" \
    --depends "libxcb-render0" \
    --depends "libxcb-render-util0" \
    --depends "libxcb-shape0" \
    --depends "libxcb-sync1" \
    --depends "libxcb-xfixes0" \
    --depends "libxcb-xinput0" \
    --depends "libxcb-icccm4" \
    --depends "libxcb-image0" \
    --depends "libxcb-keysyms1" \
    --depends "libxcb-randr0" \
    --depends "libxcb-shm0" \
    --depends "libxcb-util1" \
    --deb-priority "optional" \
    --after-install packaging/linux/postinstall.sh \
    --after-remove packaging/linux/postremove.sh \
    -C "$PKG_DIR" \
    --package "dist/installers/zfield_${VERSION}_amd64.deb" \
    .

echo
echo "========================================"
echo "Build Complete!"
echo "========================================"
echo "Package location: dist/installers/zfield_${VERSION}_amd64.deb"
echo
echo "To install:"
echo "  sudo dpkg -i dist/installers/zfield_${VERSION}_amd64.deb"
echo "  sudo apt-get install -f  # Fix dependencies if needed"
echo
