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
        js_api=window_api,  # Expose Python functions directly to JavaScript
        shadow=False  # Disable shadow for faster rendering on Windows
    )

    # Set window reference in API after window is created
    window_api.set_window(window)
    
    # Store window in app state for API access (for HTTP endpoints if needed)
    app.state.window = window
    
    webview_module.settings['OPEN_DEVTOOLS_IN_DEBUG'] = False
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
