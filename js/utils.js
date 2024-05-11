'use strict'

// Returns the class name for a specific cell
function getClassName(position) {
    const cellClass = `cell-${position.i}-${position.j}`
    return cellClass
}

function createCell() {
    return {
        minesAroundCount: 0,
        isShown: false,
        isMine: false,
        isMarked: false
    }
}

function updateStyle(diff) {
    const elContainer = document.querySelector('.game-container')
    const elLife = document.querySelector('.life')
    const elTime = document.querySelector('.time')

    switch (diff) {
        case 0:
            elContainer.style.height = '255px'
            elContainer.style.width = '210px'
            elLife.style.margin = '15px 15px'
            elTime.style.margin = '15px -80px'

            break
        case 1:
            elContainer.style.height = '395px'
            elContainer.style.width = '350px'
            elLife.style.margin = '15px 45px'
            elTime.style.margin = '15px -110px'
            break
        case 2:
            elContainer.style.height = '535px'
            elContainer.style.width = '490px'
            elLife.style.margin = '15px 70px'
            elTime.style.margin = '15px -130px'
            break
    }
}

function sayNum(num) {
    const numsNames = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine']

    return numsNames[num]
}

function revelMines() {
    for (var i = 0; i < gLevel.size; i++) {
        for (var j = 0; j < gLevel.size; j++) {
            var currCell = gBoard[i][j]

            if (!currCell.isMine) continue

            var elCell = document.querySelector(`.cell-${i}-${j}`)

            currCell.isShown = true
            elCell.innerHTML = MINE
            elCell.classList.add('mine-clicked')
            elCell.classList.remove('cell')
        }
    }
}

function revealNegs(row, cols) {
    for (var i = row - 1; i <= row + 1; i++) {
        if (i < 0 || i === gLevel.size) continue

        for (var j = cols - 1; j <= cols + 1; j++) {
            if (j < 0 || j === gLevel.size || i === row && j === cols) continue

            var currCell = gBoard[i][j]

            if (currCell.isMine || currCell.isShown || currCell.isMarked) continue

            var elCell = document.querySelector(`.cell-${i}-${j}`)
            currCell.isShown = true
            elCell.classList.add(currCell.isMine ? 'mine-clicked' : 'clicked')
            elCell.classList.remove('cell')
            elCell.innerHTML = currCell.minesAroundCount < 1 ? '' : currCell.minesAroundCount

            if (currCell.minesAroundCount === 0) revealNegs(i, j)
            else elCell.classList.add(sayNum(currCell.minesAroundCount))
        }
    }
}

function setMineOnBoard(board, amount) {
    for (var i = 0; i < amount; i++) {
        var currCell = getEmptyPos(board)
        board[currCell.i][currCell.j].isMine = true
    }
}

function getEmptyPos(board) {
    var emptyPoses = []

    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            if (!board[i][j].isMine && !board[i][j].isShown) {
                emptyPoses.push({ i, j })
            }
        }
    }

    if (!emptyPoses.length) return null

    return emptyPoses[getRandomIntInclusive(0, (emptyPoses.length - 1))]
}

function updateLife(life) {
    var res = ''
    const elLife = document.querySelector('.life')

    for (var i = 0; i < life; i++) {
        res += LIFE
    }

    elLife.innerHTML = res
}

function updateTime() {
    if (!gGame.isOn || gFirstClick) return

    var date = Date.now();
    var ms = date - gDate

    var sec = parseInt(ms / 1000)

    const elTime = document.querySelector('.time')

    elTime.innerHTML = sec
}

function updateDiff() {
    gDiff++

    if (gDiff > 2) gDiff = 0

    var diff = ['👶', '🧑', '😈']
    const elDiff = document.querySelector('.diff')

    elDiff.innerHTML = diff[gDiff]

    onInit()
}

function updateIcons() {
    const elBtn = document.querySelector('.smile')
    const elTime = document.querySelector('.time')
    const elHint = document.querySelector('.hint')
    const elSafe = document.querySelector('.safe')
    const elMega = document.querySelector('.mega')
    const elSelf = document.querySelector('.self')
    const elMine = document.querySelector('.mine')

    elBtn.src = 'img/smile.png'
    elTime.innerHTML = '0'
    elHint.innerHTML = HINT + HINT + HINT
    elSafe.innerHTML = SAFE + SAFE + SAFE
    elMega.innerHTML = MEGA
    elSelf.innerHTML = 'Place ' + MINE
    elMine.innerHTML = '-3 ' + MINE
}

function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}