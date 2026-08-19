$ErrorActionPreference = "Stop"

Set-Location (Split-Path -Parent $PSScriptRoot)

Write-Host "=== L.E.O. FINAL VERIFICATION ===" -ForegroundColor Cyan

Write-Host "`n[1/5] Installing dependencies..." -ForegroundColor Yellow
npm install

Write-Host "`n[2/5] TypeScript typecheck..." -ForegroundColor Yellow
npm run typecheck

Write-Host "`n[3/5] Full regression suite..." -ForegroundColor Yellow
npm test

Write-Host "`n[4/5] Web approval E2E..." -ForegroundColor Yellow
npm run test:web-e2e

Write-Host "`n[5/5] Git diff check..." -ForegroundColor Yellow
git diff --check

Write-Host "`n=== L.E.O. FINAL VERIFICATION PASSED ===" -ForegroundColor Green
git status --short
