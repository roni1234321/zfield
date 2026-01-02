import webview
import threading
import time
import sys
import uvicorn
import socket
import os
import signal
from pathlib import Path
from app.main import app

FIXED_PORT = 48715

def get_pid_file():
    """Get the path to the PID file."""
    home = Path.home()
    pid_dir = home / '.zdm'
    pid_dir.mkdir(parents=True, exist_ok=True)
    return pid_dir / 'zdm.pid'

def kill_previous_instance():
    """Kill any previous instance of the application."""
    pid_file = get_pid_file()
    
    if pid_file.exists():
        try:
            with open(pid_file, 'r') as f:
                old_pid = int(f.read().strip())
            
            # Check if process exists and kill it
            try:
                os.kill(old_pid, signal.SIGTERM)
                print(f"Killed previous instance (PID: {old_pid})")
                time.sleep(1)  # Wait for process to terminate
            except ProcessLookupError:
                # Process doesn't exist anymore
                pass
        except (ValueError, FileNotFoundError):
            pass
    
    # Write current PID
    with open(pid_file, 'w') as f:
        f.write(str(os.getpid()))

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
    storage_dir = home / '.zdm' / 'storage'
    storage_dir.mkdir(parents=True, exist_ok=True)
    return str(storage_dir)

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
    
    window = webview.create_window(
        'Zephyr Device Manager',
        url,
        width=1200,
        height=800,
        min_size=(800, 600)
    )

    # Store window in app state for API access
    app.state.window = window

    try:
        # Start the webview loop with persistent storage
        # private_mode=False is REQUIRED for localStorage to persist
        webview.start(storage_path=storage_path, private_mode=False)
    finally:
        # Cleanup on exit
        cleanup_pid_file()

if __name__ == '__main__':
    main()
