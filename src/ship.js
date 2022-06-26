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
        getType: () => Object.keys(shipTypes).filter(key => shipTypes[key] === length).toString(),
        hit: function(...arg) { [...arg].forEach(x => segments[x] = 'hit') },
        hitsTaken: () => segments.filter(seg => seg === 'hit').length,
        isSunken: () => segments.filter(seg => seg === 'hit').length >= length ? true : false,
        segments
    }
}



function gameBoard(gridCells = 3) {
    let positions = []
    let placedShipPositions = []
    let grid = Array.from(Array(gridCells), () => new Array(gridCells).fill(' '))
    
    function placeShips(shipObj) {
        const proposedLocations = shipObj.segments
            .map(coords => {
                let {xPos, yPos} = coords
                return [yPos, xPos]
            })

        const isClashingPosition = placedShipPositions.some(arr => {
            let [a, b] = [...arr]
            return proposedLocations.some(arr => {
                let [x, y] = [...arr]
                return a == x && b == y
            })
        })

        if (isClashingPosition) {
            throw Error('Ship already exists at proposed locations.')
        }

        placedShipPositions = placedShipPositions.concat(proposedLocations)

        proposedLocations.forEach(coord => {
            let [xPos, yPos] = [...coord]
            grid[xPos][yPos] = shipObj.getType()
        })
    }


    return {
        grid,
        positions,
        shipPositions: placedShipPositions,
        assignShipPosition: function (shipObj, x, y, direction = 'horizontal') {
            shipObj.segments = shipObj.segments.map((element, index) => {
                const segmentX = direction == 'horizontal' ? x + index : x
                const segmentY = direction == 'vertical' ? y + index : y
                element = {xPos: segmentX, yPos: segmentY}
                return element
            })
            placeShips(shipObj)
            positions.push({
                ship: shipObj,
                direction,
                xPos: x, 
                yPos: y,
            })
        },
    }
}

module.exports = { ship, gameBoard }