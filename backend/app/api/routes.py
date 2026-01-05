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
    log_mode: str = "printable"
    log_tx: bool = True


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
        log_file=request.log_file,
        log_mode=request.log_mode,
        log_tx=request.log_tx
    )
    if success:
        return {"status": "connected", "port": request.port}
    else:
        return {"status": "error", "message": "Failed to connect"}


@router.post("/update_logging")
async def update_logging(request: ConnectionRequest):
    """Update logging settings for an active connection."""
    port = request.port
    if port in connection_manager.backends:
        backend = connection_manager.backends[port]
        backend.update_log_settings(request.log_mode, request.log_tx)
        return {"status": "updated", "port": port}
    return {"status": "error", "message": "Connection not found"}


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


@router.post("/window/minimize")
async def minimize_window():
    """Minimize the window."""
    from app.main import app as fastapi_app
    if hasattr(fastapi_app.state, 'window') and fastapi_app.state.window:
        fastapi_app.state.window.minimize()
    return {"success": True}


@router.post("/window/maximize")
async def maximize_window():
    """Maximize the window."""
    from app.main import app as fastapi_app
    if hasattr(fastapi_app.state, 'window') and fastapi_app.state.window:
        window = fastapi_app.state.window
        try:
            # pywebview window maximize
            if hasattr(window, 'maximize'):
                window.maximize()
            elif hasattr(window, 'toggle_fullscreen'):
                window.toggle_fullscreen()
        except Exception as e:
            print(f"Window maximize error: {e}")
    return {"success": True}


@router.post("/window/restore")
async def restore_window():
    """Restore the window from maximized state."""
    from app.main import app as fastapi_app
    if hasattr(fastapi_app.state, 'window') and fastapi_app.state.window:
        window = fastapi_app.state.window
        try:
            # pywebview window restore
            if hasattr(window, 'restore'):
                window.restore()
            elif hasattr(window, 'maximize'):
                # If maximize toggles, call it again if window is maximized
                try:
                    if hasattr(window, 'is_maximized') and window.is_maximized:
                        window.maximize()  # Toggle to restore
                    else:
                        # Can't determine state, just try maximize (should toggle)
                        window.maximize()
                except:
                    window.maximize()  # Fallback: try to toggle
        except Exception as e:
            print(f"Window restore error: {e}")
    return {"success": True}


@router.post("/window/close")
async def close_window():
    """Close the window."""
    from app.main import app as fastapi_app
    if hasattr(fastapi_app.state, 'window') and fastapi_app.state.window:
        fastapi_app.state.window.destroy()
    return {"success": True}


class WindowResizeRequest(BaseModel):
    width: int
    height: int
    x: Optional[int] = None
    y: Optional[int] = None


@router.post("/window/resize")
async def resize_window(request: WindowResizeRequest):
    """Resize and optionally reposition the window."""
    from app.main import app as fastapi_app
    if hasattr(fastapi_app.state, 'window') and fastapi_app.state.window:
        window = fastapi_app.state.window
        try:
            # Try to resize using available methods
            if hasattr(window, 'resize'):
                window.resize(request.width, request.height)
            elif hasattr(window, 'set_size'):
                window.set_size(request.width, request.height)
            
            # Try to move if coordinates provided
            if request.x is not None and request.y is not None:
                if hasattr(window, 'move'):
                    window.move(request.x, request.y)
                elif hasattr(window, 'set_position'):
                    window.set_position(request.x, request.y)
        except Exception as e:
            print(f"Window resize error: {e}")
    return {"success": True}


# Export connection_manager for WebSocket handler
def get_connection_manager() -> ConnectionManager:
    """Get connection manager instance."""
    return connection_manager

