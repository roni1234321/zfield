"""SMP API routes for MCU management and FOTA."""
from fastapi import APIRouter, HTTPException, UploadFile, File
from typing import Optional, Dict, Any
from app.services.smp_service import get_smp_service
from app.api.routes import get_connection_manager
import json

router = APIRouter()


@router.post("/smp/{port}/command")
async def send_smp_command(
    port: str,
    request_data: Dict[str, Any]
):
    """Send SMP command.
    
    Args:
        port: Serial port name
        request_data: JSON body with group, command, and optional args
        
    Returns:
        Command response
    """
    try:
        # Check if port is connected
        connection_manager = get_connection_manager()
        if not connection_manager.is_connected(port):
            raise HTTPException(status_code=400, detail=f"Port {port} not connected")
        
        group = request_data.get("group")
        command = request_data.get("command")
        command_data = request_data.get("args")
        
        if group is None or command is None:
            raise HTTPException(status_code=400, detail="Missing group or command")
        
        # Get SMP service and send command
        smp_service = get_smp_service(port)
        result = await smp_service.send_command(group, command, command_data)
        
        return {"status": "success", "result": result}
        
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send SMP command: {str(e)}")


@router.post("/smp/{port}/upload")
async def upload_firmware(
    port: str,
    file: UploadFile = File(...)
):
    """Upload firmware image via SMP.
    
    Args:
        port: Serial port name
        file: Firmware file to upload
        
    Returns:
        Upload result
    """
    try:
        # Check if port is connected
        connection_manager = get_connection_manager()
        if not connection_manager.is_connected(port):
            raise HTTPException(status_code=400, detail=f"Port {port} not connected")
        
        # Save uploaded file temporarily
        import tempfile
        import os
        
        with tempfile.NamedTemporaryFile(delete=False, suffix='.bin') as tmp_file:
            tmp_path = tmp_file.name
            content = await file.read()
            tmp_file.write(content)
        
        try:
            # Get SMP service and upload
            smp_service = get_smp_service(port)
            
            def progress_callback(uploaded: int, total: int):
                """Progress callback for upload."""
                percent = (uploaded / total * 100) if total > 0 else 0
                print(f"Firmware upload progress: {percent:.1f}% ({uploaded}/{total} bytes)")
            
            result = await smp_service.upload_firmware(tmp_path, progress_callback)
            
            return {"status": "success", "result": result}
            
        finally:
            # Clean up temp file
            try:
                os.unlink(tmp_path)
            except:
                pass
        
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload firmware: {str(e)}")


@router.get("/smp/{port}/images")
async def list_firmware_images(port: str):
    """List firmware images on device.
    
    Args:
        port: Serial port name
        
    Returns:
        List of images
    """
    try:
        # Check if port is connected
        connection_manager = get_connection_manager()
        if not connection_manager.is_connected(port):
            raise HTTPException(status_code=400, detail=f"Port {port} not connected")
        
        # Get SMP service and send image list command
        smp_service = get_smp_service(port)
        # Use SMP image management group (0) and list command (typically 1)
        result = await smp_service.send_command(group=0, command=1)
        
        return {"status": "success", "images": result}
        
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list images: {str(e)}")


@router.post("/smp/{port}/test")
async def test_firmware_image(port: str, request_data: Dict[str, Any]):
    """Test firmware image.
    
    Args:
        port: Serial port name
        image_id: Image ID to test
        
    Returns:
        Test result
    """
    try:
        # Check if port is connected
        connection_manager = get_connection_manager()
        if not connection_manager.is_connected(port):
            raise HTTPException(status_code=400, detail=f"Port {port} not connected")
        
        # Get SMP service and send test command
        smp_service = get_smp_service(port)
        image_id = request_data.get("image_id", 0)
        # Use SMP image management group (0) and test command (typically 2)
        result = await smp_service.send_command(group=0, command=2, data={"test": image_id})
        
        return {"status": "success", "result": result}
        
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to test image: {str(e)}")


@router.post("/smp/{port}/reset")
async def reset_device(port: str):
    """Reset device via SMP.
    
    Args:
        port: Serial port name
        
    Returns:
        Reset result
    """
    try:
        # Check if port is connected
        connection_manager = get_connection_manager()
        if not connection_manager.is_connected(port):
            raise HTTPException(status_code=400, detail=f"Port {port} not connected")
        
        # Get SMP service and send reset command
        smp_service = get_smp_service(port)
        # Use SMP OS management group (1) and reset command (typically 0)
        result = await smp_service.send_command(group=1, command=0)
        
        return {"status": "success", "result": result}
        
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to reset device: {str(e)}")

