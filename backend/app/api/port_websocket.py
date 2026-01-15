"""WebSocket endpoint for real-time port change notifications."""
import asyncio
from fastapi import WebSocket, WebSocketDisconnect
from app.services.port_monitor import PortMonitor
from app.backends.serial_backend import SerialBackend


# Global port monitor instance
_port_monitor: PortMonitor = None
_connected_clients: set[WebSocket] = set()


async def broadcast_port_changes(ports: list[dict]):
    """Broadcast port changes to all connected clients."""
    global _connected_clients
    
    if not _connected_clients:
        print(f"Port monitor: {len(ports)} ports detected, but no clients connected")
        return
    
    message = {
        "type": "ports_changed",
        "ports": ports
    }
    
    print(f"Port monitor: Broadcasting {len(ports)} ports to {len(_connected_clients)} client(s)")
    
    # Send to all connected clients
    disconnected = set()
    for client in _connected_clients:
        try:
            await client.send_json(message)
            print(f"Port monitor: Successfully sent update to client")
        except Exception as e:
            print(f"Error sending port update to client: {e}")
            disconnected.add(client)
    
    # Remove disconnected clients
    _connected_clients -= disconnected


def get_port_monitor() -> PortMonitor:
    """Get or create the global port monitor instance."""
    global _port_monitor
    if _port_monitor is None:
        _port_monitor = PortMonitor(broadcast_port_changes)
        _port_monitor.start()
    return _port_monitor


async def port_websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for port change notifications."""
    global _connected_clients
    
    await websocket.accept()
    _connected_clients.add(websocket)
    print(f"Port WebSocket: Client connected. Total clients: {len(_connected_clients)}")
    
    # Get port monitor (starts it if not already running)
    monitor = get_port_monitor()
    print("Port WebSocket: Port monitor started/retrieved")
    
    # Send initial port list
    try:
        ports = SerialBackend.list_ports()
        print(f"Port WebSocket: Sending initial {len(ports)} ports to client")
        await websocket.send_json({
            "type": "ports_changed",
            "ports": ports
        })
    except Exception as e:
        print(f"Error sending initial ports: {e}")
    
    try:
        # Keep connection alive and handle any incoming messages
        while True:
            try:
                # Wait for messages (client can send ping/pong)
                data = await asyncio.wait_for(websocket.receive_text(), timeout=30.0)
                # Echo back or handle ping
                if data == "ping":
                    await websocket.send_text("pong")
            except asyncio.TimeoutError:
                # Send keepalive
                await websocket.send_json({"type": "keepalive"})
            except WebSocketDisconnect:
                break
    except WebSocketDisconnect:
        pass
    except Exception as e:
        print(f"Port WebSocket error: {e}")
    finally:
        _connected_clients.discard(websocket)
        # If no clients connected, we could stop the monitor, but let's keep it running
        # in case clients reconnect quickly


def stop_port_monitor():
    """Stop the port monitor (called on shutdown)."""
    global _port_monitor
    if _port_monitor:
        _port_monitor.stop()
        _port_monitor = None

