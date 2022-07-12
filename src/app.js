const {ship, gameBoard, player} = require('./ship')
require('./style.scss')

const CELL_HEIGHT = 50

const shipAssets = {
    carrier: { default: {horizontal: require('./assets/carrier_horizontal.svg'), vertical: require('./assets/carrier_vertical.svg')}, segments: 5, },
    battleship: { default: {horizontal: require('./assets/battleship_horizontal.svg'), vertical: require('./assets/battleship_vertical.svg')}, segments: 4, },
    cruiser: { default: {horizontal: require('./assets/cruiser_horizontal.svg'), vertical: require('./assets/cruiser_vertical.svg')}, segments: 3, },
    destroyer: { default: {horizontal: require('./assets/destroyer_horizontal.svg'), vertical: require('./assets/destroyer_vertical.svg')}, segments: 2, },
}

const moveDiagram = new Image(90)
moveDiagram.src = require('./assets/move-diagram.svg')
const rotateDiagram = new Image(140)
rotateDiagram.src = require('./assets/rotate-diagram.svg')

document.querySelector('.instruction-move').appendChild(moveDiagram)
document.querySelector('.instruction-rotate').appendChild(rotateDiagram)

// const moveDiagram = require('./assets')

// TODO: Auto initalise a game that has already begun with pre-determined ship positions.
    // TODO: Set this up in a function so that AI can auto populate positions randomly each game.
    // TODO: Auto populate player ship positions.

const newBoard = gameBoard(10)
const gameGrid = document.querySelector('.grid')
const shipStartingContainer = document.querySelector('.ship-container')

initaliseBoard(gameGrid)

// Visual grid parameters.
const matrixSize = 8;
const cellSize = `${CELL_HEIGHT}px`
const rotateBtn = document.querySelector('.rotate')
const startBtn = document.querySelector('.start')

// Create draggable ships.
const ship1 = createShip('carrier')
const ship2 = createShip('battleship')
const ship3 = createShip('cruiser')
const ship4 = createShip('destroyer')
const ship5 = createShip('destroyer')

rotateBtn.addEventListener('click', rotateShip)
startBtn.addEventListener('click', startGame)

function initaliseBoard(board) {
    const positions = Array.from((Array(newBoard.length)), (col, yIndex) => {
        return Array.from(Array(newBoard.length), (row, xIndex) => {
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
    // newShip.style.position = 'absolute'

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
            snapToGrid(ship)
            ship.style.zIndex = 1
            ship.onmousedown = null
        }
    }

    ship.ondragstart = function(e) {
        return false
    }
}

function resetActiveShips() {
    const allShips = document.querySelectorAll('.ship')
    allShips.forEach(ship => ship.classList.remove('active'))
}

function makeActive(ship) {
    ship.classList.add('active')
}

// Impliment drag and drop auto positioning of ships to grid.
function snapToGrid(ship, cellHeight = CELL_HEIGHT) {
    const gridPos = gameGrid.getBoundingClientRect()
    const shipPos = ship.getBoundingClientRect()

    if(gridPos.top == shipPos.top) return
    
    const leftOffset = parseFloat(gridPos.left)
    const topOffset = parseFloat(gridPos.top)
    const gridIncrements = parseInt(cellSize)

    let shipX = (Math.floor((parseInt(shipPos.x) - leftOffset) / gridIncrements) * gridIncrements) + leftOffset
    let shipY = (Math.floor((parseInt(shipPos.y) - topOffset) / gridIncrements) * gridIncrements) + topOffset

    if (parseFloat(shipPos.left) < parseFloat(gridPos.left) ||
        parseFloat(shipPos.right) < parseFloat(gridPos.left)) {
            console.log('too far left')
        shipX = parseFloat(gridPos.left)
    }

    ship.style.left = shipX + 'px'
    ship.style.top = shipY + 'px'

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
    }

    else if (parseFloat(shipPos.left) > parseFloat(gridPos.right) ||
        parseFloat(shipPos.right) > parseFloat(gridPos.right)) {
            console.log('too far right')
        shipX = parseFloat(gridPos.right) - parseFloat(shipPos.width)
    }

    if (parseFloat(shipPos.top) < parseFloat(gridPos.top) ||
        parseFloat(shipPos.bottom) < parseFloat(gridPos.top)) {
            console.log('too far top')
        shipY = parseFloat(gridPos.top)
    }

    else if (parseFloat(shipPos.top) > parseFloat(gridPos.bottom) ||
        parseFloat(shipPos.bottom) > parseFloat(gridPos.bottom)) {
            console.log('too far bottom')
        shipY = parseFloat(gridPos.bottom) - parseFloat(shipPos.height)
    }

    ship.style.left = shipX + 'px'
    ship.style.top = shipY + 'px'
}

function rotateShip() {
    const remainingShips = document.querySelector('.ship-container').children
    const shipContainer = document.querySelector('.ship-container')
    const orientation = Array.from(remainingShips)[0].getAttribute('data-ship-orientation')

    shipContainer.style['grid-template-columns'] = orientation == 'horizontal' ?
        'repeat(3, auto)' : 'repeat(1, auto)'
    // shipContainer.style['grid-template-columns'] = 'repeat(5, auto)'
    Array.from(remainingShips).forEach(ship => {
        if(!ship.onmousedown) return
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
        fitShipIntoGrid(ship)
    })

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

function startGame() {
    assignShipsToGameboard()
}

function assignShipsToGameboard() {
    const allShips = document.querySelectorAll('.ship')
    allShips.forEach(currentShip => {
        const shipCoords = currentShip.getBoundingClientRect()
        const shipOrientation = currentShip.getAttribute('data-ship-orientation')
        let gridXPos, gridYPos

        Array.from(gameGrid.children).forEach(row => {
            [...row.children].forEach(cell => {
                const cellCoords = cell.getBoundingClientRect()
                if(shipCoords.x == cellCoords.x && shipCoords.y == cellCoords.y) {
                    const cellData = cell.getAttribute('data-coord').split(' ')
                    gridXPos = parseInt(cellData[0])
                    gridYPos = parseInt(cellData[1])
                }
            })
        })

        const newShip = ship(currentShip.getAttribute('data-ship-type'))
        newBoard.assignShipPosition(newShip, gridXPos, gridYPos, shipOrientation)
    })
    console.table(newBoard.grid)
}
