let width = 25
let height = 25
let mines = 120
let mineRange = 1.5

let currentZoom = 1
const minZoom = 1.25 ** -10

let tileSide = 45

let openedTiles = 0

let isTiming = false
let startingTime = undefined

const board = []
const tiles = []

let mouseX = -1
let mouseY = -1

let minesAdded = false

let clickedAt = undefined

function createBoard() {
    minesAdded = false
    for (let y = 0; y < height; y++) {
        const boardRow = []
        for (let x = 0; x < width; x++) {
            const dupeY = y
            const dupeX = x
            let tile = document.createElement("div")
            tile.classList.add("tile")
            tile.style.left = tileSide * x
            tile.style.top = tileSide * y
            tile.style.width = tileSide
            tile.style.height = tileSide
            tile.style.fontSize = tileSide * 0.6
            tile.style.zIndex = 0
            tile.classList.add((x + y) % 2 == 1 ? "dark" : "light")
            body.appendChild(tile)
            tiles.push(tile)
            const open = (() => {
                if(!minesAdded) {
                    addMines(dupeY, dupeX)
                }
                const currentTile = board[dupeY][dupeX]
                if(currentTile.isOpen) {
                    for(let dx = -Math.ceil(Math.sqrt(0.5) * mineRange); dx <= Math.ceil(Math.sqrt(0.5) * mineRange); dx++) for(let dy = -Math.ceil(Math.sqrt(0.5) * mineRange); dy <= Math.ceil(Math.sqrt(0.5) * mineRange); dy++) try{if( dy * dy + dx * dx <= mineRange * mineRange && !board[dupeY + dy][dupeX + dx].flagged && !board[dupeY + dy][dupeX + dx].isOpen) board[dupeY + dy][dupeX + dx].open()} catch {}
                    return;
                }
                openedTiles++
                if(openedTiles >= (width * height - mines)) {
                    if(isTiming) timer.innerText = "Completed in " + timer.innerText
                    isTiming = false
                    let button = document.createElement("div")
                    button.id = "restart"
                    button.innerText = "Restart"
                    button.onclick = () => {window.location.reload()}
                    body.appendChild(button)
                }
                board[dupeY][dupeX].isOpen = true
                currentTile.ref.classList.add((dupeX + dupeY) % 2 == 1 ? "open_dark" : "open_light")
                if(currentTile.isMine) {
                    currentTile.ref.innerText = "💣"
                    if(isTiming) timer.innerText = "Lost in " + timer.innerText
                    isTiming = false
                    let button = document.createElement("div")
                    button.id = "restart"
                    button.innerText = "Restart"
                    button.onclick = () => {window.location.reload()}
                    body.appendChild(button)
                } else {
                    if(currentTile.number == 0) currentTile.ref.innerText = ""
                    else currentTile.ref.innerText = currentTile.number
                }

                if(currentTile.number == 0 && !currentTile.isMine) for(let dx = -1; dx <= 1; dx++) {
                    for(let dx = -Math.ceil(Math.sqrt(0.5) * mineRange); dx <= Math.ceil(Math.sqrt(0.5) * mineRange); dx++) for(let dy = -Math.ceil(Math.sqrt(0.5) * mineRange); dy <= Math.ceil(Math.sqrt(0.5) * mineRange); dy++) try{if( dy * dy + dx * dx <= mineRange * mineRange && !board[dupeY + dy][dupeX + dx].isOpen) board[dupeY + dy][dupeX + dx].open()} catch {}
                }

            })
            const flag = (() => {
                const currentTile = board[dupeY][dupeX]
                if(currentTile.isOpen) {
                    for(let dx = -Math.ceil(Math.sqrt(0.5) * mineRange); dx <= Math.ceil(Math.sqrt(0.5) * mineRange); dx++) for(let dy = -Math.ceil(Math.sqrt(0.5) * mineRange); dy <= Math.ceil(Math.sqrt(0.5) * mineRange); dy++) try{if( dy * dy + dx * dx <= mineRange * mineRange && !board[dupeY + dy][dupeX + dx].flagged && !board[dupeY + dy][dupeX + dx].isOpen) board[dupeY + dy][dupeX + dx].flag()} catch {}
                    return;
                }
                if(currentTile.ref.innerText == "🚩") {
                    currentTile.ref.innerText = ""
                    currentTile.flagged = false
                } else {
                    currentTile.ref.innerText = "🚩"
                    currentTile.flagged = true
                }
            })
            boardRow.push({
                ref: tile,
                x: dupeX,
                y: dupeY,
                number: 0,
                open,
                flag,
                isOpen: false,
                flagged: false
            })
            
            tile.onclick = (() => {
                if(Date.now() - clickedAt >= 300) {
                    flag()
                } else open()
            })
            tile.ontouchend = (() => {
                if(Date.now() - clickedAt >= 300) {
                    flag()
                } else open()
            })
            tile.onauxclick = flag
        }
        board.push(boardRow)
    }
}

