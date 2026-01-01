"""Base backend interface for communication backends."""
from abc import ABC, abstractmethod
from typing import Optional, Callable


class BaseBackend(ABC):
    """Abstract base class for all communication backends."""
    
    @abstractmethod
    async def connect(self, **kwargs) -> bool:
        """Establish connection to device.
        
        Returns:
            True if connection successful, False otherwise
        """
        pass
    
    @abstractmethod
    async def disconnect(self) -> None:
        """Close connection to device."""
        pass
    
    @abstractmethod
    async def send(self, data: bytes) -> None:
        """Send data to device.
        
        Args:
            data: Data to send
        """
        pass
    
    @abstractmethod
    def is_connected(self) -> bool:
        """Check if backend is connected.
        
        Returns:
            True if connected, False otherwise
        """
        pass
    
    @abstractmethod
    def set_data_callback(self, callback: Callable[[bytes], None]) -> None:
        """Set callback function for received data.
        
        Args:
            callback: Function to call when data is received
        """
        pass
        
    @abstractmethod
    def get_history(self) -> bytes:
        """Get the current history buffer content.
        
        Returns:
            The raw bytes currently stored in the history buffer.
        """
        pass

    @abstractmethod
    def set_log_file(self, path: str, log_mode: str = "printable", log_tx: bool = True) -> None:
        """Set the path and mode for session logging.
        
        Args:
            path: Path to the log file
            log_mode: "printable" or "raw"
            log_tx: Whether to log transmitted data
        """
        pass

    @abstractmethod
    def update_log_settings(self, log_mode: str, log_tx: bool) -> None:
        """Update logging settings for the current session.
        
        Args:
            log_mode: "printable" or "raw"
            log_tx: Whether to log transmitted data
        """
        pass

