// Implementación del algoritmo de Búsqueda Binaria
function busquedaBinaria(array, objetivo) {
    let inicio = 0;
    let fin = array.length - 1;

    while (inicio <= fin) {
        let medio = Math.floor((inicio + fin) / 2);

        if (array[medio] === objetivo) {
            return medio; // Elemento encontrado
        } else if (array[medio] < objetivo) {
            inicio = medio + 1; // Buscar en la mitad derecha
        } else {
            fin = medio - 1; // Buscar en la mitad izquierda
        }
    }
    return -1; // Elemento no encontrado
}

module.exports = busquedaBinaria;
