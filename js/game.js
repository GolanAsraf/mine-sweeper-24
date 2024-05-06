'use strict'

const MINE = '💣'
const FLAG = '🚩'
const LIFE = '❤️'
const HINT = '💡'
const SAFE = '🦺'
const MEGA = '💥MEGA'
const EMPTY = ''


const LEVEL = [4, 8, 12]
const MINES = [2, 14, 32]

var gGame
var gLevel
var gBoard
var gFirstClick
var gDate
var gTimeCounter
var gDiff = 0
var gBonus

function onInit() {
    gGame = {
        isOn: false,
        shownCount: 0,
        markedCount: 0,
        life: 3
    }

    gLevel = {
        size: LEVEL[gDiff],
        mine: MINES[gDiff]
    }

    gBonus = {
        hint: 3,
        isHint: false,
        safe: 3,
        mega: {
            isOn: false,
            isUsed: false,
            i: null,
            j: null,
        },
        undo: [],
        selfMine: false,
        mines: gLevel.mine,
        removeMines: 1
    }

    clearInterval(gTimeCounter)
    gBoard = buildBoard()
    renderBoard(gBoard)
    updateIcons()
    updateLife(gGame.life)
    updateStyle(gDiff)

    gFirstClick = true
    gGame.isOn = true
}

function buildBoard() {
    const board = []

    for (var i = 0; i < gLevel.size; i++) {
        board.push([])
        for (var j = 0; j < gLevel.size; j++) {
            board[i][j] = createCell()
        }
    }

    setMineOnBoard(board, gLevel.mine)

    setMinesNegsCount(board)

    return board
}

function renderBoard(board) {
    const elBoard = document.querySelector('.board')
    var strHTML = ''

    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>\n'
        for (var j = 0; j < board[i].length; j++) {
            var cellClass = getClassName({ i, j })

            strHTML += `\t<td class="cell ${cellClass}" onclick="onCellClicked(this,${i},${j})" oncontextmenu=" onCellMarked(this,event,${i},${j})">`

            strHTML += '</td>\n'
        }
        strHTML += '</tr>\n'
    }

    elBoard.innerHTML = strHTML
}

function setMinesNegsCount(board) {
    for (var i = 0; i < gLevel.size; i++) {
        for (var j = 0; j < gLevel.size; j++) {
            board[i][j].minesAroundCount = checkCellNegsCount(board, i, j)
        }
    }
}

function checkCellNegsCount(board, row, cols) {
    var count = 0

    for (var i = row - 1; i <= row + 1; i++) {
        if (i < 0 || i === gLevel.size)
            continue

        for (var j = cols - 1; j <= cols + 1; j++) {
            if (j < 0 || j === gLevel.size || i === row && j === cols)
                continue

            if (board[i][j].isMine) {
                count++
            }
        }
    }

    return count
}

function onCellClicked(elCell, i, j) {
    var currCell = gBoard[i][j]

    if (!gGame.isOn || currCell.isMarked || currCell.isShown) return

    if(gBonus.selfMine && gBonus.mines) {
        placeMine(elCell, i, j)

        return
    }

    if (gBonus.mega.isOn && !gBonus.mega.isUsed) {
        if (gBonus.mega.i === null) {
            elCell.classList.add('safe-cell')
            gBonus.mega.i = i
            gBonus.mega.j = j
        } else {
            showMegaHint(gBonus.mega.i, i, gBonus.mega.j, j)

            gBonus.mega.isUsed = true
        }

        return
    }

    if (gFirstClick) {
        gDate = Date.now()
        gTimeCounter = setInterval(() => {
            updateTime()
        }, 1000)
    }

    if (gBonus.isHint) {
        showHintNeg(i, j)

        gBonus.isHint = false

        return
    }

    currCell.isShown = true
    elCell.classList.remove('cell')
    
    if (currCell.isMine) {
        if (!gFirstClick) {
            mineClicked(elCell, currCell)
            
            return
            
        } else {
            var mineCell = getEmptyPos(gBoard)
            
            gBoard[mineCell.i][mineCell.j].isMine = true
            currCell.isMine = false
            
            setMinesNegsCount(gBoard)
        }
    }
    
    gBonus.undo.push({elCell, cell: currCell, i, j})
    gFirstClick = false
    elCell.classList.add('clicked')
    elCell.innerHTML = currCell.minesAroundCount < 1 ? '' : currCell.minesAroundCount

    if (currCell.minesAroundCount === 0) revealNegs(i, j)
    else elCell.classList.add(sayNum(currCell.minesAroundCount))


    checkGameOver()
}

function mineClicked(elCell, currCell) {
    elCell.innerHTML = MINE
    elCell.classList.add('mine-clicked')
    gGame.life--
    gBonus.undo.push({isMine: true})
    updateLife(gGame.life)

    if (!gGame.life) {
        gameOver(false)

        return
    }

    setTimeout(() => {
        if (!gGame.isOn) return

        elCell.innerHTML = EMPTY
        elCell.classList.remove('mine-clicked')
        elCell.classList.add('cell')
        currCell.isShown = false
    }, 2000);
}

function onCellMarked(elCell, e, i, j) {
    e.preventDefault()

    if (!gGame.isOn) return

    var currCell = gBoard[i][j]

    if (currCell.isShown) return

    gBonus.undo.push({elCell, cell: currCell, i, j})
    currCell.isMarked = !currCell.isMarked
    elCell.classList.toggle('flag')
    elCell.classList.toggle('cell')

    elCell.innerHTML = elCell.innerHTML ? null : FLAG

    checkGameOver()
}

function checkGameOver() {
    for (var i = 0; i < gLevel.size; i++) {
        for (var j = 0; j < gLevel.size; j++) {
            var currCell = gBoard[i][j]

            if (currCell.isMine && !currCell.isMarked) return
            if (!currCell.isMine && !currCell.isShown) return
        }
    }

    gameOver(true)
}

function gameOver(isWon) {
    gGame.isOn = false

    const elBtn = document.querySelector('.smile')

    elBtn.src = isWon ? 'img/winner.jpeg' : 'img/loser.webp'

    clearInterval(gTimeCounter)

    if (!isWon) revelMines()
}

