@echo off
setlocal
set "LEO_ROOT=%~dp0"
pwsh.exe -NoProfile -Command "$root=$env:LEO_ROOT.TrimEnd('\'); Set-Location $root; if (!(Test-Path '.env')) { & '.\Setup-LEO.ps1'; if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE } }; if (!(Test-Path 'node_modules')) { npm ci; if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE } }; npm run ui"
if errorlevel 1 pause
