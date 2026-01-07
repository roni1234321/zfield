#!/usr/bin/env python3
"""
Version bumping script for ZField.

This script updates the version number in all necessary files:
- backend/app/version.py (source of truth)
- backend/packaging/windows/zfield.iss
- backend/packaging/linux/zfield.desktop
- pyproject.toml

Usage:
    python scripts/bump_version.py 0.1.8
    python scripts/bump_version.py --patch  (increments patch: 0.1.7 -> 0.1.8)
    python scripts/bump_version.py --minor   (increments minor: 0.1.7 -> 0.2.0)
    python scripts/bump_version.py --major   (increments major: 0.1.7 -> 1.0.0)
"""

import re
import sys
from pathlib import Path

# Get project root (parent of scripts directory)
PROJECT_ROOT = Path(__file__).parent.parent
VERSION_FILE = PROJECT_ROOT / "backend" / "app" / "version.py"
ISS_FILE = PROJECT_ROOT / "backend" / "packaging" / "windows" / "zfield.iss"
DESKTOP_FILE = PROJECT_ROOT / "backend" / "packaging" / "linux" / "zfield.desktop"
PYPROJECT_FILE = PROJECT_ROOT / "pyproject.toml"


def get_current_version():
    """Read current version from version.py."""
    content = VERSION_FILE.read_text()
    match = re.search(r'VERSION\s*=\s*"([^"]+)"', content)
    if match:
        return match.group(1)
    raise ValueError(f"Could not find VERSION in {VERSION_FILE}")


def parse_version(version_str):
    """Parse version string into major, minor, patch."""
    parts = version_str.split('.')
    if len(parts) != 3:
        raise ValueError(f"Invalid version format: {version_str}. Expected X.Y.Z")
    return tuple(int(p) for p in parts)


def format_version(major, minor, patch):
    """Format version tuple into string."""
    return f"{major}.{minor}.{patch}"


def increment_version(version_str, bump_type):
    """Increment version based on bump type."""
    major, minor, patch = parse_version(version_str)
    
    if bump_type == 'major':
        return format_version(major + 1, 0, 0)
    elif bump_type == 'minor':
        return format_version(major, minor + 1, 0)
    elif bump_type == 'patch':
        return format_version(major, minor, patch + 1)
    else:
        raise ValueError(f"Unknown bump type: {bump_type}")


def update_version_file(new_version):
    """Update backend/app/version.py."""
    content = VERSION_FILE.read_text(encoding='utf-8')
    content = re.sub(
        r'VERSION\s*=\s*"[^"]+"',
        f'VERSION = "{new_version}"',
        content
    )
    VERSION_FILE.write_text(content, encoding='utf-8')
    print(f"[OK] Updated {VERSION_FILE.relative_to(PROJECT_ROOT)}")


def update_iss_file(new_version):
    """Update backend/packaging/windows/zfield.iss."""
    content = ISS_FILE.read_text(encoding='utf-8')
    content = re.sub(
        r'#define MyAppVersion\s+"[^"]+"',
        f'#define MyAppVersion "{new_version}"',
        content
    )
    ISS_FILE.write_text(content, encoding='utf-8')
    print(f"[OK] Updated {ISS_FILE.relative_to(PROJECT_ROOT)}")


def update_desktop_file(new_version):
    """Update backend/packaging/linux/zfield.desktop."""
    content = DESKTOP_FILE.read_text(encoding='utf-8')
    content = re.sub(
        r'Version=[^\n]+',
        f'Version={new_version}',
        content
    )
    DESKTOP_FILE.write_text(content, encoding='utf-8')
    print(f"[OK] Updated {DESKTOP_FILE.relative_to(PROJECT_ROOT)}")


def update_pyproject_file(new_version):
    """Update pyproject.toml."""
    content = PYPROJECT_FILE.read_text(encoding='utf-8')
    content = re.sub(
        r'version\s*=\s*"[^"]+"',
        f'version = "{new_version}"',
        content
    )
    PYPROJECT_FILE.write_text(content, encoding='utf-8')
    print(f"[OK] Updated {PYPROJECT_FILE.relative_to(PROJECT_ROOT)}")


def main():
    """Main function."""
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    
    arg = sys.argv[1]
    
    # Determine new version
    if arg == '--patch':
        current_version = get_current_version()
        new_version = increment_version(current_version, 'patch')
        print(f"Bumping patch version: {current_version} -> {new_version}")
    elif arg == '--minor':
        current_version = get_current_version()
        new_version = increment_version(current_version, 'minor')
        print(f"Bumping minor version: {current_version} -> {new_version}")
    elif arg == '--major':
        current_version = get_current_version()
        new_version = increment_version(current_version, 'major')
        print(f"Bumping major version: {current_version} -> {new_version}")
    else:
        # Direct version specified
        new_version = arg
        # Validate version format
        try:
            parse_version(new_version)
        except ValueError as e:
            print(f"Error: {e}")
            sys.exit(1)
        current_version = get_current_version()
        print(f"Updating version: {current_version} -> {new_version}")
    
    # Update all files
    print(f"\nUpdating version to {new_version}...")
    update_version_file(new_version)
    update_iss_file(new_version)
    update_desktop_file(new_version)
    update_pyproject_file(new_version)
    
    print(f"\n[OK] Version updated to {new_version} in all files!")
    print(f"\nNext steps:")
    print(f"  1. Review the changes: git diff")
    print(f"  2. Commit: git commit -am 'bump version to {new_version}'")


if __name__ == '__main__':
    main()

