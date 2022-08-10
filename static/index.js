// Constans
const ledW = 80;
const ledH = 45;
const ledS = 20;
const ledOffset = 1;
// Html objects
let colorpicker;
let back;
let Hide;
// Size of canvas
const Width = ledW * ledS + (ledW+1) * ledOffset;
const Height = ledH * ledS + (ledH+1) * ledOffset;
// Websocket
let ws;
// Arrays
let leds = [];
let pos = [];
let lastX;
let lastY;


class Pos {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

// p5.js functions
function setup() {
    createCanvas(Width, Height, P2D);
    noStroke();
    init_arrays();
    init_variables();
    init_websocket();
    setUp_variables();
    addHandlers();
}

function draw() {
    background(100);
    draw_matrix();
}

// Init functions

function init_variables() {
    colorpicker = document.getElementById('colorpicker');
    back = document.getElementById('back');
    Hide = document.getElementById('hide');
}

function addHandlers() {
    document.addEventListener('mousedown', mousePress);
    document.addEventListener('mouseup', mouseRelease);
    document.addEventListener('keydown', function (ev){ if (ev.key == 'h') back.hidden = false});
    window.addEventListener('beforeunload', (ev) => document.cookie = `color=${colorpicker.value}`);
}

function setUp_variables() {
    if (getMapFromCookie().get('color') != undefined)
        colorpicker.value = getMapFromCookie().get('color');
    Hide.onclick = () => back.hidden = true;
}

function init_websocket() {
    ws = new WebSocket(`ws://${document.location.host}/websocket`);
    ws.onmessage = handle_message;
    ws.onopen = () => {
        ws.send('initial update');
    }
}

function init_arrays(){
    for (let i = 0; i < ledW; i++) {
        leds[i] = [];
        pos[i] = [];
        for (let j = 0; j < ledH; j++) {
            leds[i].push('#000000');
            pos[i].push(new Pos(ledOffset + i*(ledS + ledOffset), ledOffset + j*(ledS + ledOffset)));
        }
    }
}

// Handlers functions

function mousePress(event){
    document.addEventListener('mousemove', mouseMove);
    mouseMove(event);
}

function mouseRelease(event){
    document.removeEventListener('mousemove', mouseMove);
}

function mouseMove(event){
    if (!back.hidden)
        return;
    let res = getXY();
    let x = res[0];
    let y = res[1];
    if (lastX == x && lastY == y)
        return
    else {
        lastX = x;
        lastY = y;
    }
    if (leds[x][y] == colorpicker.value && !event.ctrlKey)
        return;
    else if (event.ctrlKey && leds[x][y] == '#000000')
        return;
    if (x == undefined || y == undefined)
        return
    if (!event.ctrlKey)
        leds[x][y] = colorpicker.value;
    else
        leds[x][y] = '#000000';
    if (ws.readyState == ws.CLOSED){
        init_websocket();
        return;
    }
    ws.send(leds[x][y] + ',' + x + ',' + y);
}

function handle_message(ms){
    if (ms.data.startsWith('2,')){
        let spl = ms.data.split(',');
        leds[Number(spl[2])][Number(spl[3])] = spl[1];
    }
    else if (ms.data.startsWith('IU')){
        let data = ms.data.substring(2);
        let arr;
        eval('arr = ' + data);
        for (let i = 0; i < ledW; i++)
            for (let j = 0; j < ledH; j++)
                leds[i][j] = arr[i][j];
    }
    else if (ms.data == 'clear all'){
        for (let i = 0; i < ledW; i++)
            for (let j = 0; j < ledH; j++)
                leds[i][j] = '#000000';
    }
}

// ------------------------------------------------------------------

function getMapFromCookie(){
    let map = new Map();
    let cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++)
        map.set(cookies[i].split('=')[0], cookies[i].split('=')[1]);
    return map;
}


function getXY(){
    if (mouseX <= ledOffset || mouseX >= Width-ledOffset)
        return [undefined, undefined];
    if (mouseY <= ledOffset || mouseY >= Height-ledOffset)
        return [undefined, undefined];
    let x;
    let y;
    for (let i = 0; i < ledW; i++) {
        for (let j = 0; j < ledH; j++) {
            if (mouseX >= pos[i][j].x
                && mouseX <= pos[i][j].x + ledS
                && mouseY >= pos[i][j].y
                && mouseY <= pos[i][j].y + ledS) {
                x = i;
                y = j;
                break;
            }
        }
    }
    return [x, y];
}

function draw_matrix(){
    for (let i = 0; i < ledW; i++){
        for (let j = 0; j < ledH; j++){
            fill(leds[i][j]);
            rect(pos[i][j].x, pos[i][j].y, ledS, ledS);
        }
    }
}