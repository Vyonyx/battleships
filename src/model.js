function ship(shipID) {
    
    const shipTypes = {
        'carrier': 5,
        'battleship': 4,
        'cruiser': 3,
        'destroyer': 2
    }

    const shipLength = shipTypes[shipID]
    let segments = Array(shipLength).fill('safe')

    const getType = shipID


    return {
        shipLength,
        getType,
        segments,
        hit: function(...arg) { [...arg].forEach(x => segments[x] = 'hit') },
        hitsTaken: () => segments.filter(seg => seg === 'hit').length,
        isSunken: () => segments.filter(seg => seg === 'hit').length >= shipLength ? true : false,
    }
}


function gameBoard(gridCells = 9) {
    let shipsData = []
    // Where ships have been placed. Used to assess attack hits.
    let placedShipSegmentPositions = []
    // Keeping track of attacked positions.
    let attackedPositions = []

    // Setting up the intial grid.
    let grid = Array.from(Array(gridCells), () => new Array(gridCells).fill(' '))
    const length = grid.length


    function assignShipPosition(shipObj, x, y, direction = 'horizontal') {
        // Assign ship segments to corresponding grid positions.
        shipObj.segments = shipObj.segments.map((element, index) => {
            const segmentX = direction == 'horizontal' ? x + index : x
            const segmentY = direction == 'vertical' ? y + index : y
            return {xPos: segmentX, yPos: segmentY}
        })

        placeShip(shipObj)
        shipsData.push( {ship: shipObj, direction, xPos: x, yPos: y} )
    }

    function placeShip(shipObj) {
        const shipSegmentPositions = shipObj.segments
            .map(coords => {
                let {xPos, yPos} = coords
                return [yPos, xPos]
            })
        
        isClashing(shipSegmentPositions)
        placedShipSegmentPositions = placedShipSegmentPositions.concat(shipSegmentPositions)

        const displayShipSegmentsOnGrid = (() => {
            shipSegmentPositions.forEach(([xPos, yPos]) => {
                grid[xPos][yPos] = shipObj.getType
            })
        })()
    }

    function isClashing(shipSegmentPositions) {
        const isClashingLocation = placedShipSegmentPositions.some(([a, b]) => 
            shipSegmentPositions.some(([x, y]) => a == x && b == y))

        if (isClashingLocation) throw Error('Ship already exists at proposed location.')
    }

    function displayHitShipOnGrid(x, y) {
        if (grid[y][x] == ' ') { grid[y][x] = 'miss'; return {result: 'miss', xPos: x, yPos: y} }

        let hitIndex = null
        const hitShip = shipsData.find(({ship}) => 
            ship.segments.find(({xPos, yPos}, index) => {
                if (xPos == x && yPos == y) { hitIndex = index; return true }
            })
        ).ship.hit(hitIndex)
        grid[y][x] = 'hit'
        return {result: 'hit', xPos: x, yPos: y}
    }

    function attack(x, y) {
        const wasPrevAttack = attackedPositions.some( ({xPos, yPos}) => xPos == x && yPos == y )
        if (wasPrevAttack) {
            throw Error('Was a previous attack.')
        } else if (!wasPrevAttack) {
            attackedPositions.push({xPos: x, yPos: y})
            return displayHitShipOnGrid(x, y)
        }
    }

    function shipsSunken() {
        return shipsData.every( ({ship}) => ship.isSunken() )
    }

    function availableMoves() {
        const legalTiles = [' ', 'carrier', 'battleship', 'cruiser', 'destroyer']
        // const legalTiles = [' ']
        const moves = []
        grid.forEach((row, yIndex) => {
            row.forEach((element, xIndex) => {
                if (legalTiles.includes(element)) {
                    const coord = {xPos: xIndex, yPos: yIndex}
                    moves.push(coord)
                }
            })
        })
        return moves
    }

    function randomBoardInitialisation() {

        const ships = {
            carrier: ship('carrier'),
            battlship: ship('battleship'),
            cruiser: ship('cruiser'),
            destroyer: ship('destroyer'),
        }

        Object.keys(ships).forEach(key => {
            const ship = ships[key]
            const length = ship.shipLength
            const orientation = randomOrientation()

            let donePositioning = false
            while (!donePositioning) {
                const startingX = randomX(orientation, length)
                const startingY = randomY(orientation, length)
    
                try {
                    assignShipPosition(ship, startingX, startingY, orientation)
                    donePositioning = true
                } catch { }
            }
        })

        console.log(grid)

        function randomOrientation() { return Math.random() < 0.5 ? 'horizontal' : 'vertical' }

        function randomX(orientation, length) {
            if (orientation == 'horizontal') return Math.floor(Math.random() * (gridCells - length))
            return Math.floor(Math.random() * gridCells)
        }

        function randomY(orientation, length) {
            if (orientation == 'vertical') return Math.floor(Math.random() * (gridCells - length))
            return Math.floor(Math.random() * gridCells)
        }
    }

    return {
        grid,
        length,
        shipsData,
        attackedPositions,
        assignShipPosition,
        attack,
        shipsSunken,
        availableMoves,
        randomBoardInitialisation
    }
}


function player(pB, eB) {
    const myBoard = pB
    const enemy = eB

    function attack(coords) {
        let {xPos, yPos} = coords
        return enemy.attack(xPos, yPos)
    }

    function randomAttack() {
        const movesList = enemy.availableMoves()
        const randIndex = Math.floor(Math.random() * (movesList.length))
        const randMove = movesList[randIndex]
        return attack(randMove)
    }

    return {
        myBoard,
        enemy,
        attack,
        randomAttack
    }
}

module.exports = { ship, gameBoard, player }