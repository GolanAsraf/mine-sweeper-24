'use strict'

function showHintNeg(row, cols) {
    for (var i = row - 1; i <= row + 1; i++) {
        if (i < 0 || i === gLevel.size) continue

        for (var j = cols - 1; j <= cols + 1; j++) {
            if (j < 0 || j === gLevel.size) continue

            var currCell = gBoard[i][j]

            if (currCell.isShown || currCell.isMarked) continue

            const elCell = document.querySelector(`.cell-${i}-${j}`)
            currCell.isShown = true
            elCell.classList.add(currCell.isMine ? 'mine-clicked' : 'clicked')
            elCell.classList.remove('cell')

            if (!currCell.isMine) elCell.innerHTML = currCell.minesAroundCount < 1 ? '' : currCell.minesAroundCount
            else elCell.innerHTML = MINE

            removeHint(currCell, elCell, 1000)
        }
    }
}

function removeHint(cell, elCell, time) {
    setTimeout(() => {
        cell.isShown = false
        elCell.classList.remove(cell.isMine ? 'mine-clicked' : 'clicked')
        elCell.classList.add('cell')
        elCell.innerHTML = ''
    }, time);
}

function toggleDark() {
    const elBody = document.querySelector('body')

    elBody.classList.toggle('dark-mode')
}

function useHint() {
    if (!gGame.isOn || gBonus.isHint || !gBonus.hint) return

    gBonus.isHint = true
    gBonus.hint--
    var res = ''

    for (var i = 0; i < gBonus.hint; i++) {
        res += HINT
    }

    const elHint = document.querySelector('.hint')

    elHint.innerHTML = res ? res : 'Sold out'
}

function showSafeCell() {
    if (!gGame.isOn || !gBonus.safe) return

    gBonus.safe--

    var location = getEmptyPos(gBoard)

    const elCell = document.querySelector(`.cell-${location.i}-${location.j}`)

    elCell.classList.add('safe-cell')

    setTimeout(() => {
        elCell.classList.remove('safe-cell')
    }, 1500);

    var res = ''

    for (var i = 0; i < gBonus.safe; i++) {
        res += SAFE
    }

    const elSafe = document.querySelector('.safe')

    elSafe.innerHTML = res ? res : 'Sold out'
}

function useMegaHint() {
    if (!gGame.isOn || gBonus.mega.isUsed) return

    gBonus.mega.isOn = true

    const elCell = document.querySelector('.mega')

    elCell.innerHTML = 'Sold out'
}

function showMegaHint(rowIdxStart, rowIdxEnd, colIdxStart, colIdxEnd) {
    for (var i = colIdxStart; i <= colIdxEnd; i++) {
        for (var j = rowIdxStart; j <= rowIdxEnd; j++) {
            var currCell = gBoard[j][i]

            if (currCell.isShown || currCell.isMarked) continue

            const elCell = document.querySelector(`.cell-${j}-${i}`)
            currCell.isShown = true
            elCell.classList.add(currCell.isMine ? 'mine-clicked' : 'clicked')
            elCell.classList.remove('cell')
            elCell.classList.remove('safe-cell')

            if (!currCell.isMine) elCell.innerHTML = currCell.minesAroundCount < 1 ? '' : currCell.minesAroundCount
            else elCell.innerHTML = MINE

            removeHint(currCell, elCell, 2000)
        }
    }
}

function useUndo() {
    if (!gGame.isOn || !gBonus.undo.length) return

    var currCell = gBonus.undo[gBonus.undo.length - 1]
    gBonus.undo.pop()

    if (currCell.isMine) {
        gGame.life++
        updateLife(gGame.life)

        return
    } else if (currCell.cell.isMarked) {
        currCell.cell.isMarked = false
        currCell.elCell.classList.remove('flag')
        currCell.elCell.classList.add('cell')
        currCell.elCell.innerHTML = ''

        return
    }

    if (currCell.cell.minesAroundCount) {
        removeHint(currCell.cell, currCell.elCell, 1)

        return
    }

    undoNegs(currCell.i, currCell.j)
}

function undoNegs(row, cols) {
    for (var i = row - 1; i <= row + 1; i++) {
        if (i < 0 || i === gLevel.size) continue

        for (var j = cols - 1; j <= cols + 1; j++) {
            if (j < 0 || j === gLevel.size) continue

            var currCell = gBoard[i][j]

            if (!currCell.isShown) continue

            var found = false
            for (var x = 0; x < gBonus.undo.length; x++) {
                if (i === gBonus.undo[x].i && j === gBonus.undo[x].j) {
                    found = true

                    break
                }
            }

            if (found) continue

            const elCell = document.querySelector(`.cell-${i}-${j}`)

            currCell.isShown = false
            elCell.classList.remove('clicked')
            elCell.classList.add('cell')
            elCell.innerHTML = ''

            if (currCell.minesAroundCount === 0) undoNegs(i, j)
        }
    }
}

function removeThreeMines() {
    if (!gGame.isOn || !gBonus.removeMines) return

    const elMine = document.querySelector('.mine')

    elMine.innerHTML = 'Sold out'
    gBonus.removeMines--

    for (var i = 0; i < 3; i++) {
        var pos = getRandomMinePos(gBoard)

        if (pos === null) break

        var currMine = gBoard[pos.i][pos.j]
        const elCell = document.querySelector(`.cell-${pos.i}-${pos.j}`)

        currMine.isMine = false
        elCell.classList.remove('mine-clicked')
    }

    setMinesNegsCount(gBoard)

    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            if (!gBoard[i][j].isShown || gBoard[i][j].isMine || gBoard[i][j].isMarked) continue

            const elCell = document.querySelector(`.cell-${i}-${j}`)

            elCell.innerHTML = gBoard[i][j].minesAroundCount < 1 ? '' : gBoard[i][j].minesAroundCount
        }
    }
}

function getRandomMinePos(board) {
    var minePoses = []

    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            if (board[i][j].isMine) {
                minePoses.push({ i, j })
            }
        }
    }

    if (!minePoses.length) return null

    return minePoses[getRandomIntInclusive(0, (minePoses.length - 1))]
}

function useSelfMine() {
    if (!gGame.isOn || gBonus.selfMine) return

    onInit()

    gBonus.selfMine = true

    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            if (!gBoard[i][j].isMine) continue

            gBoard[i][j].isMine = false
        }
    }

    const elSelfMine = document.querySelector('.self')

    elSelfMine.innerHTML = 'IN USE'
}

function placeMine(elCell, i, j) {
    var currCell = gBoard[i][j]

    if (currCell.isMine) return

    currCell.isMine = true
    elCell.classList.add('self-mine')
    gBonus.mines--

    if (!gBonus.mines) {
        const elSelf = document.querySelector('.self')

        elSelf.innerHTML = 'Sold out'
        clearSelfMineStyle()
        setMinesNegsCount(gBoard)
    }
}

function clearSelfMineStyle() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            if (!gBoard[i][j].isMine) continue

            const elCell = document.querySelector(`.cell-${i}-${j}`)

            elCell.classList.remove('self-mine')
        }
    }
}