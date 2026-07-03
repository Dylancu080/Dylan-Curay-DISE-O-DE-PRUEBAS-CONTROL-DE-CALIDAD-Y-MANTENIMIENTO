const binarySearch = require('./binarySearch');

test('Encuentra el elemento en el medio', () => {
    expect(binarySearch([1, 2, 3, 4, 5], 3)).toBe(2);
});
