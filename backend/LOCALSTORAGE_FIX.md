# localStorage Persistence - Complete Fix

## The Problem

Settings were not persisting between application launches when built with PyInstaller.

## Root Causes (Both Fixed)

### Issue 1: Private Mode (FIXED)
PyWebView runs in private mode by default, which doesn't persist localStorage.

**Solution:** Set `private_mode=False` in `webview.start()`

### Issue 2: Random Port = Different Origin (FIXED) ⚠️ **CRITICAL**
Each launch used a different port (e.g., `http://127.0.0.1:46185`, then `http://127.0.0.1:45203`).

**localStorage is origin-specific** (protocol + host + **port**), so each different port created a **separate storage context**!

**Solution:** Use a **fixed port** (`48715`) for all launches.

## Complete Solution

```python
def get_fixed_port():
    """Get a fixed port for the application, or find a free one if it's taken."""
    preferred_port = 48715  # Fixed port for consistent localStorage origin
    
    # Check if preferred port is available
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.bind(('127.0.0.1', preferred_port))
            return preferred_port
    except OSError:
        # Port is in use, find a free one
        print(f"Warning: Preferred port {preferred_port} is in use, using random port")
        return find_free_port()

def main():
    port = get_fixed_port()  # Use fixed port instead of random
    
    # ... existing code ...
    
    storage_path = get_storage_path()
    
    # BOTH parameters are required!
    webview.start(
        storage_path=storage_path,
        private_mode=False  # CRITICAL: Must be False for persistence
    )
```

## Why This Works

1. **Fixed Port**: Same origin (`http://127.0.0.1:48715`) every launch
2. **Same Origin**: localStorage data is accessible across launches
3. **Private Mode Off**: Data actually persists to disk
4. **Storage Path**: Data stored in `~/.zfield/storage/`

## Testing

1. **Clear old storage** (optional, to start fresh):
   ```bash
   rm -rf ~/.zfield/storage/
   ```

2. **Run the app:**
   ```bash
   ./dist/zfield/zfield
   ```
   
   You should see:
   ```
   Starting GUI pointing to http://127.0.0.1:48715
   Using storage path: /home/yonat/.zfield/storage
   ```

3. **Close welcome modal** (first launch only)

4. **Make changes:**
   - Toggle theme to light
   - Scan for commands
   - Create a custom command

5. **Close the app completely**

6. **Run again:**
   ```bash
   ./dist/zfield/zfield
   ```

7. **Verify:**
   - ✅ Welcome modal should NOT appear
   - ✅ Theme should still be light
   - ✅ Commands should be cached
   - ✅ Custom commands should be present
   - ✅ Port should be `48715` again

## Port Conflict Handling

If port `48715` is already in use:
- App will print a warning
- Falls back to random port
- localStorage won't persist in this case (expected behavior)
- User should close the other app using port `48715`

## Storage Location

- **Linux**: `~/.zfield/storage/`
- **Windows**: `C:\Users\<username>\.zfield\storage\`
- **macOS**: `/Users/<username>/.zfield/storage/`

## What Gets Persisted

All localStorage data:
- ✅ Theme (`zfield_theme`)
- ✅ Commands cache (`zephyr_commands_cache`)
- ✅ Custom commands (`zfield_custom_commands`)
- ✅ Repeat commands (`zfield_repeat_commands`)
- ✅ Response sequences (`zephyr_sequences`)
- ✅ Counters (`zfield_counters`)
- ✅ Sidebar width (`zfield_sidebar_width`)
- ✅ Active view (`zfield_active_view`)
- ✅ Icon order (`zfield_icon_order`)
- ✅ Log settings
- ✅ Manual port
- ✅ Session state
- ✅ Welcome modal state (`zfield_welcome_shown`)

## Verification

Check if data is being stored:
```bash
ls -la ~/.zfield/storage/Local\ Storage/leveldb/
strings ~/.zfield/storage/Local\ Storage/leveldb/*.log | grep zfield
```

You should see your settings like:
```
zfield_theme
dark
zfield_welcome_shown
true
```

## Important Notes

- **Port must be consistent** for localStorage to work
- **Private mode must be False** for persistence
- **Storage path** must be set for data location
- All three are required for proper persistence!
