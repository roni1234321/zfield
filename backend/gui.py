import webview
import threading
import time
import sys
import uvicorn
import socket
import os
import signal
import warnings
from pathlib import Path
from app.main import app

# Suppress pywebview recursion warnings on Windows
warnings.filterwarnings('ignore', category=RuntimeWarning)

# Windows API constants for rounded corners
if sys.platform == 'win32':
    import ctypes
    from ctypes import wintypes
    
    DWMWA_WINDOW_CORNER_PREFERENCE = 33
    DWMWCP_DEFAULT = 0
    DWMWCP_DONOTROUND = 1
    DWMWCP_ROUND = 2
    DWMWCP_ROUNDSMALL = 3
    
    try:
        dwmapi = ctypes.windll.dwmapi
    except:
        dwmapi = None
else:
    dwmapi = None

FIXED_PORT = 48715

def get_pid_file():
    """Get the path to the PID file."""
    home = Path.home()
    pid_dir = home / '.zfield'
    pid_dir.mkdir(parents=True, exist_ok=True)
    return pid_dir / 'zfield.pid'

def kill_previous_instance():
    """Kill any previous instance of the application."""
    pid_file = get_pid_file()
    
    if pid_file.exists():
        try:
            with open(pid_file, 'r') as f:
                old_pid = int(f.read().strip())
            
            # Check if process exists
            try:
                if sys.platform == 'win32':
                    # Windows: use taskkill
                    import subprocess
                    subprocess.run(['taskkill', '/F', '/PID', str(old_pid)], 
                                 capture_output=True, check=False)
                    print(f"Killed previous instance (PID: {old_pid})")
                else:
                    # Unix: use SIGTERM
                    os.kill(old_pid, signal.SIGTERM)
                    print(f"Killed previous instance (PID: {old_pid})")
                
                time.sleep(2)  # Wait longer for process to fully terminate
            except ProcessLookupError:
                # Process doesn't exist anymore
                pass
            except Exception as e:
                print(f"Warning: Could not kill previous instance: {e}")
        except (ValueError, FileNotFoundError) as e:
            print(f"Warning: Could not read PID file: {e}")
    
    # Write current PID
    try:
        with open(pid_file, 'w') as f:
            f.write(str(os.getpid()))
    except Exception as e:
        print(f"Warning: Could not write PID file: {e}")

def cleanup_pid_file():
    """Remove PID file on exit."""
    pid_file = get_pid_file()
    try:
        pid_file.unlink()
    except FileNotFoundError:
        pass

def start_server(port):
    """Start the FastAPI server in a background thread."""
    try:
        print(f"Starting server on port {port}...")
        print(f"Backend logs will be visible in the console")
        # Use info log level to see all requests and errors
        # uvicorn logs go to stdout, so they won't be filtered by FilteredStderr
        uvicorn.run(
            app, 
            host="127.0.0.1", 
            port=port, 
            log_level="info", 
            access_log=True,
            use_colors=True  # Enable colored output for better visibility
        )
    except Exception as e:
        print(f"ERROR: Server failed to start: {e}")
        import traceback
        traceback.print_exc()

def wait_for_server(port, timeout=10):
    """Wait for the server to be ready."""
    import time
    start_time = time.time()
    
    while time.time() - start_time < timeout:
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                s.settimeout(1)
                result = s.connect_ex(('127.0.0.1', port))
                if result == 0:
                    print(f"Server is ready on port {port}")
                    return True
        except Exception:
            pass
        time.sleep(0.5)
    
    print(f"WARNING: Server did not start within {timeout} seconds!")
    return False

def get_storage_path():
    """Get the persistent storage path for webview data."""
    home = Path.home()
    storage_dir = home / '.zfield' / 'storage'
    storage_dir.mkdir(parents=True, exist_ok=True)
    return str(storage_dir)


