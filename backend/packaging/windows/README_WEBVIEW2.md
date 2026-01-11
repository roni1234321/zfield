# WebView2 Runtime Bundling

The installer now includes the Microsoft Edge WebView2 Runtime and will install it automatically if not already present on the target system.

## How It Works

1. **During Build**: The build script downloads the WebView2 Evergreen Standalone Installer (~127MB)
2. **During Installation**: The installer checks if WebView2 is already installed
3. **If Not Installed**: The installer runs the WebView2 installer silently before installing the application

## Manual Download (If Build Script Fails)

If the automatic download fails, you can manually download the WebView2 Runtime:

1. Go to: https://developer.microsoft.com/en-us/microsoft-edge/webview2/
2. Download the **Evergreen Standalone Installer** for x64
3. Save it as: `packaging\windows\MicrosoftEdgeWebView2RuntimeInstallerX64.exe`

## Installer Size

Including WebView2 Runtime increases the installer size by approximately 127MB. This ensures:
- ✅ Works on offline machines
- ✅ No separate download required
- ✅ Consistent runtime version
- ✅ Better user experience

## Registry Check

The installer checks for WebView2 in these registry locations:
- `HKEY_LOCAL_MACHINE\SOFTWARE\WOW6432Node\Microsoft\EdgeUpdate\Clients\{F3017226-FE2A-4295-8BDF-00C3A9EF7CFC}`
- `HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\EdgeUpdate\Clients\{F3017226-FE2A-4295-8BDF-00C3A9EF7CFC}`

## Silent Installation

WebView2 is installed with `/silent /install` parameters, so users won't see any prompts.

## Updating WebView2

To update the bundled WebView2 version:
1. Delete `packaging\windows\MicrosoftEdgeWebView2RuntimeInstallerX64.exe`
2. Run the build script again - it will download the latest version

