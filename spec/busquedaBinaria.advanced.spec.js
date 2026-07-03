'use strict';

const busquedaBinaria = require('./busquedaBinaria');
const framework = require('../advanced-framework');

// Mutation testing: npx stryker run (ver stryker.config.json)

describe('[PBT] Busqueda Binaria - Property-Based Testing (fast-check)', function () {

    beforeEach(function () {
        jasmine.addMatchers(framework.customMatchers);
    });

    it('PROP-01: Si el elemento existe en el array, el indice devuelto es correcto', function () {
        const sortedUniqueArray = framework.fc
            .array(framework.fc.integer({ min: -10000, max: 10000 }), {
                minLength: 1,
                maxLength: 200,
            })
            .map(arr => [...new Set(arr)].sort((a, b) => a - b));

        framework.propertyTest(
            sortedUniqueArray,
            (arr) => {
                const targetIdx = Math.floor(arr.length / 2);
                const target = arr[targetIdx];
                const result = busquedaBinaria(arr, target);

                if (result !== targetIdx) {
                    throw new Error(
                        `[FALLA PBT] arr=${JSON.stringify(arr)}, ` +
                        `target=${target}, esperado=${targetIdx}, obtenido=${result}`
                    );
                }
            }
        );
    });

    it('PROP-02: Si el elemento NO existe, siempre devuelve -1', function () {
        const scenario = framework.fc.tuple(
            framework.fc
                .array(framework.fc.integer({ min: 0, max: 9000 }), {
                    minLength: 0,
                    maxLength: 150,
                })
                .map(arr => [...new Set(arr)].sort((a, b) => a - b)),
            framework.fc.integer({ min: 10001, max: 20000 })
        );

        framework.propertyTest(scenario, ([arr, target]) => {
            const result = busquedaBinaria(arr, target);
            if (result !== -1) {
                throw new Error(
                    `[FALLA PBT] target ${target} no deberia estar en el array, ` +
                    `pero busquedaBinaria devolvio indice ${result}`
                );
            }
        });
    });

    it('PROP-03: El resultado siempre esta dentro del rango valido [-1, arr.length-1]', function () {
        const scenario = framework.fc.tuple(
            framework.fc
                .array(framework.fc.integer({ min: -500, max: 500 }), { maxLength: 100 })
                .map(arr => [...new Set(arr)].sort((a, b) => a - b)),
            framework.fc.integer({ min: -500, max: 500 })
        );

        framework.propertyTest(scenario, ([arr, target]) => {
            const result = busquedaBinaria(arr, target);
            const minValid = -1;
            const maxValid = arr.length - 1;

            if (result < minValid || result > maxValid) {
                throw new Error(
                    `[FALLA PBT] resultado ${result} fuera del rango [${minValid}, ${maxValid}]`
                );
            }
        });
    });
});

describe('[CONTRACT] Busqueda Binaria - Contract Testing', function () {

    beforeEach(function () {
        jasmine.addMatchers(framework.customMatchers);
    });

    it('CONTRACT-01: El retorno SIEMPRE es de tipo number', function () {
        const casos = [
            { arr: [1, 3, 5, 7, 9], target: 5 },
            { arr: [1, 3, 5, 7, 9], target: 99 },
            { arr: [], target: 1 },
            { arr: [-10, 0, 10], target: 0 },
            { arr: [42], target: 42 },
        ];
        casos.forEach(({ arr, target }) => {
            const result = busquedaBinaria(arr, target);
            expect(result).toBeTypeof('number');
        });
    });

    it('CONTRACT-02: El retorno NUNCA es null ni undefined', function () {
        const casos = [
            { arr: [2, 4, 6], target: 2 },
            { arr: [2, 4, 6], target: 3 },
            { arr: [], target: 0 },
        ];
        casos.forEach(({ arr, target }) => {
            const result = busquedaBinaria(arr, target);
            expect(result).not.toBeNull();
            expect(result).not.toBeUndefined();
        });
    });

    it('CONTRACT-03: El retorno NUNCA es NaN', function () {
        const result1 = busquedaBinaria([1, 2, 3], 2);
        const result2 = busquedaBinaria([1, 2, 3], 99);
        expect(isNaN(result1)).toBeFalse();
        expect(isNaN(result2)).toBeFalse();
    });

    it('CONTRACT-04: El indice devuelto apunta al elemento correcto cuando no es -1', function () {
        const arr = [10, 20, 30, 40, 50];
        const target = 30;
        const idx = busquedaBinaria(arr, target);

        if (idx !== -1) {
            expect(arr[idx]).toBe(target);
        } else {
            fail('Se esperaba encontrar el elemento 30 en el array');
        }
    });
});

describe('[SPY] Busqueda Binaria - Advanced Spy con metricas de tiempo', function () {

    let spiedBusqueda;

    beforeEach(function () {
        spiedBusqueda = framework.createAdvancedSpy(busquedaBinaria);
    });

    afterEach(function () {
        spiedBusqueda.calls.summary();
        spiedBusqueda.calls.reset();
    });

    it('SPY-01: Registra correctamente el numero de llamadas', function () {
        spiedBusqueda([1, 3, 5], 3);
        spiedBusqueda([1, 3, 5], 99);
        spiedBusqueda([], 0);

        expect(spiedBusqueda.calls.count()).toBe(3);
    });

    it('SPY-02: Registra el valor de retorno de la ultima llamada', function () {
        spiedBusqueda([10, 20, 30, 40], 30);
        const last = spiedBusqueda.calls.mostRecent();

        expect(last.returnValue).toBe(2);
    });

    it('SPY-03: El tiempo de ejecucion promedio es un numero positivo', function () {
        spiedBusqueda([1, 2, 3, 4, 5], 3);
        spiedBusqueda([1, 2, 3, 4, 5], 5);

        const avg = spiedBusqueda.calls.avgElapsed();
        expect(typeof avg).toBe('number');
        expect(avg).toBeGreaterThanOrEqual(0);
    });
});
