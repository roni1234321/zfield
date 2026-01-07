"""FastAPI application entry point."""
from fastapi import FastAPI, WebSocket
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pathlib import Path
import os
import sys

from app.api import routes
from app.api.websocket import websocket_endpoint

from app.version import VERSION

app = FastAPI(title="Zephyr Device Manager", version=VERSION)

# Include API routes
app.include_router(routes.router, prefix="/api")

# WebSocket endpoint
@app.websocket("/ws")
async def websocket(websocket: WebSocket):
    """WebSocket endpoint for serial communication."""
    await websocket_endpoint(websocket)

# Determine frontend path (handle PyInstaller bundled app)
if getattr(sys, 'frozen', False):
    # Running as compiled executable
    base_path = Path(sys._MEIPASS)
    frontend_path = base_path / "frontend"
else:
    # Running as script
    frontend_path = Path(__file__).parent.parent.parent / "frontend"
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
        if index_path.exists():
            response = FileResponse(index_path)
            response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
            response.headers["Pragma"] = "no-cache"
            response.headers["Expires"] = "0"
            return response
        return {"message": "Frontend not found"}

    # Serve the entire frontend directory (js, css, logo.png, etc.)
    # Mount this last so it doesn't shadow the API or explicit routes
    app.mount("/", StaticFiles(directory=frontend_path), name="frontend")

@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

