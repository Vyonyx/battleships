function viewer() {
    const CELL_HEIGHT = 50
    
    // ---------- Image URL's for dynamic creation of images. ---------- \\
    const shipAssets = {
        carrier: { default: {horizontal: require('./assets/carrier_horizontal.svg'), vertical: require('./assets/carrier_vertical.svg')}, segments: 5, },
        battleship: { default: {horizontal: require('./assets/battleship_horizontal.svg'), vertical: require('./assets/battleship_vertical.svg')}, segments: 4, },
        cruiser: { default: {horizontal: require('./assets/cruiser_horizontal.svg'), vertical: require('./assets/cruiser_vertical.svg')}, segments: 3, },
        destroyer: { default: {horizontal: require('./assets/destroyer_horizontal.svg'), vertical: require('./assets/destroyer_vertical.svg')}, segments: 2, },
    }
    
    // ---------- Diagrams showing how to position ships on player board. ---------- \\
    const moveDiagram = new Image(90)
    moveDiagram.src = require('./assets/move-diagram.svg')
    const rotateDiagram = new Image(140)
    rotateDiagram.src = require('./assets/rotate-diagram.svg')
    document.querySelector('.instruction-move').appendChild(moveDiagram)
    document.querySelector('.instruction-rotate').appendChild(rotateDiagram)
    
    const gameGrid = document.querySelector('.grid')
    const shipStartingContainer = document.querySelector('.ship-container')
    
    // ---------- Parameters for the displayed grid. ---------- \\
    const matrixSize = 8;
    const cellSize = `${CELL_HEIGHT}px`

    const rotateBtn = document.querySelector('.rotate')
    const startBtn = document.querySelector('.start')
    
    // ---------- Game setup. ---------- \\
    initaliseBoard(gameGrid)
    
    function initaliseBoard(board) {
        const positions = Array.from((Array(matrixSize)), (col, yIndex) => {
            return Array.from(Array(matrixSize), (row, xIndex) => {
                return `${xIndex} ${yIndex}` 
                })
        })
    
        positions.forEach(row => {
            const newRow = document.createElement('div')
            newRow.classList.add('grid-row')
            row.forEach((coord) => {
                const newDiv = document.createElement('div')
                newDiv.dataset.coord = coord
                newDiv.classList.add('gridCell')
                newDiv.style.width = CELL_HEIGHT + 'px'
                newDiv.style.height = CELL_HEIGHT + 'px'
                newDiv.draggable = true
                newRow.appendChild(newDiv)
            })
            board.appendChild(newRow)
        })
    }

    function createShip(type='destroyer') {
        const newShip = createShipImage(type, shipStartingContainer)
        newShip.classList.add('ship')
        newShip.setAttribute('data-ship-type', type)
        newShip.setAttribute('data-ship-orientation', 'horizontal')
    
        makeDraggable(newShip)
        return newShip
    }
    
    function makeDraggable(ship) {
        ship.onmousedown = function(e) {
            resetActiveShips()
            makeActive(ship)
            let shiftX = e.clientX - ship.getBoundingClientRect().left
            let shiftY = e.clientY - ship.getBoundingClientRect().top
    
            ship.style.position = 'absolute'
    
            function moveAt(pageX, pageY) {
                ship.style.top = pageY - shiftY + 'px'
                ship.style.left = pageX - shiftX + 'px'
            }
    
            moveAt(e.pageX, e.pageY)
    
            function onMouseMove(e) {
                moveAt(e.pageX, e.pageY)
            }
    
            document.addEventListener('mousemove', onMouseMove)
    
            ship.onmouseup = function(e) {
                document.removeEventListener('mousemove', onMouseMove)
                ship.onmouseup = null
                document.body.appendChild(ship)
                snapToGrid(ship)
                ship.style.zIndex = 1
                ship.onmousedown = null
            }
        }
    
        ship.ondragstart = function(e) {
            return false
        }
    }

    function createShipImage(id, container) {
        const height = CELL_HEIGHT
        const width = shipAssets[id].segments * height
        const newShip = new Image(width, height)
        newShip.src = shipAssets[id].default.horizontal
        newShip.draggable = true
        newShip.classList.add('draggable')
        container.appendChild(newShip)
        return newShip
    }
    
    function resetActiveShips() {
        const allShips = document.querySelectorAll('.ship')
        allShips.forEach(ship => ship.classList.remove('active'))
    }
    
    function makeActive(ship) {
        ship.classList.add('active')
    }

    function snapToGrid(ship) {
        const gridPos = gameGrid.getBoundingClientRect()
        const shipPos = ship.getBoundingClientRect()
        
        const gridLeft = parseFloat(gridPos.left)
        const gridTop = parseFloat(gridPos.top)
        const gridIncrements = parseInt(cellSize)
        
        let shipX = Math.floor((parseFloat(shipPos.x) - gridLeft) / CELL_HEIGHT) * CELL_HEIGHT
        let shipY = Math.floor((parseFloat(shipPos.y) - gridTop) / CELL_HEIGHT) * CELL_HEIGHT

        positionShip(ship, shipX, shipY)
        fitShipIntoGrid(ship)
    }
    
    function fitShipIntoGrid(ship) {
        const gridPos = gameGrid.getBoundingClientRect()
        const shipPos = ship.getBoundingClientRect()
    
        let shipX, shipY
        
        if (parseFloat(shipPos.left) < parseFloat(gridPos.left) ||
            parseFloat(shipPos.right) < parseFloat(gridPos.left)) {
                console.log('too far left')
                shipX = parseFloat(gridPos.left)
                shipX = 0
        }
    
        else if (parseFloat(shipPos.left) > parseFloat(gridPos.right) ||
            parseFloat(shipPos.right) > parseFloat(gridPos.right)) {
                console.log('too far right')
                shipX = 0 + parseFloat(gridPos.width) - parseFloat(shipPos.width)
        }
    
        if (parseFloat(shipPos.top) < parseFloat(gridPos.top) ||
            parseFloat(shipPos.bottom) < parseFloat(gridPos.top)) {
                console.log('too far top')
                shipY = 0
        }
    
        else if (parseFloat(shipPos.top) > parseFloat(gridPos.bottom) ||
            parseFloat(shipPos.bottom) > parseFloat(gridPos.bottom)) {
                console.log('too far bottom')
                shipY = 0 + parseFloat(gridPos.height) - parseFloat(shipPos.height)
        }
    
        positionShip(ship, shipX, shipY)
    }
    
    function rotateShipsContainer() {
        const remainingShips = document.querySelector('.ship-container').children
        const shipContainer = document.querySelector('.ship-container')
        const orientation = Array.from(remainingShips)[0].getAttribute('data-ship-orientation')
    
        shipContainer.style['grid-template-columns'] = orientation == 'horizontal' ?
            'repeat(3, auto)' : 'repeat(1, auto)'
    
        Array.from(remainingShips).forEach(ship => {
            if(!ship.onmousedown) return
            rotateShip(ship)
            fitShipIntoGrid(ship)
        })    
    }
    
    function rotateShip(ship) {
        const data = ship.getBoundingClientRect()
        let shipHeight = data.width + 'px'
        let shipWidth = data.height + 'px'
        ship.style.height = shipHeight
        ship.style.width = shipWidth
        const type = ship.getAttribute('data-ship-type')
        const currentOrientation = ship.getAttribute('data-ship-orientation')
        const newOrientation = currentOrientation == 'horizontal' ? 'vertical' : 'horizontal'
        ship.src =  shipAssets[type].default[newOrientation]
        ship.setAttribute('data-ship-orientation', newOrientation)
    }

    function hideDiagrams() {
        document.querySelector('.instruction-move').style.display = 'none'
        document.querySelector('.instruction-rotate').style.display = 'none'
    }

    function getGridCellPosition(x, y) {
        const cell = document.querySelector(`[data-coord="${x} ${y}"]`)
        const xPos = cell.offsetLeft
        const yPos = cell.offsetTop
        return {xPos, yPos}
    }

    function positionShip(ship, xPos, yPos) {
        gameGrid.appendChild(ship)
        ship.style.position = 'absolute'
        ship.style.left = xPos + 'px'
        ship.style.top = yPos + 'px'
    }

    return {
        rotateBtn,
        startBtn,
        createShip,
        rotateShip,
        rotateShipsContainer,
        hideDiagrams,
        getGridCellPosition,
        positionShip,
        snapToGrid,
    }
}

module.exports = { viewer }
