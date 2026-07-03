function binarySearchBad(arr, target) {
    let left = 0;
    let right = arr.length - 1;
    let iteraciones = 0; // Anomalia 1: variable no usada

    while (left <= right) {
        mid = Math.floor((left + right) / 2); // Anomalia 2: variable no declarada

        if (arr[mid] == target) { // Anomalia 3: deberia ser ===
            return mid;
        } else if (arr[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    return -1;
}

module.exports = binarySearchBad;
