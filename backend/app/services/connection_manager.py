"""Serial port manager service."""
from typing import Optional
from app.backends.base import BaseBackend
from app.backends.serial_backend import SerialBackend
from app.backends.telnet_backend import TelnetBackend


class ConnectionManager:
    """Manages multiple serial port and telnet connections."""
    
    def __init__(self):
        # Map port names to Backend instances
        self.backends: dict[str, BaseBackend] = {}
    
    async def connect(self, port: str, baudrate: int = 115200, connection_type: str = "serial", log_file: Optional[str] = None, log_mode: str = "printable", log_tx: bool = True, **kwargs) -> bool:
        """Connect to a specific serial port or telnet host.
        
        Args:
            port: Serial port name or "host:port" for telnet
            baudrate: Baud rate (serial only)
            connection_type: "serial" or "telnet"
            log_file: Optional path template for logging
            **kwargs: Additional parameters
            
        Returns:
            True if connection successful, False otherwise
        """
        if port in self.backends:
            if self.backends[port].is_connected():
                return True
            # If not connected but exists, clean up
            await self.backends[port].disconnect()
            
        if connection_type == "telnet":
            backend = TelnetBackend()
            # Parse host:port
            try:
                host, p = port.split(":")
                success = await backend.connect(host=host, port=int(p))
            except ValueError:
                print(f"Invalid telnet address format: {port}")
                return False
        else:
            backend = SerialBackend()
            success = await backend.connect(port=port, baudrate=baudrate, **kwargs)
        
        if success:
            if log_file:
                formatted_log_path = self._format_log_path(log_file, port, connection_type, baudrate)
                backend.set_log_file(formatted_log_path, log_mode, log_tx)
                
            self.backends[port] = backend
            return True
        return False
    
    async def disconnect(self, port: Optional[str] = None) -> None:
        """Disconnect from one or all serial ports.
        
        Args:
            port: Specific port to disconnect, or None for all
        """
        if port:
            if port in self.backends:
                await self.backends[port].disconnect()
                del self.backends[port]
        else:
            # Disconnect all
            for p in list(self.backends.keys()):
                await self.backends[p].disconnect()
            self.backends.clear()
    
    async def send(self, port: str, data: bytes) -> None:
        """Send data to a specific serial port.
        
        Args:
            port: Target port name
            data: Data to send
        """
        if port not in self.backends or not self.backends[port].is_connected():
            raise RuntimeError(f"Connection {port} not connected")
        
        await self.backends[port].send(data)
    
    def is_connected(self, port: Optional[str] = None) -> bool:
        """Check if a specific port or any port is connected.
        
        Args:
            port: Specific port to check, or None for 'any'
            
        Returns:
            True if connected, False otherwise
        """
        if port:
            return port in self.backends and self.backends[port].is_connected()
        return any(b.is_connected() for b in self.backends.values())
    
    def get_backend(self, port: str) -> Optional[BaseBackend]:
        """Retrieve the backend instance for a port.
        
        Args:
            port: Port name
            
        Returns:
            Backend instance or None
        """
        return self.backends.get(port)
    
    def _format_log_path(self, path: str, port: str, connection_type: str, baudrate: int = 115200) -> str:
        """Format the log path by replacing placeholders.
        
        Placeholders:
        &Y - Year (YYYY)
        &M - Month (MM)
        &D - Day (DD)
        &T - Time (HHMMSS)
        &H - Hostname / Port name
        &P - Port number / Baudrate
        """
        import datetime
        now = datetime.datetime.now()
        
        res = path
        res = res.replace("&Y", now.strftime("%Y"))
        res = res.replace("&M", now.strftime("%m"))
        res = res.replace("&D", now.strftime("%d"))
        res = res.replace("&T", now.strftime("%H%M%S"))
        
        # For &H and &P, it depends on connection type
        host = port
        p_num = ""
        
        if connection_type == "telnet":
            if ":" in port:
                host, p_num = port.split(":")
        else:
            # Serial: host is port name, p_num is baudrate
            host = port
            p_num = baudrate
            
        res = res.replace("&H", host)
        res = res.replace("&P", str(p_num))
        
        return res

    @staticmethod
    def list_ports() -> list[dict]:
        """List available serial ports.
        
        Returns:
            List of available serial ports
        """
        return SerialBackend.list_ports()

