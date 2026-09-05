$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $Root

function Require-Command([string]$Name) {
  if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
    throw "$Name is required. Install Node.js 20+ and PowerShell 7, then run setup again."
  }
}

Require-Command "node"
Require-Command "npm"

$nodeMajor = [int]((node --version).TrimStart("v").Split(".")[0])
if ($nodeMajor -lt 20) {
  throw "Node.js 20 or newer is required. Detected Node.js $nodeMajor."
}

$envPath = Join-Path $Root ".env"

if (-not (Test-Path $envPath)) {
  $tokenBytes = New-Object byte[] 32
  [System.Security.Cryptography.RandomNumberGenerator]::Fill($tokenBytes)
  $backupBytes = New-Object byte[] 32
  [System.Security.Cryptography.RandomNumberGenerator]::Fill($backupBytes)

  $token = [Convert]::ToBase64String($tokenBytes)
  $backupKey = [Convert]::ToBase64String($backupBytes)
  $portableRoot = $Root.Replace("", "/")

  $content = @"
LEO_HOME=$portableRoot
LEO_WORKSPACE=$portableRoot/workspace
LEO_APPROVAL_ROOT=$portableRoot/workspace/approvals
LEO_WORKFLOW_ROOT=$portableRoot/workspace/workflows
LEO_MEMORY_ROOT=$portableRoot/workspace/memory
LEO_AUDIT_ROOT=$portableRoot/workspace/audit
LEO_AGENT_ROOT=$portableRoot/workspace/agents
LEO_BACKUP_ROOT=E:/LEO-Backups
LEO_COMMAND_WORKING_DIRECTORY=$portableRoot
LEO_OWNER_ID=owner
LEO_UI_TOKEN=$token
LEO_BACKUP_KEY=$backupKey
LEO_UI_HOST=127.0.0.1
LEO_UI_PORT=3000
LEO_POWERSHELL_EXECUTABLE=pwsh.exe
"@
  Set-Content -LiteralPath $envPath -Value $content -Encoding UTF8
  Write-Host "Created private .env configuration."
} else {
  Write-Host "Existing private .env preserved."
}

$dirs = @(
  (Join-Path $Root "workspace"),
  (Join-Path $Root "workspace/approvals"),
  (Join-Path $Root "workspace/workflows"),
  (Join-Path $Root "workspace/memory"),
  (Join-Path $Root "workspace/audit"),
  (Join-Path $Root "workspace/agents"),
  "E:\LEO-Backups"
)
foreach ($dir in $dirs) {
  New-Item -ItemType Directory -Path $dir -Force | Out-Null
}

if (-not (Test-Path (Join-Path $Root "node_modules"))) {
  Write-Host "Installing L.E.O. dependencies..."
  npm ci
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}

Write-Host ""
Write-Host "L.E.O. setup complete."
Write-Host "Project: $Root"
Write-Host "Backup: E:\LEO-Backups"
Write-Host "Next: run .\Launch-LEO.ps1"
