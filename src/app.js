const {ship, gameBoard, player} = require('./ship')
require('./style.scss')

const CELL_HEIGHT = 70

const shipAssets = {
    carrier: { default: require('./assets/carrier.svg'), segments: 5, },
    battleship: { default: require('./assets/battleship.svg'), segments: 4, },
    cruiser: { default: require('./assets/cruiser.svg'), segments: 3, },
    destroyer: { default: require('./assets/destroyer.svg'), segments: 2, },
}

// TODO: Auto initalise a game that has already begun with pre-determined ship positions.
    // TODO: Set this up in a function so that AI can auto populate positions randomly each game.
    // TODO: Auto populate player ship positions.

const newBoard = gameBoard(10)
const gameGrid = document.querySelector('.grid')
gameGrid.classList.add('grid-container')
document.body.appendChild(gameGrid)
initaliseBoard(gameGrid)

// Visual grid parameters.
const matrixSize = 8;
const cellSize = `${CELL_HEIGHT}px`
const rotateBtn = document.querySelector('.rotate')
const startBtn = document.querySelector('.start')

// Create draggable ships.
const ship1 = createShip('ship')
const ship2 = createShip('ship')

// rotateBtn.addEventListener('click', rotateShip)
// startBtn.addEventListener('click', startGame)

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
            newDiv.draggable = true
            newRow.appendChild(newDiv)
        })
        board.appendChild(newRow)
    })

    document.body.appendChild(board)
}

function createShip(type='ship') {
    const newShip = createShipImage('carrier', document.body)
    newShip.classList.add(type)
    newShip.style.position = 'absolute'
    document.body.appendChild(newShip)

    makeDraggable(newShip)
    newShip.ondblclick = function() {
        ship.style.background = 'black'
    }

    return newShip
}

function makeDraggable(ship) {
    ship.onmousedown = function(e) {
        resetActiveShips()
        makeActive(ship)
        let shiftX = e.clientX - ship.getBoundingClientRect().left
        let shiftY = e.clientY - ship.getBoundingClientRect().top

        ship.style.position = 'absolute'
        ship.style.zIndex = 1000;

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
    const ship = document.querySelector('.active')
    const data = ship.getBoundingClientRect()
    let shipHeight = data.width + 'px'
    let shipWidth = data.height + 'px'
    ship.style.height = shipHeight
    ship.style.width = shipWidth
    fitShipIntoGrid(ship)
}

function createShipImage(id, container) {
    const height = 70
    const width = shipAssets[id].segments * height
    const newShip = new Image(width, height)
    newShip.src = shipAssets[id].default
    newShip.draggable = true
    newShip.classList.add('draggable')
    newShip.style.position = 'absolute'
    container.appendChild(newShip)
    return newShip
}