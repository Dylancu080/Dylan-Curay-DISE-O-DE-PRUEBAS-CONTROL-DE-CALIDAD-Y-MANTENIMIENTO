const busquedaBinaria = require('./busquedaBinaria');

describe("Suite de Pruebas: Algoritmo de Búsqueda Binaria", function() {
    
    it("Debe encontrar un elemento en el medio del array", function() {
        const array = [1, 3, 5, 7, 9, 11];
        expect(busquedaBinaria(array, 7)).toBe(3);
    });

    it("Debe retornar -1 si el elemento no existe en el array", function() {
        const array = [1, 3, 5, 7, 9, 11];
        expect(busquedaBinaria(array, 4)).toBe(-1);
    });

    it("Debe encontrar el primer elemento (caso borde inferior)", function() {
        const array = [2, 4, 6, 8, 10];
        expect(busquedaBinaria(array, 2)).toBe(0);
    });

    it("Debe encontrar el último elemento (caso borde superior)", function() {
        const array = [2, 4, 6, 8, 10];
        expect(busquedaBinaria(array, 10)).toBe(4);
    });

    it("Debe manejar correctamente un array vacío", function() {
        const array = [];
        expect(busquedaBinaria(array, 5)).toBe(-1);
    });
});
