@echo off
setlocal
set "LEO_ROOT=%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%LEO_ROOT%Launch-LEO.ps1"
if errorlevel 1 pause
