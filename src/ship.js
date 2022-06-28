function ship(shipID) {
    const shipTypes = {
        'carrier': 5,
        'battleship': 4,
        'cruiser': 3,
        'destroyer': 2
    }

    const length = shipTypes[shipID]
    let segments = Array(length).fill('safe')


    return {
        length,
        getType: () => Object.keys(shipTypes).filter(key => shipTypes[key] === length).toString(),
        hit: function(...arg) { [...arg].forEach(x => segments[x] = 'hit') },
        hitsTaken: () => segments.filter(seg => seg === 'hit').length,
        isSunken: () => segments.filter(seg => seg === 'hit').length >= length ? true : false,
        segments
    }
}


function gameBoard(gridCells = 3) {
    let shipsData = []
    let placedShipSegmentPositions = []
    let attackedPositions = []

    let grid = Array.from(Array(gridCells), () => new Array(gridCells).fill(' '))
    
    
    function placeShip(shipObj) {
        const shipSegmentPositions = shipObj.segments
            .map(coords => {
                let {xPos, yPos} = coords
                return [yPos, xPos]
            })

        const isClashingLocation = placedShipSegmentPositions.some(([a, b]) => 
            shipSegmentPositions.some(([x, y]) => a == x && b == y))

        if (isClashingLocation) throw Error('Ship already exists at proposed location.')
        placedShipSegmentPositions = placedShipSegmentPositions.concat(shipSegmentPositions)

        const displayShipSegmentsOnGrid = (() => {
            shipSegmentPositions.forEach(([xPos, yPos]) => {
                grid[xPos][yPos] = shipObj.getType()
            })
        })()
    }


    function assignShipPosition(shipObj, x, y, direction = 'horizontal') {
        shipObj.segments = shipObj.segments.map((element, index) => {
            const segmentX = direction == 'horizontal' ? x + index : x
            const segmentY = direction == 'vertical' ? y + index : y
            
            return {xPos: segmentX, yPos: segmentY}
        })

        placeShip(shipObj)

        shipsData.push( {ship: shipObj, direction, xPos: x, yPos: y} )
    }


    function displayHitShipOnGrid(x, y) {
        if (grid[y][x] == ' ') { grid[y][x] = 'miss'; return }

        let hitIndex = null
        const hitShip = shipsData.find(({ship}) => 
            ship.segments.find(({xPos, yPos}, index) => {
                if (xPos == x && yPos == y) { hitIndex = index; return true }
            })
        ).ship.hit(hitIndex)
    }


    function attack(x, y) {
        const wasPrevAttack = attackedPositions.some( ({xPos, yPos}) => xPos == x && yPos == y )
        if (wasPrevAttack) throw Error('Was a previous attack.')

        attackedPositions.push({xPos: x, yPos: y})
        displayHitShipOnGrid(x, y)
    }


    function shipsSunken() {
        return shipsData.every( ({ship}) => ship.isSunken() )
    }


    return {
        grid,
        shipsData,
        attackedPositions,
        assignShipPosition,
        attack,
        shipsSunken
    }
}

module.exports = { ship, gameBoard }