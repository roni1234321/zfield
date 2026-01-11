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
        'webview.platforms.edgechromium',  # Windows uses Edge WebView2, no Qt needed
    ],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

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
    upx=False,  # Disabled to reduce antivirus false positives
    console=True,  # Show console for debugging (change to False for production)
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    icon='../frontend/logo.ico',
)

coll = COLLECT(
    exe,
    a.binaries,
    a.zipfiles,
    a.datas,
    strip=False,
    upx=False,  # Disabled to reduce antivirus false positives
    upx_exclude=[],
    name='zfield',
)
