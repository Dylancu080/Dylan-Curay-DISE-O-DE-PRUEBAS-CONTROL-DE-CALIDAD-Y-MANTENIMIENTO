/**
 * Mini-Framework Híbrido: Jasmine + fast-check + Advanced Spies
 * Extiende el ecosistema Jasmine con capacidades de property-based testing,
 * espías instrumentados con métricas de tiempo y orquestación de integración.
 */

'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// SECCIÓN 1: Advanced Spy
// Envuelve una función real y registra: conteo de llamadas, argumentos y
// tiempos de ejecución (en ms) para cada invocación.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @param {Function} fn  Función original a espiar
 * @returns {Function}   Función instrumentada con propiedad .calls
 */
function createAdvancedSpy(fn) {
    const callLog = [];

    function spy(...args) {
        const start = performance.now();
        let result;
        let errorThrown = null;

        try {
            result = fn.apply(this, args);
        } catch (err) {
            errorThrown = err;
        }

        const elapsed = performance.now() - start;

        callLog.push({
            args,
            elapsed,
            returnValue: result,
            error: errorThrown,
            timestamp: new Date().toISOString(),
        });

        if (errorThrown) throw errorThrown;
        return result;
    }

    spy.calls = {
        /** Todas las entradas registradas */
        all: () => callLog,
        /** Cuántas veces se invocó */
        count: () => callLog.length,
        /** Última entrada registrada */
        mostRecent: () => callLog[callLog.length - 1] ?? null,
        /** Tiempo promedio de ejecución en ms */
        avgElapsed: () => {
            if (callLog.length === 0) return 0;
            const total = callLog.reduce((sum, c) => sum + c.elapsed, 0);
            return total / callLog.length;
        },
        /** Imprime resumen en consola */
        summary: () => {
            console.log(`[AdvancedSpy] Llamadas: ${callLog.length}`);
            callLog.forEach((c, i) => {
                console.log(
                    `  #${i + 1} | args: ${JSON.stringify(c.args)} | elapsed: ${c.elapsed.toFixed(3)}ms | return: ${JSON.stringify(c.returnValue)}`
                );
            });
        },
        /** Reinicia el log */
        reset: () => callLog.splice(0),
    };

    return spy;
}

// ─────────────────────────────────────────────────────────────────────────────
// SECCIÓN 2: Integración con fast-check (Property-Based Testing)
// Expone helpers listos para usar en specs de Jasmine.
// ─────────────────────────────────────────────────────────────────────────────

let fc;
try {
    fc = require('fast-check');
} catch {
    fc = null;
}

/**
 * Ejecuta una propiedad fast-check dentro de un test de Jasmine.
 * Lanza error si la propiedad falla, para que Jasmine lo capture.
 *
 * @param {object}   arbitrary   Arbitrario fast-check (fc.array, fc.integer, etc.)
 * @param {Function} property    Función que recibe el valor generado y hace asserts
 * @param {object}   [options]   Opciones de fc.assert (numRuns, seed, etc.)
 */
function propertyTest(arbitrary, property, options = {}) {
    if (!fc) {
        throw new Error(
            'fast-check no está instalado. Ejecuta: npm install fast-check'
        );
    }
    fc.assert(fc.property(arbitrary, property), {
        numRuns: 500,
        ...options,
    });
}

/**
 * Acceso directo a los arbitrarios de fast-check.
 * Ejemplo: framework.fc.array(framework.fc.integer())
 */
const fcArbitraries = fc;

// ─────────────────────────────────────────────────────────────────────────────
// SECCIÓN 3: Orquestador de Pruebas de Integración
// Permite registrar pasos con nombre y ejecutarlos secuencialmente,
// acumulando resultados y midiendo tiempo total.
// ─────────────────────────────────────────────────────────────────────────────

class IntegrationOrchestrator {
    constructor(suiteName = 'Suite sin nombre') {
        this.suiteName = suiteName;
        this.steps = [];
        this.results = [];
    }

    /**
     * Registra un paso de integración.
     * @param {string}   name  Nombre descriptivo del paso
     * @param {Function} fn    Función síncrona o asíncrona a ejecutar
     */
    addStep(name, fn) {
        this.steps.push({ name, fn });
        return this;
    }

    /**
     * Ejecuta todos los pasos registrados en orden.
     * @returns {Promise<object[]>} Resultados por paso
     */
    async run() {
        this.results = [];
        const suiteStart = performance.now();

        console.log(`\n[Orchestrator] ▶ Iniciando: "${this.suiteName}"`);

        for (const step of this.steps) {
            const stepStart = performance.now();
            let status = 'PASS';
            let error = null;

            try {
                await step.fn();
            } catch (err) {
                status = 'FAIL';
                error = err.message;
            }

            const elapsed = performance.now() - stepStart;
            const entry = { name: step.name, status, elapsed, error };
            this.results.push(entry);

            const icon = status === 'PASS' ? '✔' : '✘';
            console.log(
                `  ${icon} [${status}] "${step.name}" — ${elapsed.toFixed(2)}ms${error ? ` | Error: ${error}` : ''}`
            );
        }

        const totalElapsed = performance.now() - suiteStart;
        const passed = this.results.filter(r => r.status === 'PASS').length;
        const failed = this.results.length - passed;

        console.log(
            `[Orchestrator] ■ Finalizado en ${totalElapsed.toFixed(2)}ms | ` +
            `✔ ${passed} pasados | ✘ ${failed} fallidos\n`
        );

        return this.results;
    }

    /** Devuelve true si todos los pasos pasaron */
    allPassed() {
        return this.results.every(r => r.status === 'PASS');
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECCIÓN 4: Matchers personalizados para Jasmine
// Agrega `toBeWithinRange` y `toBeTypeof` al ambiente global de Jasmine.
// ─────────────────────────────────────────────────────────────────────────────

const customMatchers = {
    /**
     * Uso: expect(valor).toBeWithinRange(min, max)
     */
    toBeWithinRange: () => ({
        compare(actual, min, max) {
            const pass = actual >= min && actual <= max;
            return {
                pass,
                message: pass
                    ? `Se esperaba que ${actual} NO estuviera en [${min}, ${max}]`
                    : `Se esperaba que ${actual} estuviera en [${min}, ${max}]`,
            };
        },
    }),

    /**
     * Uso: expect(valor).toBeTypeof('number')
     */
    toBeTypeof: () => ({
        compare(actual, expectedType) {
            const actualType = typeof actual;
            const pass = actualType === expectedType;
            return {
                pass,
                message: pass
                    ? `Se esperaba que el tipo NO fuera '${expectedType}'`
                    : `Se esperaba tipo '${expectedType}' pero se recibió '${actualType}'`,
            };
        },
    }),
};

/**
 * Llama esta función dentro de un beforeEach o beforeAll de Jasmine
 * para registrar los matchers personalizados:
 *   jasmine.addMatchers(framework.customMatchers);
 */

// ─────────────────────────────────────────────────────────────────────────────
// Exportaciones
// ─────────────────────────────────────────────────────────────────────────────

module.exports = {
    createAdvancedSpy,
    propertyTest,
    fc: fcArbitraries,
    IntegrationOrchestrator,
    customMatchers,
};
