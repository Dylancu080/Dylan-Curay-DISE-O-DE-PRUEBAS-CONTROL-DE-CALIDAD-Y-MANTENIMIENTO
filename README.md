# Dylan Curay - Diseno de Pruebas, Control de Calidad y Mantenimiento

Proyecto final en tres modulos.

## Modulo 1 - Jasmine y framework avanzado

Carpeta: `spec/` y `advanced-framework.js`

| Archivo | Descripcion |
|---------|-------------|
| `spec/busquedaBinaria.js` | Algoritmo de busqueda binaria |
| `spec/busquedaBinaria.spec.js` | Suite Jasmine base |
| `spec/busquedaBinaria.advanced.spec.js` | Property-based, contract testing y advanced spy |
| `advanced-framework.js` | Spies, property testing y orquestador |
| `stryker.config.json` | Mutation testing |

```powershell
$env:NODE_OPTIONS="--use-system-ca"
npm install --no-audit --no-fund
npx jasmine spec/busquedaBinaria.spec.js
npx jasmine spec/busquedaBinaria.advanced.spec.js
npx stryker run
```

## Modulo 2 - DOE, cobertura y analisis estatico

Carpeta: `modulo2/`

| Subcarpeta | Herramienta |
|------------|-------------|
| `parte1-doe/` | Pairwise (PICT) |
| `parte2-cobertura/` | Jest + cobertura |
| `parte2-eslint/` | ESLint |

```powershell
$env:NODE_OPTIONS="--use-system-ca"
cd modulo2
npm install --no-audit --no-fund
npx jest parte2-cobertura/binarySearch.test.js --coverage
npm run lint
```

## Modulo 3 - Orquestador combinatorio con ML

Carpeta: `modulo3-ml/`

Genera combinaciones con `itertools`, entrena un `RandomForestClassifier` y predice riesgo por caso.

```powershell
cd modulo3-ml
pip install -r requirements.txt
python orchestrator.py
```

## Pipeline CI/CD

Archivo: `.github/workflows/testing-pipeline.yml`

Jobs: ESLint, Jasmine, Jest coverage, Stryker y orquestador Python.

## Ejecucion local

```powershell
$env:NODE_OPTIONS="--use-system-ca"
.\run-all.ps1
```

## Estructura

```
├── advanced-framework.js
├── package.json
├── stryker.config.json
├── run-all.ps1
├── .github/workflows/testing-pipeline.yml
├── spec/
├── modulo2/
└── modulo3-ml/
```
