$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "==> Installation et build du frontend" -ForegroundColor Cyan
Push-Location (Join-Path $root 'frontend')
try {
    npm ci --no-audit --no-fund
    if ($LASTEXITCODE -ne 0) { throw "npm ci a échoué" }
    npm run build
    if ($LASTEXITCODE -ne 0) { throw "le build frontend a échoué" }
} finally {
    Pop-Location
}

Write-Host "==> Copie du frontend dans les ressources Spring Boot" -ForegroundColor Cyan
$static = Join-Path $root 'backend/src/main/resources/static'
New-Item -ItemType Directory -Force -Path $static | Out-Null
Copy-Item -Path (Join-Path $root 'frontend/dist/*') -Destination $static -Recurse -Force

Write-Host "==> Tests et package du backend" -ForegroundColor Cyan
Push-Location (Join-Path $root 'backend')
try {
    mvn clean package
    if ($LASTEXITCODE -ne 0) { throw "le build backend a échoué" }
} finally {
    Pop-Location
}

Write-Host ""
Write-Host "Application prête : backend/target/campus-presence-1.0.0.jar" -ForegroundColor Green
Write-Host "Lancez .\run.ps1 puis ouvrez http://localhost:8080" -ForegroundColor Green
