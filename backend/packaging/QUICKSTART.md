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
backend\dist\installers\zdm-setup-0.1.0.exe
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
backend/dist/installers/zdm_0.1.0_amd64.deb
```

### Install
```bash
sudo dpkg -i ../../dist/installers/zdm_0.1.0_amd64.deb
sudo apt-get install -f  # Fix dependencies if needed
```

### Uninstall
```bash
sudo apt remove zdm
```

---

## Regular PyInstaller Build (No Package)

### Linux/Mac
```bash
cd backend
bash build.sh
./dist/zdm/zdm
```

### Windows
```batch
cd backend
build.bat
dist\zdm\zdm.exe
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
- **Executable**: `C:\Program Files\Zephyr Device Manager\`
- **Start Menu**: Zephyr Device Manager
- **Desktop**: Optional shortcut

### Linux
- **Executable**: `/opt/zdm/`
- **CLI Command**: `zdm` (symlinked from `/usr/bin/zdm`)
- **Desktop File**: `/usr/share/applications/zdm.desktop`
- **Icon**: `/usr/share/icons/hicolor/256x256/apps/zdm.png`

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
