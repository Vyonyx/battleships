const {ship, gameBoard, player} = require('./ship')

const randCoordMock = jest.fn()
const gridMock = jest.fn()

describe('Ship factory.', () => {

    test('Obtain the length of a given ship.', () => {
        expect(ship('carrier').length).toBe(5)
        expect(ship('destroyer').length).toBe(2)
    })

    test('Get ship type', () => {
        expect(ship('carrier').getType()).toBe('carrier')
    })

    test('Register a hit on the ship.', () => {
        const newShip = ship('destroyer')
        newShip.hit(0)
        expect(newShip.segments).toEqual(['hit', 'safe'])
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

    test('Create a nested array representing the gameboard grids based on an input number.', () => {
        const gridCount = 5
        const expected = Array.from(Array(gridCount), () => new Array(gridCount).fill(' '))
        expect(gameBoard(gridCount).grid).toEqual(expected)
    })

    test('Initialise a ship object and store within a gameboard.', () => {
        const newBoard = gameBoard(10)
        const newDestroyer = ship('destroyer')
        const newCarrier = ship('carrier')
        newBoard.assignShipPosition(newDestroyer, 0, 0, 'horizontal')
        newBoard.assignShipPosition(newCarrier, 1, 1, 'vertical')
        const expected = [
            [{ xPos: 0, yPos: 0 }, { xPos: 1, yPos: 0 }],
            [{xPos: 1, yPos: 1}, {xPos: 1, yPos: 2}, {xPos: 1, yPos: 3}, {xPos: 1, yPos: 4}, {xPos: 1, yPos: 5}]
        ]
        expect(newBoard.shipsData[0].ship.segments).toEqual(expect.arrayContaining(expected[0]))
        expect(newBoard.shipsData[1].ship.segments).toEqual(expect.arrayContaining(expected[1]))
    })

    test('Mark gameboard with ship segments.', () => {
        const newShip = ship('carrier')
        const newBoard = gameBoard(10)
        newBoard.assignShipPosition(newShip, 0, 0, 'horizontal')
        const expected = ['carrier', 'carrier', 'carrier', 'carrier', 'carrier', ' ', ' ', ' ', ' ', ' ']
        expect(newBoard.grid[0]).toEqual(expected)
    })

    test('Negate ship placement if segments with an already existing ship location.', () => {
        const newBoard = gameBoard(10)
        const newDestroyer = ship('destroyer')
        const newCarrier = ship('carrier')
        newBoard.assignShipPosition(newDestroyer, 0, 0, 'horizontal')
        expect(() => { newBoard.assignShipPosition(newCarrier, 0, 0, 'vertical') }).toThrow()
    })
        
    test('Receive attack function and determines if ship is hit and finally sends calls hit function on ship.', () => {
        const newBoard = gameBoard(10)
        const newDestroyer = ship('destroyer')
        const newCarrier = ship('carrier')
        newBoard.assignShipPosition(newDestroyer, 0, 0, 'vertical')
        newBoard.assignShipPosition(newCarrier, 1, 0, 'vertical')
        newBoard.attack(0, 0)
        newBoard.attack(0, 1)
        expect(newDestroyer.hitsTaken()).toBe(2)
        newBoard.attack(1, 0)
        newBoard.attack(1, 1)
        expect(newCarrier.hitsTaken()).toBe(2)
    })

    test('Cannot declare attack on same square more than once.', () => {
        const newBoard = gameBoard(10)
        const newDestroyer = ship('destroyer')
        newBoard.assignShipPosition(newDestroyer, 0, 0, 'vertical')
        newBoard.attack(0, 0)
        expect(() => { newBoard.attack(0, 0) }).toThrow()
    })
    test('Keep track of missed attacks so that they can used for display.', () => {
        const newBoard = gameBoard(10)
        const newDestroyer = ship('destroyer')
        newBoard.assignShipPosition(newDestroyer, 0, 0, 'vertical')
        newBoard.attack(0, 0)
        newBoard.attack(0, 1)
        newBoard.attack(1, 1)
        expect(newBoard.attackedPositions.length).toBe(3)

    })
    test('Report whether all ships have been sunken.', () => {
        const newBoard = gameBoard(10)
        const newDestroyer = ship('destroyer')
        newBoard.assignShipPosition(newDestroyer, 0, 0, 'vertical')
        newBoard.attack(0, 0)
        newBoard.attack(0, 1)

        const newCarrier = ship('carrier')
        newBoard.assignShipPosition(newCarrier, 1, 0, 'horizontal')
        newBoard.attack(1, 0)
        newBoard.attack(2, 0)
        newBoard.attack(3, 0)
        newBoard.attack(4, 0)
        newBoard.attack(5, 0)

        expect(newBoard.shipsSunken()).toBe(true)
    })

})



describe('Player tests (inc. AI).', () => {

    test('Allow AI player to get available moves for random selection.', () => {
        const myBoard = gameBoard(10)
        const enemy = gameBoard(10)
        const aiPlayer = player(myBoard, enemy)
        aiPlayer.randomAttack( {x: 0, y: 0} )
        aiPlayer.randomAttack( {x: 1, y: 0} )

        expect(aiPlayer.enemy.availableMoves()).toEqual(expect.not.arrayContaining( [{x: 0, y: 0}] ))
    })

    test('Use random move to declare AI attack.', () => {
        const myBoard = gameBoard(10)
        const enemy = gameBoard(10)
        const aiPlayer = player(myBoard, enemy)
        aiPlayer.randomAttack()
        expect(aiPlayer.enemy.attackedPositions.length).toBe(1)
    })

    test('Confirm all ships have sunken.', () => {
        const myBoard = gameBoard(10)
        const enemy = gameBoard(10)
        const newDestroyer = ship('destroyer')
        const aiPlayer = player(myBoard, enemy)

        enemy.assignShipPosition(newDestroyer, 0, 0, 'vertical')

        randCoordMock.mockReturnValueOnce( {x: 0, y: 0} )
        randCoordMock.mockReturnValueOnce( {x: 0, y: 1} )
        
        aiPlayer.attack(randCoordMock())
        aiPlayer.attack(randCoordMock())

        expect(aiPlayer.enemy.shipsSunken()).toBe(true)

    })
})