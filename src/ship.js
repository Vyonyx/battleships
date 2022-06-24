function ship(lengthID) {

    const shipTypes = {
        'carrier': 5,
        'battleship': 4,
        'cruiser': 3,
        'destroyer': 2
    }
    const length = typeof lengthID == 'number' ? lengthID : shipTypes[lengthID]
    let hitAmount = 0


    return {
        length,
        hit: (x = 1) => hitAmount += x,
        hitsTaken: () => hitAmount,
        isSunken: () => hitAmount >= length ? true : false
    }
}

module.exports = ship