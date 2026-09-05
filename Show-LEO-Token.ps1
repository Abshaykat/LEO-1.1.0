$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$envPath = Join-Path $Root ".env"

if (-not (Test-Path $envPath)) {
  throw "L.E.O. is not set up yet. Run .\Setup-LEO.ps1 first."
}

$line = Get-Content -LiteralPath $envPath | Where-Object { $_ -match '^LEO_UI_TOKEN=' } | Select-Object -First 1
if (-not $line) {
  throw "LEO_UI_TOKEN is missing from the private configuration."
}

$token = $line.Substring("LEO_UI_TOKEN=".Length)
Write-Host ""
Write-Host "L.E.O. UI token (owner-only):"
Write-Host $token
Write-Host ""
