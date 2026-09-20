$ErrorActionPreference = "Stop"

Write-Host "Checking Node.js..." -ForegroundColor Cyan
node --version
npm --version

Write-Host ""
Write-Host "Installing root dependencies..." -ForegroundColor Cyan
npm install

Write-Host ""
Write-Host "Installing client dependencies..." -ForegroundColor Cyan
Set-Location "$PSScriptRoot\..\client"
npm install

Write-Host ""
Write-Host "Installing server dependencies..." -ForegroundColor Cyan
Set-Location "$PSScriptRoot\..\server"
npm install

Write-Host ""
Write-Host "Setup complete." -ForegroundColor Green
