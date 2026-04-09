# PowerShell script to clean and reinstall dependencies
# Run this as Administrator if you get permission errors

Write-Host "Cleaning up node_modules and package-lock.json..." -ForegroundColor Yellow

# Remove node_modules
if (Test-Path "node_modules") {
    Write-Host "Removing node_modules..." -ForegroundColor Cyan
    Remove-Item -Recurse -Force "node_modules" -ErrorAction SilentlyContinue
    if (Test-Path "node_modules") {
        Write-Host "Could not delete node_modules. Please:" -ForegroundColor Red
        Write-Host "   1. Close VS Code and all terminals" -ForegroundColor Red
        Write-Host "   2. Run this script as Administrator" -ForegroundColor Red
        Write-Host "   3. Or manually delete the node_modules folder" -ForegroundColor Red
        exit 1
    }
    Write-Host "node_modules removed" -ForegroundColor Green
} else {
    Write-Host "node_modules already removed" -ForegroundColor Green
}

# Remove package-lock.json
if (Test-Path "package-lock.json") {
    Write-Host "Removing package-lock.json..." -ForegroundColor Cyan
    Remove-Item -Force "package-lock.json"
    Write-Host "package-lock.json removed" -ForegroundColor Green
} else {
    Write-Host "package-lock.json already removed" -ForegroundColor Green
}

# Clean npm cache
Write-Host "Cleaning npm cache..." -ForegroundColor Cyan
npm cache clean --force

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host "Dependencies installed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "You can now run: npm run dev" -ForegroundColor Cyan
} else {
    Write-Host "Installation failed. Please check the errors above." -ForegroundColor Red
}
