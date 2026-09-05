param(
  [Parameter(Mandatory=$true)]
  [string]$HostAddress,
  [int]$Port = 3000
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$envPath = Join-Path $Root ".env"

if (-not (Test-Path $envPath)) {
  throw "Run Setup-LEO.ps1 first."
}

$lines = Get-Content -LiteralPath $envPath
$lines = @($lines | Where-Object { $_ -notmatch "^LEO_UI_HOST=" -and $_ -notmatch "^LEO_UI_PORT=" })
$lines += "LEO_UI_HOST=$HostAddress"
$lines += "LEO_UI_PORT=$Port"
Set-Content -LiteralPath $envPath -Value $lines -Encoding UTF8

Write-Host ""
Write-Host "L.E.O. mobile/private-network listener configured."
Write-Host "Host: $HostAddress"
Write-Host "Port: $Port"
Write-Host ""
Write-Host ("Restart L.E.O., then open http://" + $HostAddress + ":" + $Port + " from your phone.")
Write-Host "Use a private network such as Tailscale. Do NOT port-forward this port to the public Internet."
