const binarySearch = require('./binarySearch');

describe('Binary Search Coverage', () => {
    test('Encuentra el elemento', () => {
        expect(binarySearch([1, 2, 3, 4, 5], 3)).toBe(2);
    });

    test('Busca en la mitad derecha', () => {
        expect(binarySearch([1, 2, 3, 4, 5], 5)).toBe(4);
    });

    test('Busca en la mitad izquierda', () => {
        expect(binarySearch([1, 2, 3, 4, 5], 1)).toBe(0);
    });

    test('Elemento no existe (retorna -1)', () => {
        expect(binarySearch([1, 2, 3], 10)).toBe(-1);
    });

    test('Arreglo vacio', () => {
        expect(binarySearch([], 5)).toBe(-1);
    });
});