class WindowAPI:
    """API class to expose window control functions to JavaScript."""
    
    def __init__(self):
        self.window = None
    
    def set_window(self, window):
        """Set the window reference after window is created."""
        self.window = window
    
    def minimize(self):
        """Minimize the window."""
        if self.window:
            try:
                self.window.minimize()
            except Exception as e:
                print(f"Window minimize error: {e}")
    
    def maximize(self):
        """Maximize or restore the window (toggles)."""
        if self.window:
            try:
                # pywebview's maximize() should toggle between maximized and restored
                if hasattr(self.window, 'maximize'):
                    self.window.maximize()
                elif hasattr(self.window, 'toggle_fullscreen'):
                    self.window.toggle_fullscreen()
                # If there's a restore method, we might need to check state first
                # But pywebview's maximize() should handle toggling
            except Exception as e:
                print(f"Window maximize error: {e}")
    
    def restore(self):
        """Restore the window from maximized state."""
        if self.window:
            try:
                if hasattr(self.window, 'restore'):
                    self.window.restore()
                elif hasattr(self.window, 'maximize'):
                    # If maximize toggles, call it again to restore
                    # But this won't work if it's already restored
                    # Try to check if window is maximized first
                    try:
                        if hasattr(self.window, 'is_maximized') and self.window.is_maximized:
                            self.window.maximize()  # Toggle to restore
                    except:
                        # Fallback: just try maximize (which should toggle)
                        self.window.maximize()
            except Exception as e:
                print(f"Window restore error: {e}")
    
    def close(self):
        """Close the window."""
        if self.window:
            try:
                self.window.destroy()
            except Exception as e:
                print(f"Window close error: {e}")
    
    def get_window_size(self):
        """Get the current window size."""
        if self.window:
            try:
                # Try to get size without triggering introspection
                # Direct attribute access is safer than hasattr() which can trigger introspection
                try:
                    width = getattr(self.window, 'width', None)
                    height = getattr(self.window, 'height', None)
                    if width is not None and height is not None:
                        return {"width": width, "height": height}
                except (AttributeError, RecursionError):
                    pass
                # Fallback
                return {"width": 1200, "height": 800}
            except Exception:
                # Silently fail to avoid triggering more introspection
                pass
        return {"width": 1200, "height": 800}
    
    def get_window_position(self):
        """Get the current window position."""
        if self.window:
            try:
                # Try to get position without triggering introspection
                try:
                    x = getattr(self.window, 'x', None)
                    y = getattr(self.window, 'y', None)
                    if x is not None and y is not None:
                        return {"x": x, "y": y}
                except (AttributeError, RecursionError):
                    pass
                # Fallback
                return {"x": 100, "y": 100}
            except Exception:
                # Silently fail to avoid triggering more introspection
                pass
        return {"x": 100, "y": 100}
    
    def resize_window(self, width, height, x=None, y=None):
        """Resize and optionally reposition the window."""
        if self.window:
            try:
                # pywebview window object should have resize and move methods
                # Try resize first
                if hasattr(self.window, 'resize'):
                    self.window.resize(width, height)
                elif hasattr(self.window, 'width') and hasattr(self.window, 'height'):
                    # Try setting properties directly (may not work but worth trying)
                    try:
                        self.window.width = width
                        self.window.height = height
                    except:
                        pass
                
                # Reposition window if coordinates provided
                if x is not None and y is not None:
                    if hasattr(self.window, 'move'):
                        self.window.move(x, y)
                    elif hasattr(self.window, 'x') and hasattr(self.window, 'y'):
                        try:
                            self.window.x = x
                            self.window.y = y
                        except:
                            pass
                
                # Reapply glass effect and rounded corners after resize/snap (Windows may lose it)
                if sys.platform == 'win32' and hasattr(self, 'apply_rounded_corners'):
                    def reapply_effects():
                        time.sleep(0.1)
                        if self.window and hasattr(self.window, 'native') and self.window.native:
                            try:
                                self.apply_rounded_corners(self.window.native)
                            except:
                                pass
                    threading.Timer(0.1, reapply_effects).start()
            except Exception as e:
                # Don't print errors for resize operations during drag
                pass

