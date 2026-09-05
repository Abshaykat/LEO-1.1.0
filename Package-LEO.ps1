$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$Zip = Join-Path $Root "LEO-1.1.0-windows.zip"
$Stage = Join-Path $env:TEMP "LEO-1.1.0-package"

if (Test-Path $Stage) { Remove-Item $Stage -Recurse -Force }
New-Item -ItemType Directory -Path $Stage | Out-Null

$exclude = @(
  "node_modules", ".git", ".env", ".env.*",
  "LEO-1.1.0-windows.zip", "runtime", "backups", "logs"
)

Get-ChildItem -LiteralPath $Root -Force | Where-Object {
  $exclude -notcontains $_.Name
} | ForEach-Object {
  Copy-Item -LiteralPath $_.FullName -Destination $Stage -Recurse -Force
}

if (Test-Path $Zip) { Remove-Item $Zip -Force }
Compress-Archive -Path (Join-Path $Stage "*") -DestinationPath $Zip -CompressionLevel Optimal
Remove-Item $Stage -Recurse -Force

Write-Host "Created: $Zip"
