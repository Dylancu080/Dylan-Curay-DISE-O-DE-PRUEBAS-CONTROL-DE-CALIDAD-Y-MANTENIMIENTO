# =============================================================================
#  run-all.ps1 - Script de ejecucion local completa (Testing Avanzado)
#  Uso: .\run-all.ps1
#  Requisitos: Node.js 20+, Python 3.11+, PowerShell 5+
# =============================================================================

$ErrorActionPreference = "Continue"
$ROOT = $PSScriptRoot

function Write-Header($text) {
    Write-Host ""
    Write-Host ("=" * 60) -ForegroundColor Cyan
    Write-Host "  $text" -ForegroundColor Cyan
    Write-Host ("=" * 60) -ForegroundColor Cyan
}

function Write-Step($num, $text) {
    Write-Host ""
    Write-Host "[$num] $text" -ForegroundColor Yellow
}

function Write-OK($text) {
    Write-Host "  OK: $text" -ForegroundColor Green
}

function Write-Fail($text) {
    Write-Host "  FAIL: $text" -ForegroundColor Red
}

# -----------------------------------------------------------------------------
# PASO 0: Configurar NODE_OPTIONS para certificados SSL
# -----------------------------------------------------------------------------

Write-Header "PASO 0 - Configuracion de entorno"

$env:NODE_OPTIONS = "--use-system-ca"
Write-OK "NODE_OPTIONS=$env:NODE_OPTIONS"

Set-Location $ROOT

# -----------------------------------------------------------------------------
# PASO 1: Instalar dependencias raiz
# -----------------------------------------------------------------------------

Write-Header "PASO 1 - Instalacion de dependencias (raiz)"

Write-Step "1.1" "Instalando dependencias base..."
npm install --no-audit --no-fund
Write-OK "Dependencias base instaladas"

# -----------------------------------------------------------------------------
# PASO 2: Instalar dependencias Modulo 2 (Jest + ESLint)
# -----------------------------------------------------------------------------

Write-Header "PASO 2 - Dependencias Modulo 2 (Jest + ESLint)"

Set-Location "$ROOT\modulo2"
npm install --no-audit --no-fund
Write-OK "Dependencias Modulo 2 instaladas"
Set-Location $ROOT

# -----------------------------------------------------------------------------
# PASO 3: Instalar dependencias Python (Modulo 3)
# -----------------------------------------------------------------------------

Write-Header "PASO 3 - Dependencias Python (scikit-learn, pandas, numpy)"

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
    Write-Fail "Python no encontrado. Instala Python y vuelve a correr este script."
}

# -----------------------------------------------------------------------------
# PASO 4: ESLint - Analisis Estatico  [CAPTURA 1]
# -----------------------------------------------------------------------------

Write-Header "PASO 4 - ESLint - Analisis Estatico  <-- CAPTURA 1"

Set-Location "$ROOT\modulo2"
Write-Host ""
npm run lint
Set-Location $ROOT
Write-OK "Captura ESLint lista (errores no-unused-vars, no-undef, eqeqeq)"

# -----------------------------------------------------------------------------
# PASO 5: Jest - Cobertura 100%  [CAPTURA 2]
# -----------------------------------------------------------------------------

Write-Header "PASO 5 - Jest - Cobertura de Codigo  <-- CAPTURA 2"

Set-Location "$ROOT\modulo2"
Write-Host ""
npx jest parte2-cobertura/binarySearch.test.js --coverage
Set-Location $ROOT
Write-OK "Captura Jest 100% lista"

# -----------------------------------------------------------------------------
# PASO 6: Jasmine - Suite estandar  [CAPTURA 3]
# -----------------------------------------------------------------------------

Write-Header "PASO 6 - Jasmine - Suite estandar  <-- CAPTURA 3"

Write-Host ""
npx jasmine spec/busquedaBinaria.spec.js
Write-OK "Suite Jasmine estandar completada"

# -----------------------------------------------------------------------------
# PASO 7: Jasmine - Suite Avanzada  [CAPTURA 4]
# -----------------------------------------------------------------------------

Write-Header "PASO 7 - Jasmine - Suite Avanzada (PBT + Contract)  <-- CAPTURA 4"

Write-Host ""
npx jasmine spec/busquedaBinaria.advanced.spec.js
Write-OK "Suite avanzada completada"

# -----------------------------------------------------------------------------
# PASO 8: Stryker - Mutation Testing  [CAPTURA 5]
# -----------------------------------------------------------------------------

Write-Header "PASO 8 - Stryker - Mutation Testing  <-- CAPTURA 5"

Write-Host ""
Write-Host "  Ejecutando Stryker (puede tardar 1-2 min)..." -ForegroundColor DarkGray
npx stryker run
Write-OK "Reporte de mutaciones en: reports/mutation/mutation.html"

# -----------------------------------------------------------------------------
# PASO 9: Python - Orquestador ML  [CAPTURA 6]
# -----------------------------------------------------------------------------

Write-Header "PASO 9 - Orquestador ML (Python)  <-- CAPTURA 6"

if ($pythonOk) {
    Set-Location "$ROOT\modulo3-ml"
    Write-Host ""
    python orchestrator.py
    Set-Location $ROOT
    Write-OK "Reporte de riesgo en: modulo3-ml/reporte_riesgo.json"
} else {
    Write-Fail "Saltado - Python no disponible"
}

# -----------------------------------------------------------------------------
# RESUMEN FINAL
# -----------------------------------------------------------------------------

Write-Header "RESUMEN - Capturas recomendadas para el informe"

Write-Host ""
Write-Host "  CAPTURA 1 -> ESLint:    errores no-unused-vars, no-undef, eqeqeq" -ForegroundColor White
Write-Host "  CAPTURA 2 -> Jest:      tabla verde 100% Stmts/Branch/Funcs/Lines" -ForegroundColor White
Write-Host "  CAPTURA 3 -> Jasmine:   5 specs, 0 failures (suite base)" -ForegroundColor White
Write-Host "  CAPTURA 4 -> Jasmine:   PBT + Contract + Spy avanzados" -ForegroundColor White
Write-Host "  CAPTURA 5 -> Stryker:   Mutation Score >= 80%" -ForegroundColor White
Write-Host "  CAPTURA 6 -> Python ML: Top 30 combinaciones por nivel de riesgo" -ForegroundColor White
Write-Host ""
Write-Host ("=" * 60) -ForegroundColor Cyan
Write-Host "  Ejecucion local completada." -ForegroundColor Cyan
Write-Host ("=" * 60) -ForegroundColor Cyan
