# Quick Reference - Package Building

## Windows MSI Installer

### Prerequisites
```batch
# Install Inno Setup from: https://jrsoftware.org/isinfo.php
pip install Pillow
```

### Build
```batch
cd backend\packaging\windows
build_msi.bat
```

### Output
```
backend\dist\installers\zfield-setup-0.1.0.exe
```

---

## Linux DEB Package

### Prerequisites (one-time)
```bash
cd backend/packaging/linux
bash install_fpm.sh
```

### Build
```bash
cd backend/packaging/linux
bash build_deb.sh
```

### Output
```
backend/dist/installers/zfield_0.1.0_amd64.deb
```

### Install
```bash
sudo dpkg -i ../../dist/installers/zfield_0.1.0_amd64.deb
sudo apt-get install -f  # Fix dependencies if needed
```

### Uninstall
```bash
sudo apt remove zfield
```

---

## Regular PyInstaller Build (No Package)

### Linux/Mac
```bash
cd backend
bash build.sh
./dist/zfield/zfield
```

### Windows
```batch
cd backend
build.bat
dist\zfield\zfield.exe
```

---

## Version Update

Edit `backend/app/version.py`:
```python
VERSION = "0.2.0"  # Change this
```

This updates version for all packages automatically.

---

## File Locations After Installation

### Windows
- **Executable**: `C:\Program Files\ZField\`
- **Start Menu**: ZField
- **Desktop**: Optional shortcut

### Linux
- **Executable**: `/opt/zfield/`
- **CLI Command**: `zfield` (symlinked from `/usr/bin/zfield`)
- **Desktop File**: `/usr/share/applications/zfield.desktop`
- **Icon**: `/usr/share/icons/hicolor/256x256/apps/zfield.png`

---

## Troubleshooting

### Windows: "Inno Setup not found"
Update path in `build_msi.bat` or install from https://jrsoftware.org/isinfo.php

### Linux: "fpm is not installed"
Run: `bash packaging/linux/install_fpm.sh`

### Both: "PyInstaller build failed"
Check dependencies: `pip install -r requirements.txt`

---

For detailed documentation, see: `backend/packaging/README.md`
