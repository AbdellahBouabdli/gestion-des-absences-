$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$jar = Join-Path $root 'backend/target/campus-presence-1.0.0.jar'

if (-not (Test-Path $jar)) {
    Write-Host "Le jar est absent. Lancez d'abord .\build.ps1" -ForegroundColor Yellow
    exit 1
}

Write-Host "Campus Présence démarre sur http://localhost:8080" -ForegroundColor Green
Write-Host "Comptes de démonstration : admin@univ.ma / teacher@univ.ma / student@univ.ma" -ForegroundColor DarkGray
Write-Host "Swagger : http://localhost:8080/swagger-ui.html" -ForegroundColor DarkGray
Write-Host ""

Push-Location (Join-Path $root 'backend')
try {
    java -jar $jar
} finally {
    Pop-Location
}
