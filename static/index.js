let ledW = 80
let ledH = 45
let ledS = 20
let ledOffset = 1
let canvas
let Width = ledW * ledS + (ledW+1) * ledOffset
let Height = ledH * ledS + (ledH+1) * ledOffset
let ws

class Pos{
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}


function setup() {
    canvas = createCanvas(Width, Height, P2D)
    init_arrays()
    noStroke()
    document.addEventListener('mousedown', mouse)
    ws = new WebSocket(document.baseURI.replace('http', 'ws') + 'websocket')
    ws.onmessage = handle_message
    ws.onopen = () => {ws.send('initial update')}
}

let leds = []
let pos = []

function draw() {
    background(100)
    draw_matrix()
}

function draw_matrix(){
    for (let i = 0; i < ledW; i++){
        for (let j = 0; j < ledH; j++){
            fill(leds[i][j])
            rect(pos[i][j].x, pos[i][j].y, ledS, ledS)
        }
    }
}

function init_arrays(){
    for (let i = 0; i < ledW; i++) {
        leds[i] = []
        pos[i] = []
        for (let j = 0; j < ledH; j++) {
            leds[i].push(0)
            pos[i].push(new Pos(ledOffset + i*(ledS + ledOffset), ledOffset + j*(ledS + ledOffset)))
        }
    }
}

function mouse(event){
    if (mouseX <= ledOffset || mouseX >= Width-ledOffset)
        return
    if (mouseY <= ledOffset || mouseY >= Height-ledOffset)
        return
    let x
    let y
    for (let i = 0; i < ledW; i++) {
        for (let j = 0; j < ledH; j++) {
            if (mouseX >= pos[i][j].x
                && mouseX <= pos[i][j].x + ledS
                && mouseY >= pos[i][j].y
                && mouseY <= pos[i][j].y + ledS) {
                x = i
                y = j
            }
        }
    }
    if (x != undefined && y != undefined){
        if (!event.ctrlKey)
            leds[x][y] = color(255, 0, 0)
        else
            leds[x][y] = 0
        ws.send((leds[x][y] == 0 ? "0," : "1,") + x + ',' + y) 
    }
}

function handle_message(ms){
    if (ms.data.startsWith('2,')){
        let spl = ms.data.split(',')
        leds[Number(spl[2])][Number(spl[3])] = spl[1] == '1' ? color(255, 0, 0) : 0
    }
    else if (ms.data.startsWith('IU')){
        let data = ms.data.substring(2)
        let arr
        eval('arr = ' + data)
        for (let i = 0; i < ledW; i++)
            for (let j = 0; j < ledH; j++)
                leds[i][j] = (arr[i][j] == 0 ? 0 : color(255, 0, 0))
    }
}
