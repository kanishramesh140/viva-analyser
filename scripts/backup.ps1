$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$parent = Split-Path -Parent $projectRoot
$name = Split-Path -Leaf $projectRoot

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupPath = Join-Path $parent "${name}_backup_${timestamp}"

Copy-Item $projectRoot $backupPath -Recurse -Force

Write-Host ""
Write-Host "Backup created:" -ForegroundColor Green
Write-Host $backupPath
