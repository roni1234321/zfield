@echo off
REM Build script for Windows

echo Building Zephyr Device Manager executable...

REM Activate virtual environment if it exists
if exist venv\Scripts\activate.bat (
    call venv\Scripts\activate.bat
)

REM Install PyInstaller if not already installed
pip install pyinstaller

REM Clean previous builds
if exist build rmdir /s /q build
if exist dist rmdir /s /q dist

REM Build the executable
pyinstaller zdm_gui.spec

echo.
echo Build complete! Executable is in dist\zdm\
echo Run with: dist\zdm\zdm.exe
echo.
pause
