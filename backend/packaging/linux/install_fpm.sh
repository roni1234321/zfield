#!/bin/bash
# Install fpm (Effing Package Management) and dependencies

echo "Installing fpm and dependencies..."
echo

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
    echo "Please run this script as a normal user (not root)"
    exit 1
fi

# Detect package manager and install Ruby
if command -v apt-get &> /dev/null; then
    echo "Detected Debian/Ubuntu system"
    sudo apt-get update
    sudo apt-get install -y ruby ruby-dev rubygems build-essential
elif command -v dnf &> /dev/null; then
    echo "Detected Fedora/RHEL system"
    sudo dnf install -y ruby ruby-devel rubygems gcc make rpm-build
elif command -v yum &> /dev/null; then
    echo "Detected CentOS/RHEL system"
    sudo yum install -y ruby ruby-devel rubygems gcc make rpm-build
elif command -v pacman &> /dev/null; then
    echo "Detected Arch Linux system"
    sudo pacman -S --noconfirm ruby base-devel
else
    echo "Unsupported package manager. Please install Ruby manually."
    exit 1
fi

# Install fpm gem
echo
echo "Installing fpm gem..."
sudo gem install fpm

# Verify installation
if command -v fpm &> /dev/null; then
    echo
    echo "✓ fpm installed successfully!"
    fpm --version
else
    echo
    echo "✗ fpm installation failed!"
    exit 1
fi
