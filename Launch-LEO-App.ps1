$ErrorActionPreference="Stop"
$Root=Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $Root
if(-not (Test-Path (Join-Path $Root ".env"))){& (Join-Path $Root "Setup-LEO.ps1");if($LASTEXITCODE -ne 0){exit $LASTEXITCODE}}
if(-not (Test-Path (Join-Path $Root "node_modules"))){npm ci;if($LASTEXITCODE -ne 0){exit $LASTEXITCODE}}
Start-Process -FilePath "powershell.exe" -ArgumentList @("-NoProfile","-ExecutionPolicy","Bypass","-File",(Join-Path $Root "Launch-LEO.ps1")) -WindowStyle Hidden
Start-Sleep -Seconds 2
$edge=Get-Command "msedge.exe" -ErrorAction SilentlyContinue
if($edge){Start-Process $edge.Source -ArgumentList @("--app=http://127.0.0.1:3000","--start-maximized");exit}
$chrome=Get-Command "chrome.exe" -ErrorAction SilentlyContinue
if($chrome){Start-Process $chrome.Source -ArgumentList @("--app=http://127.0.0.1:3000","--start-maximized");exit}
Start-Process "http://127.0.0.1:3000"
