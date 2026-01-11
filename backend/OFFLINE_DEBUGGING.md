# Offline Debugging Guide

If the application shows a white screen on an offline machine, follow these steps:

## Quick Debugging Steps

### 1. Check Console Output

The executable now shows a console window with debug information. Look for:
- `[DEBUG]` messages showing frontend path resolution
- `[ERROR]` messages if files are missing
- Server startup messages

### 2. Open DevTools

Even if the page is white, you can open DevTools:
- **Press F12** - This should work even if the page doesn't load
- Check the **Console** tab for JavaScript errors
- Check the **Network** tab to see if files are loading

### 3. Check Server Status

The server should be running on `http://127.0.0.1:48715` (or another port). You can:
- Open a browser and navigate to `http://127.0.0.1:48715/health`
- This should return `{"status": "ok"}` if the server is running
- Try `http://127.0.0.1:48715/` to see if the frontend loads

### 4. Common Issues

#### Frontend Files Not Found
If you see `[ERROR] Frontend directory does not exist`, the frontend files weren't bundled correctly.

**Solution**: Check `zfield_gui_windows.spec` - ensure all frontend files are included in `frontend_datas`.

#### Server Not Starting
If the server fails to start, check:
- Port conflicts (another app using the same port)
- Firewall blocking localhost connections
- Missing dependencies

**Solution**: Check console output for specific error messages.

#### White Screen with No Errors
If the page is white but no errors appear:
1. Open DevTools (F12)
2. Check Console tab for JavaScript errors
3. Check Network tab - are CSS/JS files loading?
4. Try accessing `http://127.0.0.1:PORT/health` directly

## Building Debug Version

To build with console window visible:

1. Edit `backend/zfield_gui_windows.spec`
2. Set `console=True` in the EXE section (line 78)
3. Rebuild: `pyinstaller zfield_gui_windows.spec`

## Testing Offline

1. **Disconnect from internet** (or use airplane mode)
2. Run the executable
3. Check console output
4. Press F12 to open DevTools
5. Check for any network errors or missing files

## Log Files

If the console doesn't show enough info, check:
- Windows Event Viewer for application errors
- Check if a log file is created in the app directory

## Getting Help

If the issue persists:
1. Copy all console output
2. Screenshot DevTools Console and Network tabs
3. Note the exact error messages
4. Check if `http://127.0.0.1:PORT/health` works

