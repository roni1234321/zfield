# Linux System Dependencies

ZField requires certain system libraries to run on Linux, particularly for Qt's xcb platform plugin.

## Required Libraries

The following libraries are required for Qt xcb plugin to work:

### Core xcb Libraries
- `libxcb-cursor0` - XCB cursor support (required for Qt xcb plugin)
- `libxcb1` - XCB base library
- `libxcb-xinerama0` - XCB Xinerama extension
- `libxcb-xkb1` - XCB XKB extension
- `libxkbcommon0` - XKB common library
- `libxkbcommon-x11-0` - XKB X11 support

### Additional xcb Libraries
- `libxcb-render0` - XCB render extension
- `libxcb-render-util0` - XCB render utilities
- `libxcb-shape0` - XCB shape extension
- `libxcb-sync1` - XCB sync extension
- `libxcb-xfixes0` - XCB XFixes extension
- `libxcb-xinput0` - XCB XInput extension
- `libxcb-icccm4` - XCB ICCCM support
- `libxcb-image0` - XCB image support
- `libxcb-keysyms1` - XCB keysyms
- `libxcb-randr0` - XCB RandR extension
- `libxcb-shm0` - XCB shared memory
- `libxcb-util1` - XCB utilities

## Installation by Distribution

### Ubuntu/Debian
```bash
sudo apt-get update
sudo apt-get install libxcb-cursor0 libxcb1 libxcb-xinerama0 libxcb-xkb1 \
    libxkbcommon0 libxkbcommon-x11-0 libxcb-render0 libxcb-render-util0 \
    libxcb-shape0 libxcb-sync1 libxcb-xfixes0 libxcb-xinput0 \
    libxcb-icccm4 libxcb-image0 libxcb-keysyms1 libxcb-randr0 \
    libxcb-shm0 libxcb-util1
```

### Fedora/RHEL/CentOS
```bash
sudo dnf install libxcb libxcb-cursor libxcb-xinerama libxcb-xkb \
    libxkbcommon libxkbcommon-x11
```

### Arch Linux
```bash
sudo pacman -S libxcb libxcb-cursor
```

### openSUSE
```bash
sudo zypper install libxcb1 libxcb-cursor0 libxcb-xinerama0 libxcb-xkb1 \
    libxkbcommon0 libxkbcommon-x11-0
```

## Verification

After installation, verify the libraries are available:

```bash
# Check if libxcb-cursor0 is installed
ldconfig -p | grep libxcb-cursor

# Check all xcb libraries
ldconfig -p | grep libxcb
```

## Troubleshooting

### Error: "libxcb-cursor0 is needed to load the qt xcb plugin"

This means the system library is missing. Install it using the commands above for your distribution.

### Error: "Could not find the Qt platform plugin 'xcb'"

This can have two causes:
1. **Missing system libraries** - Install the xcb libraries listed above
2. **Qt plugins not bundled** - Rebuild with the updated spec file that includes Qt plugins

### Checking Missing Dependencies

To check what libraries are missing:

```bash
# For the executable
ldd dist/zfield/zfield | grep "not found"

# For Qt plugins
ldd dist/zfield/PyQt6/Qt6/plugins/platforms/libqxcb.so | grep "not found"
```

## Package Dependencies

If you're creating a DEB package, the `build_deb.sh` script already includes these dependencies. The package will automatically install them when installed via `dpkg` or `apt`.

