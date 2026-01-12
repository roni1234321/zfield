# Linux Build Compatibility Guide

## Problem: GLIBC/libpython3.11.so Errors

If you see errors like:
```
failed to load python shared library libpython3.11.so.1.0 GLIBC_2.38 not found
```

This means the executable was built with Python 3.11+ but your target system only has Python 3.10 or an older GLIBC version.

## Solution: Build with Python 3.10

### Step 1: Verify Python Version

```bash
python3 --version
# Should show: Python 3.10.x
```

If you see Python 3.11 or higher, you need to use Python 3.10 specifically.

### Step 2: Use Python 3.10 for Building

```bash
# Check if python3.10 is available
python3.10 --version

# If not available, install it:
# Ubuntu/Debian:
sudo apt-get install python3.10 python3.10-venv python3.10-dev

# Create virtual environment with Python 3.10
python3.10 -m venv .venv
source .venv/bin/activate

# Verify you're using Python 3.10
python --version  # Should show Python 3.10.x
```

### Step 3: Install System Dependencies

```bash
# Install required system libraries for Qt xcb plugin
# Ubuntu/Debian:
sudo apt-get install libxcb-cursor0 libxcb1 libxcb-xinerama0 libxcb-xkb1 \
    libxkbcommon0 libxkbcommon-x11-0 libxcb-render0 libxcb-render-util0 \
    libxcb-shape0 libxcb-sync1 libxcb-xfixes0 libxcb-xinput0 \
    libxcb-icccm4 libxcb-image0 libxcb-keysyms1 libxcb-randr0 \
    libxcb-shm0 libxcb-util1
```

### Step 4: Install Python Dependencies

```bash
# Install project dependencies
pip install -e ".[linux]"

# Or install manually:
pip install pywebview[qt] fastapi uvicorn[standard] pyserial pydantic pydantic-settings pyinstaller psutil PyQt6 PyQt6-WebEngine
```

### Step 5: Build with Python 3.10

```bash
# The build script will automatically check Python version
./build.sh

# Or build manually:
pyinstaller zfield_gui_linux.spec
```

## Alternative: Check GLIBC Version

If you must build with a newer Python, ensure your build system's GLIBC matches or is older than the target:

```bash
# Check GLIBC version on build system
ldd --version

# Check GLIBC version on target system
ldd --version
```

The build system's GLIBC should be <= target system's GLIBC.

## Verification

After building, verify the executable doesn't include Python 3.11 libraries:

```bash
# Check bundled libraries
ldd dist/zfield/zfield | grep python

# Should show libpython3.10, NOT libpython3.11
```

## Running on Offline System

If you've already built with Python 3.11, you have two options:

1. **Rebuild with Python 3.10** (recommended)
   - Follow steps above on a system with Python 3.10
   - Transfer the built executable to your offline system

2. **Use Python directly** (no PyInstaller)
   ```bash
   # On offline system with Python 3.10:
   python3.10 -m venv .venv
   source .venv/bin/activate
   pip install -e ".[linux]"  # Install from source
   python -m backend.gui  # Run directly
   ```

## Notes

- The `zfield_gui_linux.spec` file now filters out Python 3.11+ libraries
- The build script checks Python version and warns if > 3.10
- Always build with Python 3.10 for maximum compatibility

