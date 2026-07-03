$ErrorActionPreference = "Continue"
$ROOT = $PSScriptRoot

function Write-Header($text) {
    Write-Host ""
    Write-Host ("=" * 60) -ForegroundColor Cyan
    Write-Host "  $text" -ForegroundColor Cyan
    Write-Host ("=" * 60) -ForegroundColor Cyan
}

function Write-OK($text) {
    Write-Host "  OK: $text" -ForegroundColor Green
}

function Write-Fail($text) {
    Write-Host "  FAIL: $text" -ForegroundColor Red
}

Write-Header "Configuracion de entorno"

$env:NODE_OPTIONS = "--use-system-ca"
Write-OK "NODE_OPTIONS=$env:NODE_OPTIONS"
Set-Location $ROOT

Write-Header "Dependencias raiz"
npm install --no-audit --no-fund
Write-OK "Dependencias raiz instaladas"

Write-Header "Dependencias modulo2"
Set-Location "$ROOT\modulo2"
npm install --no-audit --no-fund
Write-OK "Dependencias modulo2 instaladas"
Set-Location $ROOT

Write-Header "Dependencias Python"
$pythonOk = $false
try {
    $null = python --version 2>&1
    if ($LASTEXITCODE -eq 0 -or $?) {
        $pythonOk = $true
    }
} catch {
    $pythonOk = $false
}

if ($pythonOk) {
    pip install -r "$ROOT\modulo3-ml\requirements.txt" --quiet
    Write-OK "Dependencias Python instaladas"
} else {
    Write-Fail "Python no encontrado"
}

Write-Header "ESLint"
Set-Location "$ROOT\modulo2"
npm run lint
Set-Location $ROOT

Write-Header "Jest coverage"
Set-Location "$ROOT\modulo2"
npx jest parte2-cobertura/binarySearch.test.js --coverage
Set-Location $ROOT

Write-Header "Jasmine"
npx jasmine spec/busquedaBinaria.spec.js

Write-Header "Jasmine advanced"
npx jasmine spec/busquedaBinaria.advanced.spec.js

Write-Header "Stryker"
npx stryker run

Write-Header "Orquestador ML"
if ($pythonOk) {
    Set-Location "$ROOT\modulo3-ml"
    python orchestrator.py
    Set-Location $ROOT
} else {
    Write-Fail "Python no disponible"
}

Write-Header "Ejecucion completada"
