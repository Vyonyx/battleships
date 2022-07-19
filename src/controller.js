const {ship, gameBoard, player} = require('./model')
const { viewer } = require('./view')
require('./style.scss')

const modelGridMatrixSize = 8
const playerModelBoard = gameBoard(modelGridMatrixSize)
const aiModelBoard = gameBoard(modelGridMatrixSize)

const gameDisplay = viewer()

// Create draggable ships.
// const ship1 = gameDisplay.createShip('carrier')
// const ship2 = gameDisplay.createShip('battleship')
// const ship3 = gameDisplay.createShip('cruiser')
// const ship4 = gameDisplay.createShip('destroyer')

createShipsFromInitialisation(playerModelBoard)

gameDisplay.rotateBtn.addEventListener('click', gameDisplay.rotateShipsContainer)
gameDisplay.startBtn.addEventListener('click', startGame)

function startGame() {
    gameDisplay.toggleSetupScreen()
    createShipsFromInitialisation(aiModelBoard)
    
    const currentPlayer = player(playerModelBoard, aiModelBoard)
    const aiPlayer = player(aiModelBoard, playerModelBoard)
    console.log(currentPlayer.myBoard.grid)
    console.log(aiPlayer.myBoard.grid)

    gameDisplay.aiGrid.addEventListener('click', (e) => {
        e.preventDefault()
        if (!e.target.classList.contains('gridCell')) return
        const attr = e.target.getAttribute('data-coord')
        let [xPos, yPos] = attr.split(' ').map(num => parseInt(num))

        // Declare player attack.
        const playerAttack = currentPlayer.attack({ xPos, yPos })

        // Random AI attack.
        const aiAttack = aiPlayer.randomAttack()

        // Display cell color.
        if (playerAttack.result == 'hit') {
            e.target.classList.add('hit-cell')
        } else if (playerAttack.result == 'miss') {
            e.target.classList.add('miss-cell')
        }

        const aiCellChoice = document.querySelector(`[data-coord="${aiAttack.xPos} ${aiAttack.yPos}"]`)
        if (aiAttack.result == 'hit') {
            aiCellChoice.classList.add('hit-cell')
        } else if (aiAttack.result == 'miss') {
            aiCellChoice.classList.add('miss-cell')
        }
        // Check if game over/all ships sunken and remove aiGrid event listener?
        if (aiPlayer.myBoard.shipsSunken()) {
            gameDisplay.toggleGameEndScreen('win')
        }
        else if (currentPlayer.myBoard.shipsSunken()) {
            gameDisplay.toggleGameEndScreen('lose')
        }
    })
}

function createShipsFromInitialisation(board) {
    board.randomBoardInitialisation()
    const data = board.shipsData
    console.log(data)
    data.forEach(item => {
        const newShip = gameDisplay.createShip(item.ship.getType)
        newShip.onmousedown = null
        if (item.direction == 'vertical') gameDisplay.rotateShip(newShip)
        const {xPos, yPos} = gameDisplay.getGridCellPosition(item.xPos, item.yPos)
        if (board == playerModelBoard) { gameDisplay.positionShip(newShip, xPos, yPos) }

        if (board == aiModelBoard) {
            gameDisplay.positionShip(newShip, xPos, yPos, gameDisplay.aiGrid)
        }
    })
    gameDisplay.hideShips()
}
