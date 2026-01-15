"""Serial port monitoring service using polling."""
import asyncio
from typing import Callable, Optional, Set
import serial.tools.list_ports


class PortMonitor:
    """Monitors serial port changes using polling."""
    
    def __init__(self, callback: Callable[[list], None]):
        """Initialize port monitor.
        
        Args:
            callback: Function to call when ports change, receives list of port dicts
                     Can be sync or async
        """
        self.callback = callback
        self.monitor_task: Optional[asyncio.Task] = None
        self._running = False
        self._last_ports: Set[str] = set()
        self._loop = None
    
    def _invoke_callback(self, ports: list[dict]):
        """Invoke callback, handling both sync and async callbacks."""
        # Check if callback is async
        if asyncio.iscoroutinefunction(self.callback):
            # Schedule async callback as a task using the running loop
            try:
                loop = asyncio.get_running_loop()
                loop.create_task(self.callback(ports))
            except RuntimeError:
                # No running loop, try to get event loop
                try:
                    loop = asyncio.get_event_loop()
                    if loop.is_running():
                        loop.create_task(self.callback(ports))
                    else:
                        loop.run_until_complete(self.callback(ports))
                except RuntimeError:
                    # Create new loop if needed
                    loop = asyncio.new_event_loop()
                    asyncio.set_event_loop(loop)
                    loop.create_task(self.callback(ports))
        else:
            # Call sync callback directly
            self.callback(ports)
        
    def start(self):
        """Start monitoring ports."""
        if self._running:
            return
        self._running = True
        self.monitor_task = asyncio.create_task(self._monitor_loop())
        
    def stop(self):
        """Stop monitoring ports."""
        self._running = False
        if self.monitor_task:
            self.monitor_task.cancel()
            try:
                asyncio.get_event_loop().run_until_complete(self.monitor_task)
            except asyncio.CancelledError:
                pass
            self.monitor_task = None
    
    def _get_current_ports(self) -> list[dict]:
        """Get current list of ports."""
        ports = []
        for port in serial.tools.list_ports.comports():
            ports.append({
                "device": port.device,
                "description": port.description,
                "manufacturer": port.manufacturer,
                "hwid": port.hwid,
            })
        return ports
    
    def _ports_changed(self, current_ports: list[dict]) -> bool:
        """Check if ports have changed."""
        current_set = {p["device"] for p in current_ports}
        if current_set != self._last_ports:
            self._last_ports = current_set
            return True
        return False
    
    async def _monitor_loop(self):
        """Main monitoring loop - uses polling."""
        await self._monitor_polling()
    
    async def _monitor_polling(self):
        """Polling-based port monitoring."""
        print("Using polling-based port monitoring")
        
        # Initial port list
        ports = self._get_current_ports()
        if self._ports_changed(ports):
            self._invoke_callback(ports)
        
        while self._running:
            try:
                await asyncio.sleep(1.0)  # Poll every second
                ports = self._get_current_ports()
                if self._ports_changed(ports):
                    self._invoke_callback(ports)
            except Exception as e:
                print(f"Error in polling monitor: {e}")
                await asyncio.sleep(1)

