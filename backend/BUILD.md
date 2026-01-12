# Building ZField Executable

This guide explains how to build ZField into a standalone executable using PyInstaller.

## Prerequisites

- Python 3.10+
- Virtual environment with dependencies installed
- PyInstaller (will be installed automatically by build script)

## Build Instructions

### Windows

```bash
cd backend
build.bat
```

### Linux/Mac

```bash
cd backend
chmod +x build.sh
./build.sh
```

## Output

The executable will be created in `backend/dist/`:
- **Windows**: `dist/zfield.exe`
- **Linux/Mac**: `dist/zfield`

## Running the Executable

Simply run the executable:

```bash
# Windows
dist\zfield.exe

# Linux/Mac
./dist/zfield
```

The application will:
1. Start the FastAPI server on `http://localhost:8000`
2. Serve the web interface
3. Open your browser to access the terminal

## What's Included

The executable bundles:
- Python runtime
- FastAPI and Uvicorn
- PySerial for serial communication
- All backend code
- Frontend files (HTML, JS, CSS)
- All dependencies

## Troubleshooting

### GLIBC or libpython3.11.so errors on Linux

**Error:** `failed to load python shared library libpython3.11.so.1.0 GLIBC_2.38 not found`

**Cause:** The executable was built with Python 3.11+ but your system only has Python 3.10 or an older GLIBC.

**Solution:**
1. **Build with Python 3.10:**
   ```bash
   # Ensure you're using Python 3.10
   python3.10 --version
   
   # Create a virtual environment with Python 3.10
   python3.10 -m venv .venv
   source .venv/bin/activate
   
   # Install dependencies and build
   pip install -e ".[linux]"
   ./build.sh
   ```

2. **Check your Python version before building:**
   ```bash
   python3 --version  # Should show Python 3.10.x
   ```

3. **If you must use a newer Python, ensure GLIBC compatibility:**
   - Build on a system with the same or older GLIBC version as your target
   - Or use a container/Docker with the target GLIBC version

### Build fails with missing modules

Add the missing module to `hiddenimports` in `zfield_gui_linux.spec`:

```python
hiddenimports=[
    'your.missing.module',
    # ... existing imports
]
```

### Frontend files not found

Ensure the frontend path in `zfield_gui_linux.spec` is correct relative to the spec file location.

### Serial port access issues

On Linux, you may need to add your user to the `dialout` group:

```bash
sudo usermod -a -G dialout $USER
```

Then log out and back in.

## Customization

Edit `zfield_gui.spec` to customize:
- Executable name
- Icon (add `icon='path/to/icon.ico'` in EXE section)
- Console window (set `console=False` for GUI mode)
- UPX compression (set `upx=False` to disable)

## File Size

The executable will be approximately 40-60 MB due to bundled Python runtime and dependencies.
