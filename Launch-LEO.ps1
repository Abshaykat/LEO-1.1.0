$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $Root

if (-not (Test-Path (Join-Path $Root ".env"))) {
  & (Join-Path $Root "Setup-LEO.ps1")
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}

if (-not (Test-Path (Join-Path $Root "node_modules"))) {
  npm ci
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}

npm run ui
