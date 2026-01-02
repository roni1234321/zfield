#!/bin/bash
# Post-removal script for ZDM DEB package

echo "Cleaning up Zephyr Device Manager..."

# Update desktop database
if command -v update-desktop-database &> /dev/null; then
    update-desktop-database /usr/share/applications
fi

# Update icon cache
if command -v gtk-update-icon-cache &> /dev/null; then
    gtk-update-icon-cache -f -t /usr/share/icons/hicolor
fi

echo "Zephyr Device Manager removed."
