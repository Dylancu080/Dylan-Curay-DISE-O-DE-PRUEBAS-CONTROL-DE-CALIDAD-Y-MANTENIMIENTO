function binarySearchBad(arr, target) {
    let left = 0;
    let right = arr.length - 1;
    let iteraciones = 0;

    while (left <= right) {
        mid = Math.floor((left + right) / 2);

        if (arr[mid] == target) {
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
