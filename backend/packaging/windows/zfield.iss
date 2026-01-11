; Inno Setup Script for ZField
; Requires Inno Setup 6.0 or later: https://jrsoftware.org/isinfo.php

#define MyAppName "ZField"
#define MyAppVersion "0.1.9"
#define MyAppPublisher "Your Organization"
#define MyAppURL "https://github.com/roni1234321/zfield"
#define MyAppExeName "zfield.exe"

[Setup]
; NOTE: The value of AppId uniquely identifies this application.
; Do not use the same AppId value in installers for other applications.
AppId={{ZFIELD-APP-ID}}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}
DefaultDirName={autopf}\{#MyAppName}
DefaultGroupName={#MyAppName}
AllowNoIcons=yes
LicenseFile=..\..\..\LICENSE
OutputDir=..\..\dist\installers
OutputBaseFilename=zfield-setup-{#MyAppVersion}
SetupIconFile=logo.ico
Compression=lzma
SolidCompression=yes
WizardStyle=modern
PrivilegesRequired=admin
ArchitecturesAllowed=x64compatible
ArchitecturesInstallIn64BitMode=x64compatible

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked
Name: "quicklaunchicon"; Description: "{cm:CreateQuickLaunchIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked; OnlyBelowVersion: 6.1; Check: not IsAdminInstallMode

[Files]
; Include the entire PyInstaller dist/zfield directory
Source: "..\..\dist\zfield\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs
; Include WebView2 Runtime installer (Evergreen Standalone for offline installation)
; Always include it, but only run if not already installed
Source: "MicrosoftEdgeWebView2RuntimeInstallerX64.exe"; DestDir: "{tmp}"; Flags: deleteafterinstall
; NOTE: Don't use "Flags: ignoreversion" on any shared system files

[Icons]
Name: "{group}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; IconFilename: "{app}\{#MyAppExeName}"
Name: "{group}\{cm:UninstallProgram,{#MyAppName}}"; Filename: "{uninstallexe}"
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; Tasks: desktopicon; IconFilename: "{app}\{#MyAppExeName}"
Name: "{userappdata}\Microsoft\Internet Explorer\Quick Launch\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; Tasks: quicklaunchicon; IconFilename: "{app}\{#MyAppExeName}"

[Code]
function IsWebView2Installed: Boolean;
var
  Version: String;
  DisplayName: String;
begin
  Result := False;
  // Check multiple registry locations for WebView2 installation
  // Method 1: Check EdgeUpdate registry (most reliable)
  if RegQueryStringValue(HKEY_LOCAL_MACHINE,
    'SOFTWARE\WOW6432Node\Microsoft\EdgeUpdate\Clients\{F3017226-FE2A-4295-8BDF-00C3A9EF7CFC}',
    'pv', Version) then
  begin
    Result := True;
    Exit;
  end;
  // Method 2: Check 64-bit EdgeUpdate registry
  if RegQueryStringValue(HKEY_LOCAL_MACHINE,
    'SOFTWARE\Microsoft\EdgeUpdate\Clients\{F3017226-FE2A-4295-8BDF-00C3A9EF7CFC}',
    'pv', Version) then
  begin
    Result := True;
    Exit;
  end;
  // Method 3: Check Uninstall registry (very reliable)
  if RegQueryStringValue(HKEY_LOCAL_MACHINE,
    'SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall\Microsoft EdgeWebView',
    'Version', Version) then
  begin
    Result := True;
    Exit;
  end;
  if RegQueryStringValue(HKEY_LOCAL_MACHINE,
    'SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\Microsoft EdgeWebView',
    'Version', Version) then
  begin
    Result := True;
    Exit;
  end;
  // Method 4: Check by DisplayName
  if RegQueryStringValue(HKEY_LOCAL_MACHINE,
    'SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall\Microsoft EdgeWebView',
    'DisplayName', DisplayName) then
  begin
    if Pos('WebView2', DisplayName) > 0 then
    begin
      Result := True;
      Exit;
    end;
  end;
  if RegQueryStringValue(HKEY_LOCAL_MACHINE,
    'SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\Microsoft EdgeWebView',
    'DisplayName', DisplayName) then
  begin
    if Pos('WebView2', DisplayName) > 0 then
    begin
      Result := True;
      Exit;
    end;
  end;
end;

function InitializeSetup(): Boolean;
var
  WebView2Installed: Boolean;
begin
  Result := True;
  // Log WebView2 detection status for debugging
  WebView2Installed := IsWebView2Installed;
  if WebView2Installed then
    Log('WebView2 Runtime is already installed - skipping installation')
  else
    Log('WebView2 Runtime not detected - will attempt installation');
end;

procedure CurStepChanged(CurStep: TSetupStep);
var
  ResultCode: Integer;
begin
  // Install WebView2 during the installation step, before files are installed
  if (CurStep = ssInstall) and (not IsWebView2Installed) then
  begin
    Log('Installing WebView2 Runtime...');
    if FileExists(ExpandConstant('{tmp}\MicrosoftEdgeWebView2RuntimeInstallerX64.exe')) then
    begin
      if Exec(ExpandConstant('{tmp}\MicrosoftEdgeWebView2RuntimeInstallerX64.exe'),
        '/silent /install', '', SW_HIDE, ewWaitUntilTerminated, ResultCode) then
      begin
        // WebView2 installer exit codes:
        // 0 = Success (installed successfully)
        // 1 = Already installed (treat as success)
        // Other = Error (but we continue anyway)
        if (ResultCode = 0) or (ResultCode = 1) then
          Log('WebView2 Runtime installation completed (exit code: ' + IntToStr(ResultCode) + ')')
        else
          Log('WebView2 installer returned exit code: ' + IntToStr(ResultCode) + ' - continuing installation');
        // Always continue - don't abort on WebView2 installation issues
      end
      else
        Log('Failed to execute WebView2 installer - continuing installation');
    end
    else
      Log('WebView2 installer not found in temp directory - continuing installation');
  end;
end;

[Run]
; WebView2 installation is handled in CurStepChanged during ssInstall step
; This allows us to handle exit codes properly without failing the installation
; Launch the application
Filename: "{app}\{#MyAppExeName}"; Description: "{cm:LaunchProgram,{#StringChange(MyAppName, '&', '&&')}}"; Flags: nowait postinstall skipifsilent

[UninstallDelete]
Type: filesandordirs; Name: "{app}"
