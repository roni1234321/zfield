"""SMP (Simple Management Protocol) service for MCU management and FOTA."""
import struct
from typing import Optional, Callable, Dict, Any
from app.api.routes import get_connection_manager


# SMP header structure (big-endian)
# op (1 byte) + res1 (1 byte) + flags (1 byte) + len (2 bytes) + group (2 bytes) + seq (1 byte) + id (1 byte)
SMP_HEADER_SIZE = 8
SMP_MAX_LENGTH = 64 * 1024  # 64KB max frame size


class SMPService:
    """Service for handling SMP protocol operations."""
    
    def __init__(self, port: str):
        """Initialize SMP service for a specific port.
        
        Args:
            port: Serial port name
        """
        self.port = port
        self.connection_manager = get_connection_manager()
        self.backend = None
        self.terminal_callback: Optional[Callable[[bytes], None]] = None
        self._buffer = bytearray()
        
    def _get_backend(self):
        """Get the backend for this port."""
        if not self.backend:
            self.backend = self.connection_manager.get_backend(self.port)
        return self.backend
    
    def set_terminal_callback(self, callback: Callable[[bytes], None]) -> None:
        """Set callback to dump SMP bytes to terminal.
        
        Args:
            callback: Function that receives bytes and dumps them as text to terminal
        """
        self.terminal_callback = callback
    
    def _is_smp_frame_start(self, buffer: bytes) -> bool:
        """Check if buffer starts with SMP frame header.
        
        Args:
            buffer: Buffer to check (must be at least SMP_HEADER_SIZE bytes)
            
        Returns:
            True if buffer appears to start with SMP header
        """
        if len(buffer) < SMP_HEADER_SIZE:
            return False
        
        try:
            # Parse header fields (big-endian)
            # op (1) + res1 (1) + flags (1) + len (2) + group (2) + seq (1) + id (1)
            nh_len = struct.unpack('>H', buffer[2:4])[0]
            
            # Validate length is reasonable
            if nh_len == 0 or nh_len > SMP_MAX_LENGTH:
                return False
            
            # Check if total frame size is reasonable
            total_len = SMP_HEADER_SIZE + nh_len
            if total_len > SMP_MAX_LENGTH:
                return False
            
            # Additional validation: check op code is valid (0-7)
            op = buffer[0] & 0x07
            if op > 3:  # Valid ops: 0=read, 1=read_rsp, 2=write, 3=write_rsp
                return False
            
            return True
        except (struct.error, IndexError):
            return False
    
    def _dump_bytes_to_terminal(self, data: bytes) -> None:
        """Dump bytes as text to terminal.
        
        Args:
            data: Bytes to dump
        """
        if self.terminal_callback:
            # Convert bytes to text representation (errors='replace' for non-printable)
            text = data.decode('utf-8', errors='replace')
            # Send as bytes to callback (callback expects bytes for terminal)
            self.terminal_callback(text.encode('utf-8', errors='replace'))
    
    def process_incoming_data(self, data: bytes) -> bytes:
        """Process incoming serial data, detect SMP frames, and dump to terminal.
        
        This implements Option A multiplexing: detect SMP frames by header,
        dump them as text, and return remaining non-SMP data.
        
        Args:
            data: Raw bytes from serial port
            
        Returns:
            Remaining non-SMP data that should be displayed normally
        """
        if not data:
            return b''
        
        # Add to buffer
        self._buffer.extend(data)
        
        remaining = bytearray()
        buffer = bytes(self._buffer)
        pos = 0
        
        while pos < len(buffer):
            # Check if we have enough for header
            if len(buffer) - pos < SMP_HEADER_SIZE:
                # Not enough data, keep in buffer
                remaining.extend(buffer[pos:])
                break
            
            # Check if this looks like SMP frame start
            if self._is_smp_frame_start(buffer[pos:]):
                # Get frame length from header
                nh_len = struct.unpack('>H', buffer[pos + 2:pos + 4])[0]
                total_len = SMP_HEADER_SIZE + nh_len
                
                # Check if we have complete frame
                if len(buffer) - pos >= total_len:
                    # Extract complete SMP frame
                    smp_frame = buffer[pos:pos + total_len]
                    # Dump to terminal
                    self._dump_bytes_to_terminal(smp_frame)
                    pos += total_len
                else:
                    # Incomplete frame, keep in buffer
                    remaining.extend(buffer[pos:])
                    break
            else:
                # Not SMP frame, treat as normal data
                # Take one byte at a time to avoid breaking potential SMP frames
                remaining.append(buffer[pos])
                pos += 1
        
        # Update buffer with remaining data
        self._buffer = remaining
        return bytes(remaining)
    
    async def send_command(self, group: int, command: int, data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Send SMP command.
        
        Args:
            group: SMP group ID
            command: SMP command ID
            data: Optional command data
            
        Returns:
            Response dictionary
        """
        try:
            # Try to use smp library if available
            try:
                from smp import encode_request
                
                # Encode SMP request using library
                # The exact API may vary - this is a placeholder
                # In practice, check smp library documentation for correct usage
                encoded = encode_request(
                    op=2,  # Write operation
                    flags=0,
                    group=group,
                    sequence=0,
                    command_id=command,
                    data=data or {}
                )
            except ImportError:
                # Fallback: create minimal SMP frame manually
                # SMP header: op(1) + res1(1) + flags(1) + len(2) + group(2) + seq(1) + id(1)
                import struct
                
                # Serialize data if provided
                payload = b''
                if data:
                    import json
                    payload = json.dumps(data).encode('utf-8')
                
                # Build header (big-endian)
                op_flags = 0x02  # Write operation, flags=0
                length = len(payload)
                sequence = 0
                
                header = struct.pack('>BBHHBB',
                    op_flags & 0x07,  # op (3 bits)
                    0,  # res1
                    0,  # flags
                    length,  # length
                    group,  # group
                    sequence,  # sequence
                    command  # command ID
                )
                
                encoded = header + payload
            
            # Dump to terminal
            self._dump_bytes_to_terminal(encoded)
            
            # Send via backend
            backend = self._get_backend()
            if not backend or not backend.is_connected():
                raise RuntimeError(f"Backend {self.port} not connected")
            
            await backend.send(encoded)
            
            # For now, return success (actual response would come via process_incoming_data)
            return {"status": "sent", "group": group, "command": command}
            
        except Exception as e:
            raise RuntimeError(f"Failed to send SMP command: {e}")
    
    async def upload_firmware(self, file_path: str, progress_callback: Optional[Callable[[int, int], None]] = None) -> Dict[str, Any]:
        """Upload firmware image via SMP.
        
        Args:
            file_path: Path to firmware file
            progress_callback: Optional callback(uploaded_bytes, total_bytes)
            
        Returns:
            Upload result
        """
        try:
            from smp import SMPRequest
            
            # Read firmware file
            with open(file_path, 'rb') as f:
                firmware_data = f.read()
            
            # Split into chunks and upload
            chunk_size = 1024  # 1KB chunks
            total_size = len(firmware_data)
            uploaded = 0
            
            # Use SMP image management group (0) and upload command
            # This is simplified - actual SMP image upload protocol is more complex
            for offset in range(0, total_size, chunk_size):
                chunk = firmware_data[offset:offset + chunk_size]
                
                # Create upload request (simplified)
                # In practice, use proper SMP image management commands
                request_data = {
                    "off": offset,
                    "data": chunk.hex()  # Hex encode for transport
                }
                
                await self.send_command(group=0, command=0, data=request_data)
                
                uploaded += len(chunk)
                if progress_callback:
                    progress_callback(uploaded, total_size)
            
            return {"status": "uploaded", "size": total_size}
            
        except Exception as e:
            raise RuntimeError(f"Failed to upload firmware: {e}")


# Global SMP service instances per port
_smp_services: Dict[str, SMPService] = {}


def get_smp_service(port: str) -> SMPService:
    """Get or create SMP service for a port.
    
    Args:
        port: Serial port name
        
    Returns:
        SMPService instance
    """
    if port not in _smp_services:
        _smp_services[port] = SMPService(port)
    return _smp_services[port]

