function ship(lengthID) {

    const shipTypes = {
        'carrier': 5,
        'battleship': 4,
        'cruiser': 3,
        'destroyer': 2
    }
    const length = typeof lengthID == 'number' ? lengthID : shipTypes[lengthID]
    let segments = Array(length).fill('safe')


    return {
        length,
        hit: function(...arg) { [...arg].forEach(x => segments[x] = 'hit') },
        hitsTaken: () => segments.filter(seg => seg === 'hit').length,
        isSunken: () => segments.filter(seg => seg === 'hit').length >= length ? true : false,
        getSegments: () => segments
    }
}

function gameBoard(gridCells = 3) {
    let positions = []
    let gameGrid = Array(gridCells).fill(Array(gridCells).fill('x'))
    let ships = []
    let shipPositions = []

    return {
        gameGrid,
        assignShipPosition: (shipType, x, y) => positions.push({ship: shipType, xPos: x, yPos: y}),
        shipPositions: () => positions
    }
}

module.exports = { ship, gameBoard }