def main():
    # Kill any previous instance
    kill_previous_instance()
    
    # Use fixed port
    port = FIXED_PORT
    
    # Start the server thread
    server_thread = threading.Thread(target=start_server, args=(port,), daemon=True)
    server_thread.start()

    # Wait for server to be ready
    if not wait_for_server(port, timeout=10):
        print("ERROR: Server failed to start. Please check:")
        print(f"  1. Port {port} is not blocked by firewall")
        print(f"  2. No other application is using port {port}")
        print("  3. Try running as administrator (Windows)")
        return

    # Create a pywebview window with persistent storage
    url = f'http://127.0.0.1:{port}'
    print(f"Starting GUI pointing to {url}")
    print(f"Server should be running on {url}")
    
    # Get persistent storage path
    storage_path = get_storage_path()
    print(f"Using storage path: {storage_path}")
    
    # Create window API that will be exposed to JavaScript
    window_api = WindowAPI()
    
    # Ensure webview module is accessible in this scope (fix for PyInstaller)
    # Re-import to ensure it's available even if there are import issues
    import webview as _webview_module
    # Use the imported module explicitly to avoid scoping issues
    webview_module = _webview_module
    
    # Create window with minimal delay - don't wait for full initialization
    # Enable debug mode to allow DevTools access even if page doesn't load
    window = webview_module.create_window(
        'ZField',
        url,
        width=1200,
        height=800,
        min_size=(800, 600),
        frameless=True,  # Hide native title bar for custom title bar
        easy_drag=True,  # Enable dragging
        js_api=window_api,  # Expose Python functions directly to JavaScript
        shadow=False  # Disable shadow for faster rendering on Windows
    )

    # Set window reference in API after window is created
    window_api.set_window(window)
    
    # Store window in app state for API access (for HTTP endpoints if needed)
    app.state.window = window
    
    # Apply native Windows Mica/Acrylic effect and rounded corners
    def apply_glass_effect():
        if sys.platform == 'win32':
            try:
                import pywinstyles
                # Wait a bit for window to be fully initialized
                time.sleep(0.3)
                # Get the native window handle - try multiple times if needed
                max_retries = 5
                for attempt in range(max_retries):
                    try:
                        if hasattr(window, 'native') and window.native:
                            native_win = window.native
                            print(f"Window native type: {type(native_win)}")
                            
                            # Try to apply rounded corners using pywinstyles if it supports it
                            try:
                                # Some versions of pywinstyles might support rounded corners
                                if hasattr(pywinstyles, 'apply_rounded_corners'):
                                    pywinstyles.apply_rounded_corners(native_win)
                                    print("Applied rounded corners via pywinstyles")
                                else:
                                    # Use our custom function
                                    result = apply_rounded_corners(native_win)
                                    if not result:
                                        print("Warning: Rounded corners application returned False")
                            except Exception as e:
                                print(f"Exception applying rounded corners: {e}")
                                import traceback
                                traceback.print_exc()
                            
                            # Try Mica first (Windows 11), fallback to Acrylic (Windows 10)
                            try:
                                pywinstyles.apply_style(native_win, 'mica')
                                print("Applied Windows 11 Mica effect")
                                return True
                            except:
                                # Fallback to Acrylic for Windows 10
                                pywinstyles.apply_style(native_win, 'acrylic')
                                print("Applied Windows 10 Acrylic effect")
                                return True
                        else:
                            # Wait a bit more for native handle to be available
                            time.sleep(0.2)
                    except Exception as e:
                        if attempt < max_retries - 1:
                            time.sleep(0.2)
                            continue
                        print(f"Could not apply Windows glass effect: {e}")
                        print("Note: Install pywinstyles with: pip install pywinstyles")
                        return False
                return False
            except ImportError:
                print("pywinstyles not installed. Install with: pip install pywinstyles")
                print("Skipping native Windows glass effect.")
                # Still try to apply rounded corners even without pywinstyles
                try:
                    if hasattr(window, 'native') and window.native:
                        apply_rounded_corners(window.native)
                except:
                    pass
                return False
            except Exception as e:
                print(f"Error applying Windows glass effect: {e}")
                return False
        return False
    
    def apply_rounded_corners(native_window):
        """Apply rounded corners to the window using Windows DWM API."""
        if sys.platform == 'win32' and dwmapi:
            try:
                # Get window handle - pywebview on Windows uses Windows Forms
                # The native window is a System.Windows.Forms.Form
                hwnd = None
                
                # Try multiple methods to get the HWND
                try:
                    if hasattr(native_window, 'Handle'):
                        hwnd = native_window.Handle
                    elif hasattr(native_window, 'handle'):
                        hwnd = native_window.handle
                    elif hasattr(native_window, 'hwnd'):
                        hwnd = native_window.hwnd
                except:
                    pass
                
                # If still no handle, try converting .NET IntPtr
                if not hwnd:
                    try:
                        # Try as integer property with .NET IntPtr methods
                        hwnd_val = getattr(native_window, 'Handle', None)
                        if hwnd_val:
                            if hasattr(hwnd_val, 'ToInt32'):
                                hwnd = hwnd_val.ToInt32()
                            elif hasattr(hwnd_val, 'ToInt64'):
                                hwnd = int(hwnd_val.ToInt64())
                            elif hasattr(hwnd_val, '__int__'):
                                hwnd = int(hwnd_val)
                            else:
                                try:
                                    hwnd = int(hwnd_val)
                                except:
                                    pass
                    except:
                        pass
                
                if hwnd:
                    # Convert to int if it's not already
                    if not isinstance(hwnd, int):
                        try:
                            hwnd = int(hwnd)
                        except:
                            try:
                                hwnd = int(str(hwnd))
                            except:
                                hwnd = None
                    
                    if hwnd and hwnd != 0:
                        # Use DWORD (unsigned 32-bit integer) for the preference
                        preference = wintypes.DWORD(DWMWCP_ROUND)
                        hwnd_ptr = wintypes.HWND(hwnd)
                        
                        result = dwmapi.DwmSetWindowAttribute(
                            hwnd_ptr,
                            DWMWA_WINDOW_CORNER_PREFERENCE,
                            ctypes.byref(preference),
                            ctypes.sizeof(preference)
                        )
                        
                        if result == 0:  # S_OK
                            print(f"Successfully applied rounded corners (HWND: {hwnd})")
                            return True
                        else:
                            # Get error message
                            error_msg = f"DWM error code: 0x{result:08X}"
                            if result == 0x80070057:  # E_INVALIDARG
                                error_msg += " (Invalid argument)"
                            elif result == 0x80004005:  # E_FAIL
                                error_msg += " (Operation failed)"
                            print(f"Failed to apply rounded corners, {error_msg}")
                    else:
                        print(f"Could not get valid window handle. HWND: {hwnd}")
                        # Try alternative: use FindWindow to get HWND by title
                        try:
                            user32 = ctypes.windll.user32
                            hwnd = user32.FindWindowW(None, "ZField")
                            if hwnd and hwnd != 0:
                                print(f"Found window by title, HWND: {hwnd}")
                                preference = wintypes.DWORD(DWMWCP_ROUND)
                                hwnd_ptr = wintypes.HWND(hwnd)
                                result = dwmapi.DwmSetWindowAttribute(
                                    hwnd_ptr,
                                    DWMWA_WINDOW_CORNER_PREFERENCE,
                                    ctypes.byref(preference),
                                    ctypes.sizeof(preference)
                                )
                                if result == 0:
                                    print(f"Successfully applied rounded corners via FindWindow (HWND: {hwnd})")
                                    return True
                        except Exception as e2:
                            print(f"FindWindow fallback also failed: {e2}")
            except Exception as e:
                print(f"Error applying rounded corners: {e}")
                import traceback
                traceback.print_exc()
        else:
            if sys.platform != 'win32':
                print("Rounded corners only supported on Windows")
            elif not dwmapi:
                print("DWM API not available")
        return False
    
    # Store the apply function for reuse (make it accessible)
    window_api.apply_glass_effect = apply_glass_effect
    # Also store apply_rounded_corners for reuse
    window_api.apply_rounded_corners = apply_rounded_corners
    
    # Schedule glass effect to be applied after window starts
    threading.Timer(0.5, apply_glass_effect).start()
    
    print("Window created, starting webview...")

    try:
        # Start the webview loop with persistent storage
        # private_mode=False is REQUIRED for localStorage to persist
        # Suppress recursion errors and thread access errors from Windows WebView2
        if sys.platform == 'win32':
            # Check WebView2 runtime before starting
            print("Checking WebView2 runtime...")
            try:
                # Try to import webview.platforms.edgechromium to check if it can initialize
                # Use a different variable name to avoid shadowing the global webview module
                import webview.platforms.edgechromium as _edgechromium
                print("WebView2 platform available")
            except Exception as e:
                print(f"WARNING: WebView2 platform check failed: {e}")
                print("This may cause initialization issues.")
                print("Please ensure Microsoft Edge WebView2 Runtime is installed:")
                print("https://developer.microsoft.com/en-us/microsoft-edge/webview2/")
            
            # Redirect stderr temporarily to suppress pywebview warnings
            # Use a more efficient filtering approach
            original_stderr = sys.stderr
            class FilteredStderr:
                def __init__(self, original):
                    self.original = original
                
                def write(self, text):
                    # Only filter pywebview-specific errors, not backend logs
                    # Backend logs (uvicorn/FastAPI) should always pass through
                    
                    # Fast filtering: check for pywebview error prefix first
                    if '[pywebview]' in text:
                        # Check if it's a harmless recursion/accessibility error
                        if 'recursion depth' in text.lower():
                            return
                        # Filter COM interface casting errors that are harmless
                        if 'unable to cast' in text.lower() and 'com object' in text.lower():
                            # Only filter if it's the common accessibility/COM errors
                            if 'accessibilityobject' in text.lower() or 'corewebview2' in text.lower():
                                return
                        if 'accessibilityobject' in text.lower() and 'bounds' in text.lower():
                            return
                        if 'corewebview2' in text.lower() and ('invalidcast' in text.lower() or 'no such interface' in text.lower()):
                            return
                        if '__abstractmethods__' in text:
                            return
                        # Let other pywebview errors through (they might be important)
                        # Especially initialization failures
                    
                    # Always pass through backend logs (uvicorn, FastAPI, etc.)
                    # These typically don't have [pywebview] prefix
                    self.original.write(text)
                
                def flush(self):
                    self.original.flush()
            
            sys.stderr = FilteredStderr(original_stderr)
            try:
                print("Starting WebView2...")
                print("If you see 'WebView2 initialization failed', try:")
                print("  1. Install/update Microsoft Edge WebView2 Runtime")
                print("  2. Run Windows Update")
                print("  3. Repair WebView2 Runtime from Add/Remove Programs")
                webview_module.start(storage_path=storage_path, private_mode=False, debug=True)
            except Exception as e:
                # Restore stderr before showing error
                sys.stderr = original_stderr
                error_msg = str(e)
                print(f"\n{'='*60}")
                print("ERROR: WebView2 initialization failed!")
                print(f"{'='*60}")
                print(f"Error: {error_msg}")
                print("\nTroubleshooting steps:")
                print("1. Install/Update Microsoft Edge WebView2 Runtime:")
                print("   https://developer.microsoft.com/en-us/microsoft-edge/webview2/")
                print("2. Run Windows Update to get latest patches")
                print("3. Repair WebView2 Runtime:")
                print("   - Open Settings > Apps > Installed apps")
                print("   - Find 'Microsoft Edge WebView2 Runtime'")
                print("   - Click three dots > Modify > Repair")
                print("4. Run System File Checker (as Administrator):")
                print("   sfc /scannow")
                print(f"{'='*60}\n")
                raise
            finally:
                sys.stderr = original_stderr
        else:
            webview_module.start(storage_path=storage_path, private_mode=False, debug=True)
    finally:
        # Cleanup on exit
        cleanup_pid_file()

if __name__ == '__main__':
    main()
