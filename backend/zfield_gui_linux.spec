# -*- mode: python ; coding: utf-8 -*-

block_cipher = None

# Collect all frontend files
frontend_datas = []
frontend_path = '../frontend'

# Add HTML files
frontend_datas.append((f'{frontend_path}/index.html', 'frontend'))

# Add JS files
frontend_datas.append((f'{frontend_path}/js', 'frontend/js'))

# Add CSS files
import os
if os.path.exists(f'{frontend_path}/css'):
    frontend_datas.append((f'{frontend_path}/css', 'frontend/css'))

# Add assets
if os.path.exists(f'{frontend_path}/assets'):
    frontend_datas.append((f'{frontend_path}/assets', 'frontend/assets'))

# Add icon
if os.path.exists(f'{frontend_path}/icon.png'):
    frontend_datas.append((f'{frontend_path}/icon.png', 'frontend'))

# Add logo
if os.path.exists(f'{frontend_path}/logo.png'):
    frontend_datas.append((f'{frontend_path}/logo.png', 'frontend'))

# Exclude Python 3.11+ modules to ensure compatibility with Python 3.10
excludes = [
    'libpython3.11',
    'libpython3.12',
    'libpython3.13',
]

a = Analysis(
    ['gui.py'],
    pathex=[],
    binaries=[],
    datas=frontend_datas,
    hiddenimports=[
        'uvicorn.logging',
        'uvicorn.loops',
        'uvicorn.loops.auto',
        'uvicorn.protocols',
        'uvicorn.protocols.http',
        'uvicorn.protocols.http.auto',
        'uvicorn.protocols.websockets',
        'uvicorn.protocols.websockets.auto',
        'uvicorn.lifespan',
        'uvicorn.lifespan.on',
        'app.api.routes',
        'app.api.websocket',
        'app.services.connection_manager',
        'app.backends.serial_backend',
        'app.backends.base',
        'app.config',
        'webview.platforms.qt',  # Linux requires Qt
        'PyQt6.QtWebEngineWidgets',
        'PyQt6.QtWebEngineCore',
    ],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=excludes,
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

# Filter out Python 3.11+ shared libraries from binaries
# This ensures compatibility with Python 3.10 systems
# IMPORTANT: Build must be done with Python 3.10 to avoid this issue
a.binaries = [x for x in a.binaries if not any(
    ver in x[0] for ver in ['libpython3.11', 'libpython3.12', 'libpython3.13']
)]

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    [],
    exclude_binaries=True,
    name='zfield',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    console=False,  # Hide console for production
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    icon='../frontend/logo.png',  # Linux uses PNG for icon
)

coll = COLLECT(
    exe,
    a.binaries,
    a.zipfiles,
    a.datas,
    strip=False,
    upx=True,
    upx_exclude=[],
    name='zfield',
)
