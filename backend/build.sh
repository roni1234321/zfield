#!/bin/bash
# Build script for Linux/Mac

echo "Building ZField executable..."

# Check Python version - must be 3.10 for compatibility
PYTHON_VERSION=$(python3 --version 2>&1 | awk '{print $2}' | cut -d. -f1,2)
PYTHON_MAJOR=$(echo $PYTHON_VERSION | cut -d. -f1)
PYTHON_MINOR=$(echo $PYTHON_VERSION | cut -d. -f2)

if [ "$PYTHON_MAJOR" -ne 3 ] || [ "$PYTHON_MINOR" -lt 10 ]; then
    echo "ERROR: Python 3.10 or higher is required. Found: Python $PYTHON_VERSION"
    exit 1
fi

if [ "$PYTHON_MINOR" -gt 10 ]; then
    echo "WARNING: Python $PYTHON_VERSION detected. Building with Python 3.10+ is recommended for compatibility."
    echo "         The build will use the current Python version, which may cause GLIBC compatibility issues."
    echo ""
fi

# Activate virtual environment if it exists
if [ -f .venv/bin/activate ]; then
    source .venv/bin/activate
fi

# Install PyInstaller if not already installed
pip install pyinstaller

# Clean previous builds
rm -rf build dist

# Determine which spec file to use based on platform
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    SPEC_FILE="zfield_gui_linux.spec"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    SPEC_FILE="zfield_gui.spec"
else
    SPEC_FILE="zfield_gui.spec"
fi

# Build the executable
echo "Using spec file: $SPEC_FILE"
pyinstaller "$SPEC_FILE"

echo ""
echo "Build complete! Executable is in dist/zfield/"
echo "Run with: ./dist/zfield/zfield"
echo ""
