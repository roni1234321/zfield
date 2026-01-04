# Windows Troubleshooting Guide

## Issue: "127.0.0.1 refused to connect" on Windows

### Symptoms
- Application window opens but shows connection refused error
- No content loads in the webview
- May see error message about port 48715

### Diagnosis Steps

#### 1. Check Console Output

The application now shows a console window with diagnostic information. Look for:

```
Starting server on port 48715...
Server is ready on port 48715
Starting GUI pointing to http://127.0.0.1:48715
```

If you see:
```
WARNING: Server did not start within 10 seconds!
ERROR: Server failed to start. Please check:
  1. Port 48715 is not blocked by firewall
  2. No other application is using port 48715
  3. Try running as administrator (Windows)
```

Then the server isn't starting properly.

#### 2. Common Causes & Solutions

##### A. Firewall Blocking Port 48715

**Solution:**
1. Open Windows Defender Firewall
2. Click "Advanced settings"
3. Click "Inbound Rules" → "New Rule"
4. Select "Port" → Next
5. Select "TCP" and enter port `48715`
6. Allow the connection
7. Apply to all profiles
8. Name it "Zephyr Device Manager"

##### B. Port Already in Use

**Check what's using the port:**
```cmd
netstat -ano | findstr :48715
```

If something is using it, either:
- Close that application
- Or change the port in `gui.py` (line 10): `FIXED_PORT = 48716`

##### C. Antivirus Blocking

Some antivirus software blocks local servers. Try:
1. Temporarily disable antivirus
2. Add exception for `zfield.exe`
3. Re-enable antivirus

##### D. Python/Uvicorn Issue

The server might be crashing. Check console for:
```
Server error: [error message]
Traceback...
```

Common fixes:
- Run as Administrator
- Reinstall dependencies
- Check Windows Event Viewer for errors

#### 3. Alternative: Use Random Port

If you can't use port 48715, you can disable the fixed port (but localStorage won't persist):

Edit `gui.py`:
```python
def main():
    # kill_previous_instance()  # Comment this out
    
    # Use random port instead
    port = find_free_port()  # Change from FIXED_PORT
    
    # ... rest of code ...
```

**Note:** With random ports, settings will NOT persist between launches.

### Testing on Windows

1. **Build on Windows:**
   ```cmd
   cd backend
   build.bat
   ```

2. **Run and check console:**
   ```cmd
   dist\zfield\zfield.exe
   ```

3. **Look for these messages:**
   - ✅ "Server is ready on port 48715"
   - ✅ "Starting GUI pointing to http://127.0.0.1:48715"
   - ❌ "WARNING: Server did not start"
   - ❌ "Server error:"

### Console Output Enabled

The console window will now show:
- Server startup messages
- Error messages
- Port conflicts
- PID management messages

**For production builds**, you can hide the console by changing in `zfield_gui.spec`:
```python
console=False  # Hide console window
```

But keep it enabled (`console=True`) for debugging.

### Still Not Working?

If none of the above helps, collect this information:

1. **Full console output** (copy everything from the console window)
2. **Windows version**: Run `winver`
3. **Firewall status**: Windows Defender on/off?
4. **Antivirus**: What antivirus software?
5. **Port check**: Output of `netstat -ano | findstr :48715`

With this information, we can diagnose the specific issue.

---

## Quick Fixes Summary

| Problem            | Quick Fix                             |
| ------------------ | ------------------------------------- |
| Firewall blocking  | Add firewall exception for port 48715 |
| Port in use        | Kill process or change port number    |
| Antivirus blocking | Add zfield.exe to exceptions             |
| No console output  | Already fixed - console=True          |
| Server won't start | Run as Administrator                  |
| Random errors      | Check Windows Event Viewer            |

---

## Production Deployment

Once everything works:

1. **Hide console** in `zfield_gui.spec`:
   ```python
   console=False
   ```

2. **Rebuild:**
   ```cmd
   build.bat
   ```

3. **Create installer:**
   ```cmd
   cd packaging\windows
   build_msi.bat
   ```

The MSI installer will handle firewall prompts automatically.
