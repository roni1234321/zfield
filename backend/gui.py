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
        uvicorn.run(app, host="127.0.0.1", port=port, log_level="error")
    except Exception as e:
        print(f"Server error: {e}")
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
    
    # Get persistent storage path
    storage_path = get_storage_path()
    print(f"Using storage path: {storage_path}")
    
    # Create window API that will be exposed to JavaScript
    window_api = WindowAPI()
    
    # Create window with minimal delay - don't wait for full initialization
    window = webview.create_window(
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
    
    # Apply native Windows Mica/Acrylic effect after window is shown
    def apply_glass_effect():
        if sys.platform == 'win32':
            try:
                import pywinstyles
                # Wait a bit for window to be fully initialized
                time.sleep(0.1)
                # Get the native window handle
                if hasattr(window, 'native') and window.native:
                    try:
                        # Try Mica first (Windows 11), fallback to Acrylic (Windows 10)
                        try:
                            pywinstyles.apply_style(window.native, 'mica')
                            print("Applied Windows 11 Mica effect")
                        except:
                            # Fallback to Acrylic for Windows 10
                            pywinstyles.apply_style(window.native, 'acrylic')
                            print("Applied Windows 10 Acrylic effect")
                    except Exception as e:
                        print(f"Could not apply Windows glass effect: {e}")
                        print("Note: Install pywinstyles with: pip install pywinstyles")
            except ImportError:
                print("pywinstyles not installed. Install with: pip install pywinstyles")
                print("Skipping native Windows glass effect.")
            except Exception as e:
                print(f"Error applying Windows glass effect: {e}")
    
    # Schedule glass effect to be applied after window starts
    threading.Timer(0.5, apply_glass_effect).start()
    
    print("Window created, starting webview...")

    try:
        # Start the webview loop with persistent storage
        # private_mode=False is REQUIRED for localStorage to persist
        # Suppress recursion errors and thread access errors from Windows WebView2
        if sys.platform == 'win32':
            # Redirect stderr temporarily to suppress pywebview warnings
            # Use a more efficient filtering approach
            original_stderr = sys.stderr
            class FilteredStderr:
                def __init__(self, original):
                    self.original = original
                
                def write(self, text):
                    # Fast filtering: check for pywebview error prefix first
                    if '[pywebview]' in text:
                        # This is a pywebview error, filter it out
                        return
                    
                    # Check for recursion errors (common pattern)
                    if 'recursion depth' in text.lower():
                        return
                    
                    # Check for accessibility/COM errors
                    if 'accessibilityobject' in text.lower() or 'corewebview2' in text.lower():
                        return
                    
                    # Check for abstract methods errors
                    if '__abstractmethods__' in text:
                        return
                    
                    # Not a filtered error, pass through immediately
                    self.original.write(text)
                
                def flush(self):
                    self.original.flush()
            
            sys.stderr = FilteredStderr(original_stderr)
            try:
                webview.start(storage_path=storage_path, private_mode=False)
            finally:
                sys.stderr = original_stderr
        else:
            webview.start(storage_path=storage_path, private_mode=False)
    finally:
        # Cleanup on exit
        cleanup_pid_file()

if __name__ == '__main__':
    main()
