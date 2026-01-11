@echo off
REM Build script for Windows MSI installer
REM Requires: Inno Setup (https://jrsoftware.org/isinfo.php)
REM           Python with Pillow (pip install Pillow)
REM Skip pause in CI environment
if "%CI%"=="true" set SKIP_PAUSE=1

echo ========================================
echo Building ZField Installer
echo ========================================
echo.

REM Change to backend directory
cd /d "%~dp0..\.."

REM Step 1: Build the PyInstaller executable
echo [1/4] Building PyInstaller executable...
pyinstaller zfield_gui_windows.spec
if errorlevel 1 (
    echo ERROR: PyInstaller build failed!
    if not defined SKIP_PAUSE pause
    exit /b 1
)
echo.

REM Step 2: Convert logo to ICO format
echo [2/4] Converting logo to ICO format...
python packaging\windows\convert_icon.py
if errorlevel 1 (
    echo ERROR: Icon conversion failed!
    echo Make sure Pillow is installed: pip install Pillow
    if not defined SKIP_PAUSE pause
    exit /b 1
)
echo.

REM Step 2.5: Download WebView2 Runtime if not present
echo [2.5/5] Checking for WebView2 Runtime installer...
if not exist "packaging\windows\MicrosoftEdgeWebView2RuntimeInstallerX64.exe" (
    echo Downloading WebView2 Runtime (Evergreen Standalone, ~127MB)...
    echo This may take a few minutes...
    powershell -Command "Invoke-WebRequest -Uri 'https://go.microsoft.com/fwlink/p/?LinkId=2124703' -OutFile 'packaging\windows\MicrosoftEdgeWebView2RuntimeInstallerX64.exe' -UserAgent 'Mozilla/5.0'"
    if errorlevel 1 (
        echo WARNING: Failed to download WebView2 Runtime!
        echo You can manually download it from:
        echo https://developer.microsoft.com/en-us/microsoft-edge/webview2/
        echo Save it as: packaging\windows\MicrosoftEdgeWebView2RuntimeInstallerX64.exe
        echo.
        echo Continuing without WebView2 runtime (users will need to install it separately)...
    ) else (
        echo WebView2 Runtime downloaded successfully.
    )
) else (
    echo WebView2 Runtime installer already exists, skipping download.
)
echo.

REM Step 3: Create installers directory
echo [3/5] Preparing output directory...
if not exist "dist\installers" mkdir "dist\installers"
echo.

REM Step 4: Build the installer with Inno Setup
echo [4/5] Building MSI installer with Inno Setup...
REM Try to find Inno Setup in common locations
set ISCC=""
if exist "C:\Program Files (x86)\Inno Setup 6\ISCC.exe" set ISCC="C:\Program Files (x86)\Inno Setup 6\ISCC.exe"
if exist "C:\Program Files\Inno Setup 6\ISCC.exe" set ISCC="C:\Program Files\Inno Setup 6\ISCC.exe"

if %ISCC%=="" (
    echo ERROR: Inno Setup not found!
    echo Please install Inno Setup from: https://jrsoftware.org/isinfo.php
    echo Or update the ISCC path in this script.
    if not defined SKIP_PAUSE pause
    exit /b 1
)

%ISCC% packaging\windows\zfield.iss
if errorlevel 1 (
    echo ERROR: Inno Setup compilation failed!
    if not defined SKIP_PAUSE pause
    exit /b 1
)
echo.

echo.
echo [5/5] Build complete!
echo ========================================
echo Build Complete!
echo ========================================
echo Installer location: dist\installers\
echo.
echo Note: The installer includes WebView2 Runtime and will install it
echo automatically if not already present on the target system.
echo.
if not defined SKIP_PAUSE pause
