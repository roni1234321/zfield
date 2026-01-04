#!/bin/bash
# Post-installation script for ZField DEB package

echo "Setting up ZField..."

# Update desktop database
if command -v update-desktop-database &> /dev/null; then
    update-desktop-database /usr/share/applications
fi

# Update icon cache
if command -v gtk-update-icon-cache &> /dev/null; then
    gtk-update-icon-cache -f -t /usr/share/icons/hicolor
fi

# Make sure the executable is executable
chmod +x /opt/zfield/zfield

echo "ZField installed successfully!"
echo "You can launch it from your application menu or run 'zfield' in terminal."
