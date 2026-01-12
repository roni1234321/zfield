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

# Collect Qt platform plugins (required for xcb on Linux)
qt_plugins = []
try:
    from PyQt6.QtCore import QLibraryInfo
    qt_plugin_path = QLibraryInfo.path(QLibraryInfo.LibraryPath.PluginsPath)
    if os.path.exists(qt_plugin_path):
        # Add platform plugins (xcb, wayland, etc.)
        platform_plugin_path = os.path.join(qt_plugin_path, 'platforms')
        if os.path.exists(platform_plugin_path):
            qt_plugins.append((platform_plugin_path, 'PyQt6/Qt6/plugins/platforms'))
        # Add other essential plugins
        for plugin_dir in ['xcbglintegrations', 'egldeviceintegrations']:
            plugin_path = os.path.join(qt_plugin_path, plugin_dir)
            if os.path.exists(plugin_path):
                qt_plugins.append((plugin_path, f'PyQt6/Qt6/plugins/{plugin_dir}'))
        print(f"Found Qt plugins at: {qt_plugin_path}")
        print(f"Adding {len(qt_plugins)} Qt plugin directories")
    else:
        print(f"WARNING: Qt plugin path not found: {qt_plugin_path}")
except ImportError:
    print("WARNING: PyQt6 not found, Qt plugins will not be bundled")
except Exception as e:
    print(f"WARNING: Could not locate Qt plugins: {e}")

frontend_datas.extend(qt_plugins)

# Exclude Python 3.11+ modules to ensure compatibility with Python 3.10
# Also exclude GTK/gi modules since we use Qt, not GTK
excludes = [
    'libpython3.11',
    'libpython3.12',
    'libpython3.13',
    'gi',  # GObject Introspection (GTK) - not needed for Qt
    'gi.repository',  # GTK bindings
    'gtk',  # GTK toolkit
    'webkit',  # GTK WebKit (we use Qt WebEngine)
    'webkit2',  # GTK WebKit2
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
        'PyQt6.QtCore',
        'PyQt6.QtGui',
        'PyQt6.QtWidgets',
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
# Also filter out GTK/gi libraries since we use Qt
# This ensures compatibility with Python 3.10 systems
# IMPORTANT: Build must be done with Python 3.10 to avoid this issue
a.binaries = [x for x in a.binaries if not any(
    ver in x[0] for ver in ['libpython3.11', 'libpython3.12', 'libpython3.13', 'libgtk', 'libgobject', 'libgi']
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