function addMines(clickY, clickX) {
    let minesLeft = mines
    let totalTiles = width * height
    let power = 1

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < height; x++) {
            const sqDistance = (clickY - y) * (clickY - y) + (clickX - x) * (clickX - x)
            const edgeDistance = 1 / (1 / Math.min(x, width - x) + 1 / Math.min(y, height - y))
            const isMine = Math.random() < Math.pow((minesLeft / totalTiles), sqDistance <= 5 ? 100 : (sqDistance <= 10 ? power * 1.5 : ((edgeDistance <= 2) ? power * 1.5 : power)))
            board[y][x].isMine = isMine
            if(isMine) {
                minesLeft--
                power = 2
            }
            totalTiles--
            power = 0.75 + (power - 0.75) / 2
        }
    }
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if(board[y][x].isMine) continue;
            let nearbyMines = 0
            for(let dx = -Math.ceil(Math.sqrt(0.5) * mineRange); dx <= Math.ceil(Math.sqrt(0.5) * mineRange); dx++) for(let dy = -Math.ceil(Math.sqrt(0.5) * mineRange); dy <= Math.ceil(Math.sqrt(0.5) * mineRange); dy++) try{if(board[y+dy][x+dx].isMine && dy * dy + dx * dx <= mineRange * mineRange) nearbyMines++} catch {}
            board[y][x].number = nearbyMines
        }
    }

    
    

    minesAdded = true
}

document.addEventListener("wheel", (event) => {
    let scale = (event.deltaY < 0) ? 0.8 : 1.25
    if(scale < 1 && currentZoom <= minZoom) return;
    currentZoom *= scale

    for(tile of tiles) {
        let x = tile.style.left
        let y = tile.style.top
        x = +(x.substring(0, x.length - 2))
        y = +(y.substring(0, y.length - 2))

        tile.style.left = mouseX + scale * (x - mouseX)
        tile.style.top = mouseY + scale * (y - mouseY)

        let w = tile.style.width
        let h = tile.style.height
        let f = tile.style.fontSize
        w = +(w.substring(0, w.length - 2))
        h = +(h.substring(0, h.length - 2))
        f = +(f.substring(0, f.length - 2))

        tile.style.width = w * scale
        tile.style.height = h * scale
        tile.style.fontSize = f * scale
    }
})

document.addEventListener("mousemove", (event) => {
    mouseX = event.clientX
    mouseY = event.clientY

    let xMovement = event.movementX
    let yMovement = event.movementY

    if(event.buttons >= 1) {
        for(tile of tiles) {
            let x = tile.style.left
            let y = tile.style.top
            x = +(x.substring(0, x.length - 2))
            y = +(y.substring(0, y.length - 2))

            tile.style.left = x + xMovement
            tile.style.top = y + yMovement
        }
    }
})

document.addEventListener("contextmenu", (event) => {
    event.preventDefault()
})

document.addEventListener("mousedown", (event) => {
    clickedAt = Date.now()
})

document.addEventListener("touchstart", (event) => {
    clickedAt = Date.now()
})

document.addEventListener("touchmove", (event) => {
    mouseX = event.clientX
    mouseY = event.clientY

    let xMovement = event.movementX
    let yMovement = event.movementY

    if(event.buttons >= 1) {
        for(tile of tiles) {
            let x = tile.style.left
            let y = tile.style.top
            x = +(x.substring(0, x.length - 2))
            y = +(y.substring(0, y.length - 2))

            tile.style.left = x + xMovement
            tile.style.top = y + yMovement
        }
    }
})

Iwidth.oninput = (() => {
    const prev = width
    width = Iwidth.value
    mines *= width / prev
    mines = Math.round(mines)
    Imines.value = mines
})

Iheight.oninput = (() => {
    const prev = height
    height = Iheight.value
    mines *= height / prev
    mines = Math.round(mines)
    Imines.value = mines
})

Imines.oninput = (() => {
    mines = Imines.value
})

Imdr.oninput = (() => {
    mineRange = Imdr.value
})

start.onclick = (() => {
    document.getElementById("config").remove()
    startingTime = Date.now()
    isTiming = true
    createBoard()
})

randomizer.onclick = (() => {
    width = (5 + Math.floor(Math.random() * 36))
    height = (5 + Math.floor(Math.random() * 36))
    mineRange = 0.1 * (15 + Math.floor(Math.random() * 16))
    mines = Math.floor(width * height * (2.25 / mineRange / mineRange) * (0.1 + Math.random() * 0.15))
    Iwidth.value = width
    Iheight.value = height
    Imines.value = mines
    Imdr.value = mineRange
})

addEventListener("keydown", (event) => {
    if(event.key == "p") {
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                board[y][x].open()
            }
        }
    }
})

setInterval(() => {
    if(!isTiming) return;

    let time = Math.round((Date.now() - startingTime) / 10) / 100

    time = Math.round((Date.now() - startingTime) / 10) / 100

    if(time % 1 == 0) time += ".0"
    if((time * 10) % 1 == 0) time += "0"
    document.getElementById("timer").innerText = time

}, 10)