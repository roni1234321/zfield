# Packaging Guide for Zephyr Device Manager

This directory contains scripts and configuration files to build installable packages for Windows and Linux.

## Overview

The packaging system creates:
- **Windows**: MSI installer using Inno Setup
- **Linux**: DEB package using fpm

Both packages install the application to standard system locations with proper desktop integration, icons, and Start Menu/Application Menu entries.

## Directory Structure

```
packaging/
├── README.md                    # This file
├── windows/
│   ├── zdm.iss                 # Inno Setup script
│   ├── convert_icon.py         # PNG to ICO converter
│   └── build_msi.bat           # Windows build script
└── linux/
    ├── zdm.desktop             # Desktop entry file
    ├── build_deb.sh            # Linux build script
    ├── install_fpm.sh          # fpm installation helper
    ├── postinstall.sh          # Post-installation script
    └── postremove.sh           # Post-removal script
```

## Windows MSI Installer

### Prerequisites

1. **Inno Setup 6.0+**: Download from https://jrsoftware.org/isinfo.php
2. **Python with Pillow**: `pip install Pillow`
3. **PyInstaller**: Already in requirements.txt

### Building

```batch
cd backend\packaging\windows
build_msi.bat
```

This will:
1. Build the PyInstaller executable (directory mode)
2. Convert logo.png to ICO format
3. Create the MSI installer with Inno Setup
4. Output to `backend/dist/installers/zdm-setup-0.1.0.exe`

### Installation Locations

- **Executable**: `C:\Program Files\Zephyr Device Manager\`
- **Start Menu**: Zephyr Device Manager group
- **Desktop**: Optional shortcut (user choice during install)

### Customization

Edit `zdm.iss` to customize:
- Application name and version
- Publisher information
- Installation directory
- License file
- Desktop icon options

## Linux DEB Package

### Prerequisites

1. **fpm**: Install using the provided script
2. **Python 3**: Already installed on most systems
3. **PyInstaller**: Already in requirements.txt

### Installing fpm

```bash
cd backend/packaging/linux
bash install_fpm.sh
```

This installs Ruby and fpm on Debian/Ubuntu, Fedora, CentOS, or Arch Linux.

### Building

```bash
cd backend/packaging/linux
bash build_deb.sh
```

This will:
1. Build the PyInstaller executable (directory mode)
2. Create proper Debian package structure
3. Copy files to appropriate locations
4. Generate the DEB package with fpm
5. Output to `backend/dist/installers/zdm_0.1.0_amd64.deb`

### Installation Locations

- **Executable**: `/opt/zdm/`
- **Symlink**: `/usr/bin/zdm`
- **Desktop file**: `/usr/share/applications/zdm.desktop`
- **Icon**: `/usr/share/icons/hicolor/256x256/apps/zdm.png`

### Installing the Package

```bash
sudo dpkg -i dist/installers/zdm_0.1.0_amd64.deb
sudo apt-get install -f  # Fix dependencies if needed
```

### Uninstalling

```bash
sudo apt remove zdm
```

### Customization

Edit `build_deb.sh` to customize:
- Package metadata (vendor, maintainer, description)
- Dependencies
- Installation paths

Edit `zdm.desktop` to customize:
- Application name and description
- Categories
- Keywords

## Version Management

Both build systems read the version from `backend/app/version.py`:

```python
VERSION = "0.1.0"
```

Update this file to change the version number for all packages.

## Icon Requirements

- **Source**: `frontend/logo.png`
- **Windows**: Automatically converted to ICO (multi-resolution)
- **Linux**: Used directly as PNG (256x256 recommended)

## Testing Packages

### Windows

1. Build the installer
2. Run the installer on a clean Windows machine
3. Verify Start Menu shortcut works
4. Launch the application
5. Test uninstaller

### Linux

1. Build the DEB package
2. Install on a clean Linux machine
3. Check application menu for the icon
4. Launch from menu
5. Test `zdm` command in terminal
6. Uninstall and verify cleanup

## Troubleshooting

### Windows

**Problem**: "Inno Setup not found"
- **Solution**: Install Inno Setup or update the path in `build_msi.bat`

**Problem**: "Icon conversion failed"
- **Solution**: Install Pillow: `pip install Pillow`

**Problem**: "PyInstaller build failed"
- **Solution**: Check that all dependencies are installed: `pip install -r requirements.txt`

### Linux

**Problem**: "fpm is not installed"
- **Solution**: Run `bash packaging/linux/install_fpm.sh`

**Problem**: "Permission denied"
- **Solution**: Make scripts executable: `chmod +x packaging/linux/*.sh`

**Problem**: "Dependency errors during installation"
- **Solution**: Run `sudo apt-get install -f` to fix dependencies

**Problem**: "Icon not showing in menu"
- **Solution**: Icon cache may need time to update, or run `gtk-update-icon-cache -f -t /usr/share/icons/hicolor`

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Build Packages

on: [push, release]

jobs:
  build-windows:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-python@v2
      - run: pip install -r backend/requirements.txt
      - run: pip install Pillow
      - run: choco install innosetup
      - run: cd backend/packaging/windows && build_msi.bat
      - uses: actions/upload-artifact@v2
        with:
          name: windows-installer
          path: backend/dist/installers/*.exe

  build-linux:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-python@v2
      - run: pip install -r backend/requirements.txt
      - run: sudo gem install fpm
      - run: cd backend/packaging/linux && bash build_deb.sh
      - uses: actions/upload-artifact@v2
        with:
          name: linux-package
          path: backend/dist/installers/*.deb
```

## Additional Package Formats

### AppImage (Linux)

For a portable Linux package without installation:
- Use `appimagetool` instead of fpm
- Creates a single executable file
- No installation required

### RPM (RedHat/Fedora)

To create RPM packages:
```bash
fpm -s dir -t rpm [same options as DEB build]
```

### Snap/Flatpak

For modern Linux package managers, create separate configuration files following their respective documentation.

## Support

For issues or questions about packaging:
1. Check this README
2. Review the build scripts for comments
3. Check the Inno Setup or fpm documentation
4. Open an issue on the project repository
