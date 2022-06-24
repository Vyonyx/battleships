const ship = require('./ship')

describe('Ship outputs', () => {
    test('Obtain the length of a given ship.', () => {
        expect(ship(5).length).toBe(5)
        expect(ship('carrier').length).toBe(5)
        expect(ship('destroyer').length).toBe(2)
    })

    test('Communicate how many times it has been hit.', () => {
        const newShip = ship('destroyer')
        newShip.hit(2)
        expect(newShip.hitsTaken()).toBe(2)
    })

    test('Communicate if it has sunken yet.', () => {
        const newShip = ship('carrier')
        newShip.hit()
        expect(newShip.isSunken()).toBe(false)
        newShip.hit(4)
        expect(newShip.isSunken()).toBe(true)
    })
})