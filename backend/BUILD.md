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

### "No module named gi" error on Linux

**Error:** `ModuleNotFoundError: No module named 'gi'`

**Cause:** PyInstaller is trying to bundle GTK libraries, but the project uses Qt, not GTK.

**Solution:** The spec file already excludes GTK/gi modules. If you still see this error:

1. **Rebuild with the updated spec file:**
   ```bash
   ./build.sh
   ```

2. **Ensure Qt is properly installed:**
   ```bash
   pip install PyQt6 PyQt6-WebEngine
   ```

3. **Verify pywebview uses Qt:**
   The code now explicitly forces Qt backend on Linux. Check the console output for "Using Qt backend for pywebview on Linux".

### "No Qt platform plugin could be initialized" error on Linux

**Error:** `qt.qpa.plugin: Could not find the Qt platform plugin "xcb"`

**Cause:** PyInstaller doesn't automatically bundle Qt platform plugins (xcb, wayland, etc.) which are required for Qt to work on Linux.

**Solution:** The spec file now automatically includes Qt platform plugins. If you still see this error:

1. **Rebuild with the updated spec file:**
   ```bash
   ./build.sh
   ```

2. **Verify Qt plugins are bundled:**
   Check the build output for messages like "Found Qt plugins at:" and "Adding X Qt plugin directories"

3. **Check the bundled plugins:**
   ```bash
   ls -la dist/zfield/PyQt6/Qt6/plugins/platforms/
   # Should show libqxcb.so and other platform plugins
   ```

4. **Install required system libraries for Qt xcb plugin:**
   ```bash
   # On Ubuntu/Debian:
   sudo apt-get install libxcb-cursor0 libxcb1 libxcb-xinerama0 libxcb-xkb1 \
       libxkbcommon0 libxkbcommon-x11-0 libxcb-render0 libxcb-render-util0 \
       libxcb-shape0 libxcb-sync1 libxcb-xfixes0 libxcb-xinput0 \
       libxcb-icccm4 libxcb-image0 libxcb-keysyms1 libxcb-randr0 \
       libxcb-shm0 libxcb-util1
   ```

5. **If plugins are missing, install PyQt6 system-wide:**
   ```bash
   # On Ubuntu/Debian:
   sudo apt-get install python3-pyqt6 python3-pyqt6-webengine
   
   # Then rebuild
   ./build.sh
   ```

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
