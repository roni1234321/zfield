import webview
import threading
import time
import sys
import uvicorn
import socket
from pathlib import Path
from app.main import app

def find_free_port():
    """Find a free port on localhost."""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(('127.0.0.1', 0))
        return s.getsockname()[1]

def start_server(port):
    """Start the FastAPI server in a background thread."""
    try:
        uvicorn.run(app, host="127.0.0.1", port=port, log_level="error")
    except Exception as e:
        print(f"Server error: {e}")

def main():
    port = find_free_port()
    
    # Start the server thread
    server_thread = threading.Thread(target=start_server, args=(port,), daemon=True)
    server_thread.start()

    # Wait a bit for the server to initialize
    time.sleep(1)

    # Create a pywebview window
    url = f'http://127.0.0.1:{port}'
    print(f"Starting GUI pointing to {url}")
    
    window = webview.create_window(
        'Zephyr Device Manager',
        url,
        width=1200,
        height=800,
        min_size=(800, 600)
    )

    # Store window in app state for API access
    app.state.window = window

    # Start the webview loop
    webview.start()

if __name__ == '__main__':
    main()
