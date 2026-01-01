from typing import Optional
from fastapi import APIRouter
from pydantic import BaseModel
from app.services.connection_manager import ConnectionManager
from app.backends.serial_backend import SerialBackend
from app.version import get_version_info

router = APIRouter()
connection_manager = ConnectionManager()


class ConnectionRequest(BaseModel):
    port: str
    baudrate: int = 115200
    connection_type: str = "serial"
    log_file: Optional[str] = None


@router.get("/ports")
async def list_ports():
    """List available serial ports."""
    ports = ConnectionManager.list_ports()
    return {"ports": ports}


@router.post("/connect")
async def connect(request: ConnectionRequest):
    """Connect to serial port or telnet host."""
    success = await connection_manager.connect(
        port=request.port,
        baudrate=request.baudrate,
        connection_type=request.connection_type,
        log_file=request.log_file
    )
    if success:
        return {"status": "connected", "port": request.port}
    else:
        return {"status": "error", "message": "Failed to connect"}


@router.post("/disconnect")
async def disconnect(request: Optional[ConnectionRequest] = None):
    """Disconnect from a specific serial port or all if none specified."""
    port = request.port if request else None
    await connection_manager.disconnect(port)
    return {"status": "disconnected", "port": port}


@router.get("/status")
async def get_status():
    """Get status of all active serial connections."""
    active_sessions = []
    for port, backend in connection_manager.backends.items():
        if backend.is_connected():
            baudrate = getattr(backend, 'serial_port', None)
            baudrate = baudrate.baudrate if baudrate else getattr(backend, 'baudrate', None)
            
            # If still None (Telnet), maybe just skip or use default
            
            active_sessions.append({
                "port": port,
                "baudrate": baudrate,
                "connected": True
            })
    
    return {
        "sessions": active_sessions,
        "any_connected": len(active_sessions) > 0
    }


@router.get("/browse")
async def browse_file():
    """Open a file save dialog via pywebview."""
    from fastapi import Request
    import webview
    
    # In some environments, we might not have a window (e.g. CLI mode)
    try:
        from app.main import app as fastapi_app
        window = fastapi_app.state.window
        
        # Open SAVE_DIALOG specifically for log file
        result = window.create_file_dialog(
            webview.SAVE_DIALOG, 
            file_types=('Log Files (*.log)', 'All files (*.*)'),
            save_filename='putty.log'
        )
        
        if result:
            # result is typically a tuple or a single string depending on platform/version
            path = result[0] if isinstance(result, (list, tuple)) else result
            return {"path": path}
    except (AttributeError, ImportError, Exception) as e:
        error_msg = str(e)
        if "window" in error_msg:
            error_msg = "Native file dialog is only available in the standalone application. Please enter the log path manually."
        print(f"Browse error: {e}")
        return {"path": None, "error": error_msg}
        
    return {"path": None}


@router.get("/version")
async def get_version():
    """Get application version information."""
    return get_version_info()


# Export connection_manager for WebSocket handler
def get_connection_manager() -> ConnectionManager:
    """Get connection manager instance."""
    return connection_manager

