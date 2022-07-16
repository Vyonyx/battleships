const {ship, gameBoard, player} = require('./model')
const { viewer } = require('./view')
require('./style.scss')

const modelGridMatrixSize = 8
const board = gameBoard(modelGridMatrixSize)
const aiModelBoard = gameBoard(modelGridMatrixSize)

const gameDisplay = viewer()

// Create draggable ships.
const ship1 = gameDisplay.createShip('carrier')
const ship2 = gameDisplay.createShip('battleship')
const ship3 = gameDisplay.createShip('cruiser')
const ship4 = gameDisplay.createShip('destroyer')

// createShipsFromInitialisation(aiModelBoard)

function createShipsFromInitialisation(board) {
    board.randomBoardInitialisation()
    const data = board.shipsData

    data.forEach(item => {
        const newShip = gameDisplay.createShip(item.ship.getType)
        if (item.direction == 'vertical') gameDisplay.rotateShip(newShip)
        const {xPos, yPos} = gameDisplay.getGridCellPosition(item.xPos, item.yPos)
        gameDisplay.positionShip(newShip, xPos, yPos)
    })
}

gameDisplay.rotateBtn.addEventListener('click', gameDisplay.rotateShipsContainer)
gameDisplay.startBtn.addEventListener('click', startGame)

function startGame() {
    gameDisplay.toggleSetupScreen()
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
        board.assignShipPosition(newShip, gridXPos, gridYPos, shipOrientation)
    })
    console.table(board.grid)
}
