"""FastAPI application entry point."""
from fastapi import FastAPI, WebSocket
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pathlib import Path
import os
import sys

from app.api import routes
from app.api.websocket import websocket_endpoint
from app.api.port_websocket import port_websocket_endpoint, stop_port_monitor

from app.version import VERSION

app = FastAPI(title="Zephyr Device Manager", version=VERSION)

# Include API routes
app.include_router(routes.router, prefix="/api")

# WebSocket endpoint for serial communication
@app.websocket("/ws")
async def websocket(websocket: WebSocket):
    """WebSocket endpoint for serial communication."""
    await websocket_endpoint(websocket)

# WebSocket endpoint for port change notifications
@app.websocket("/ws/ports")
async def port_websocket(websocket: WebSocket):
    """WebSocket endpoint for port change notifications."""
    await port_websocket_endpoint(websocket)

# Determine frontend path (handle PyInstaller bundled app)
if getattr(sys, 'frozen', False):
    # Running as compiled executable
    base_path = Path(sys._MEIPASS)
    frontend_path = base_path / "frontend"
    print(f"[DEBUG] Running as frozen executable, base_path: {base_path}")
    print(f"[DEBUG] Frontend path: {frontend_path}")
    print(f"[DEBUG] Frontend exists: {frontend_path.exists()}")
    if frontend_path.exists():
        print(f"[DEBUG] Frontend contents: {list(frontend_path.iterdir())}")
else:
    # Running as script
    frontend_path = Path(__file__).parent.parent.parent / "frontend"
    print(f"[DEBUG] Running as script, frontend_path: {frontend_path}")
    print(f"[DEBUG] Frontend exists: {frontend_path.exists()}")

if frontend_path.exists():
    @app.get("/favicon.ico")
    async def favicon():
        """Serve favicon.ico by returning logo.png."""
        logo_path = frontend_path / "logo.png"
        if logo_path.exists():
            return FileResponse(logo_path)
        return {"message": "Logo not found"}

    @app.get("/")
    async def read_root():
        """Serve frontend index page."""
        index_path = frontend_path / "index.html"
        print(f"[DEBUG] Serving index.html from: {index_path}")
        print(f"[DEBUG] Index exists: {index_path.exists()}")
        if index_path.exists():
            response = FileResponse(index_path)
            response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
            response.headers["Pragma"] = "no-cache"
            response.headers["Expires"] = "0"
            return response
        error_msg = f"Frontend not found at {index_path}"
        print(f"[ERROR] {error_msg}")
        return {"error": error_msg, "frontend_path": str(frontend_path), "exists": frontend_path.exists()}

    # Serve the entire frontend directory (js, css, logo.png, etc.)
    # Mount this last so it doesn't shadow the API or explicit routes
    try:
        app.mount("/", StaticFiles(directory=str(frontend_path)), name="frontend")
        print(f"[DEBUG] Mounted static files from: {frontend_path}")
    except Exception as e:
        print(f"[ERROR] Failed to mount static files: {e}")
        import traceback
        traceback.print_exc()
else:
    print(f"[ERROR] Frontend directory does not exist: {frontend_path}")

@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

