const add = require('./ship')

test("simple addition.", () => {
    expect(add(1, 2)).toBe(3)
})