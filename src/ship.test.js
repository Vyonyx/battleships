const {ship, gameBoard} = require('./ship')

describe('Ship factory.', () => {

    test('Obtain the length of a given ship.', () => {
        expect(ship(5).length).toBe(5)
        expect(ship('carrier').length).toBe(5)
        expect(ship('destroyer').length).toBe(2)
    })

    test('Register a hit on the ship.', () => {
        const newShip = ship('destroyer')
        newShip.hit(0)
        console.log(newShip.getSegments())
        expect(newShip.getSegments()).toEqual(['hit', 'safe'])
    })

    test('Communicate how many times it has been hit.', () => {
        const newShip = ship('destroyer')
        newShip.hit(0, 1)
        expect(newShip.hitsTaken()).toBe(2)
    })

    test('Communicate if it has sunken yet.', () => {
        const newShip = ship('carrier')
        newShip.hit(0)
        expect(newShip.isSunken()).toBe(false)
        newShip.hit(1, 2, 3, 4)
        expect(newShip.isSunken()).toBe(true)
    })

})



describe('Gameboard inputs.', () => {

    test('Create a nested array based on number of grids required.', () => {
        const cellCount = 5
        const expected = Array(cellCount).fill(Array(cellCount).fill('x'))
        expect(gameBoard(cellCount).gameGrid).toEqual(expected)
    })

    test('Assign ship position based on coordinates.', () => {
        const x = 0
        const y = 0
        const ship = 'carrier'

        const newBoard = gameBoard()
        newBoard.assignShipPosition(ship, x, y)
        expect(newBoard.shipPositions()).toEqual([{ship: 'carrier', xPos: x, yPos: y}])
    })

    test.todo('Place ships at a specified location by calling ship factory function.')
    test.todo('Receive attack function and determines if ship is hit and finally sends calls hit function on ship.')
    test.todo('Keep track of missed attacks so that they can used for display.')
    test.todo('Report whether all ships have been sunken.')

})