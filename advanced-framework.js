'use strict';

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
        all: () => callLog,
        count: () => callLog.length,
        mostRecent: () => callLog[callLog.length - 1] ?? null,
        avgElapsed: () => {
            if (callLog.length === 0) return 0;
            const total = callLog.reduce((sum, c) => sum + c.elapsed, 0);
            return total / callLog.length;
        },
        summary: () => {
            console.log(`[AdvancedSpy] Llamadas: ${callLog.length}`);
            callLog.forEach((c, i) => {
                console.log(
                    `  #${i + 1} | args: ${JSON.stringify(c.args)} | elapsed: ${c.elapsed.toFixed(3)}ms | return: ${JSON.stringify(c.returnValue)}`
                );
            });
        },
        reset: () => callLog.splice(0),
    };

    return spy;
}

let fc;
try {
    fc = require('fast-check');
} catch {
    fc = null;
}

function propertyTest(arbitrary, property, options = {}) {
    if (!fc) {
        throw new Error('fast-check no esta instalado. Ejecuta: npm install fast-check');
    }
    fc.assert(fc.property(arbitrary, property), {
        numRuns: 500,
        ...options,
    });
}

const fcArbitraries = fc;

class IntegrationOrchestrator {
    constructor(suiteName = 'Suite sin nombre') {
        this.suiteName = suiteName;
        this.steps = [];
        this.results = [];
    }

    addStep(name, fn) {
        this.steps.push({ name, fn });
        return this;
    }

    async run() {
        this.results = [];
        const suiteStart = performance.now();

        console.log(`\n[Orchestrator] Iniciando: "${this.suiteName}"`);

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

            console.log(
                `  [${status}] "${step.name}" - ${elapsed.toFixed(2)}ms${error ? ` | Error: ${error}` : ''}`
            );
        }

        const totalElapsed = performance.now() - suiteStart;
        const passed = this.results.filter(r => r.status === 'PASS').length;
        const failed = this.results.length - passed;

        console.log(
            `[Orchestrator] Finalizado en ${totalElapsed.toFixed(2)}ms | ` +
            `${passed} pasados | ${failed} fallidos\n`
        );

        return this.results;
    }

    allPassed() {
        return this.results.every(r => r.status === 'PASS');
    }
}

const customMatchers = {
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

    toBeTypeof: () => ({
        compare(actual, expectedType) {
            const actualType = typeof actual;
            const pass = actualType === expectedType;
            return {
                pass,
                message: pass
                    ? `Se esperaba que el tipo NO fuera '${expectedType}'`
                    : `Se esperaba tipo '${expectedType}' pero se recibio '${actualType}'`,
            };
        },
    }),
};

module.exports = {
    createAdvancedSpy,
    propertyTest,
    fc: fcArbitraries,
    IntegrationOrchestrator,
    customMatchers,
};
