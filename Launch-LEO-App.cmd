@echo off
setlocal
set "LEO_ROOT=%~dp0"
start "" "%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe" -NoProfile -ExecutionPolicy Bypass -File "%LEO_ROOT%Launch-LEO-App.ps1"
