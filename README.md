# Dylan Curay — Diseño de Pruebas, Control de Calidad y Mantenimiento

Proyecto final estructurado en tres módulos independientes.

---

## Módulo 1 — Pruebas con Jasmine + Framework Avanzado

**Carpeta:** `/spec` + `advanced-framework.js`

Implementación del algoritmo de **Búsqueda Binaria** con dos niveles de prueba:

| Archivo | Descripción |
|---------|-------------|
| `spec/busquedaBinaria.js` | Código fuente del algoritmo |
| `spec/busquedaBinaria.spec.js` | Suite estándar (5 specs) |
| `spec/busquedaBinaria.advanced.spec.js` | Property-Based Testing (fast-check), Contract Testing y Advanced Spy |
| `advanced-framework.js` | Mini-framework: `createAdvancedSpy`, `propertyTest`, `IntegrationOrchestrator` |
| `stryker.config.json` | Configuración de Mutation Testing (Stryker) |

### Comandos

```powershell
$env:NODE_OPTIONS="--use-system-ca"
npm install --no-audit --no-fund

# Suite estándar
npx jasmine spec/busquedaBinaria.spec.js

# Suite avanzada (PBT + Contract + Spy)
npx jasmine spec/busquedaBinaria.advanced.spec.js

# Mutation Testing
npx stryker run
```

---

## Módulo 2 — Control de Calidad: DOE, Cobertura y Análisis Estático

**Carpeta:** `/modulo2`

| Subcarpeta | Herramienta | Descripción |
|------------|-------------|-------------|
| `parte1-doe/` | PICT (Microsoft) | Pairwise testing: 1125 → 27 casos (-97.6%) |
| `parte2-cobertura/` | Jest + Istanbul | Cobertura 100% de sentencias, ramas y funciones |
| `parte2-eslint/` | ESLint | Detección de `no-unused-vars`, `no-undef`, `eqeqeq` |

### Comandos

```powershell
$env:NODE_OPTIONS="--use-system-ca"
cd modulo2
npm install --no-audit --no-fund

# Cobertura 100% con Jest
npx jest parte2-cobertura/binarySearch.test.js --coverage

# Análisis estático ESLint (muestra 3 errores intencionales)
npm run lint

# PICT (opcional, requiere PICT instalado)
cd parte1-doe
pict model.txt
```

---

## Módulo 3 — Orquestador Combinatorio con Machine Learning

**Carpeta:** `/modulo3-ml`

Script Python que:
1. Genera combinaciones de factores con `itertools.product` (5 factores).
2. Crea un dataset histórico simulado de 1000 ejecuciones con etiquetas de riesgo.
3. Entrena un `RandomForestClassifier` (scikit-learn).
4. Predice el nivel de riesgo (🔴 Crítico / 🟠 Alto / 🟡 Medio / 🟢 Bajo) de cada combinación.
5. Exporta `reporte_riesgo.json`.

### Comandos

```powershell
cd modulo3-ml
pip install -r requirements.txt
python orchestrator.py
```

---

## Pipeline CI/CD

**Archivo:** `.github/workflows/testing-pipeline.yml`

6 jobs en GitHub Actions:

1. Análisis Estático (ESLint)
2. Pruebas Jasmine (estándar + avanzadas)
3. Cobertura Jest (umbral 100%)
4. Mutation Testing (Stryker)
5. Orquestador ML (Python)
6. Resumen del pipeline

---

## Ejecución Local Completa

```powershell
$env:NODE_OPTIONS="--use-system-ca"
.\run-all.ps1
```

El script instala todo e indica **qué captura tomar en cada paso** para el informe.

---

## Estructura del Repositorio

```
├── advanced-framework.js
├── package.json
├── stryker.config.json
├── run-all.ps1
├── .github/
│   └── workflows/
│       └── testing-pipeline.yml
├── spec/
│   ├── busquedaBinaria.js
│   ├── busquedaBinaria.spec.js
│   └── busquedaBinaria.advanced.spec.js
├── modulo2/
│   ├── package.json
│   ├── parte1-doe/
│   │   ├── model.txt
│   │   └── resultado-pairwise.txt
│   ├── parte2-cobertura/
│   │   ├── binarySearch.js
│   │   ├── binarySearch.test.js
│   │   └── binarySearch.baja-cobertura.test.js
│   └── parte2-eslint/
│       ├── binarySearchBad.js
│       └── .eslintrc.json
└── modulo3-ml/
    ├── orchestrator.py
    └── requirements.txt
```
