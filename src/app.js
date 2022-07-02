const {ship, gameBoard, player} = require('./ship')
require('./style.scss')

const newBoard = gameBoard(10)
const container = document.createElement('div')
container.classList.add('grid-container')

const positions = Array.from((Array(newBoard.length)), (row, yIndex) => {
    return Array.from(Array(newBoard.length), (col, xIndex) => {
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
        newRow.appendChild(newDiv)
    })
    container.appendChild(newRow)
})

document.body.appendChild(container)

document.body.addEventListener('click', e => {
    if (!e.target.classList.contains('gridCell')) return
    const data = e.target.getBoundingClientRect()
    const leftOffset = data.right - (data.width / 2)
    const topOffset = data.bottom - (data.height / 2)

    const dot = document.createElement('div')
    dot.classList.add('dot')
    dot.style.left = (leftOffset) + 'px'
    dot.style.top = (topOffset) + 'px'
    document.body.appendChild(dot)
})
