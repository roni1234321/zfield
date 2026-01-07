# Version Bumping Script

The `bump_version.py` script provides an easy and clean way to update the version number across all necessary files in the project.

## Usage

### Increment Version Automatically

```bash
# Increment patch version (0.1.7 -> 0.1.8)
python scripts/bump_version.py --patch

# Increment minor version (0.1.7 -> 0.2.0)
python scripts/bump_version.py --minor

# Increment major version (0.1.7 -> 1.0.0)
python scripts/bump_version.py --major
```

### Set Version Directly

```bash
# Set version to a specific value
python scripts/bump_version.py 0.2.0
```

## Files Updated

The script automatically updates the version in:

1. **`backend/app/version.py`** - Source of truth (VERSION constant)
2. **`backend/packaging/windows/zfield.iss`** - Inno Setup installer script
3. **`backend/packaging/linux/zfield.desktop`** - Linux desktop entry
4. **`pyproject.toml`** - Python project metadata

## Workflow

After running the script:

1. Review the changes: `git diff`
2. Commit the changes: `git commit -am 'bump version to X.Y.Z'`
3. Tag the release: `git tag vX.Y.Z`
4. Push: `git push && git push --tags`

## Example

```bash
# Bump patch version
python scripts/bump_version.py --patch

# Review changes
git diff

# Commit
git commit -am 'bump version to 0.1.8'

# Tag
git tag v0.1.8

# Push
git push && git push --tags
```

