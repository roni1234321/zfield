"""Version information for Zephyr Device Manager."""
import subprocess
import os

VERSION = "0.1.1"

def get_git_hash():
    """Get the current git hash if available."""
    try:
        # Get the directory of this file
        current_dir = os.path.dirname(os.path.abspath(__file__))
        # Go up to the root directory where .git is likely to be
        root_dir = os.path.dirname(os.path.dirname(current_dir))
        
        git_hash = subprocess.check_output(
            ['git', 'rev-parse', '--short', 'HEAD'],
            cwd=root_dir,
            stderr=subprocess.STDOUT
        ).decode('ascii').strip()
        return git_hash
    except (subprocess.CalledProcessError, FileNotFoundError, Exception):
        return None

def get_version_info():
    """Return a dictionary with version information."""
    git_hash = get_git_hash()
    info = {
        "version": VERSION,
        "git_hash": git_hash,
        "full_version": f"v{VERSION}" + (f"-{git_hash}" if git_hash else "")
    }
    return info
