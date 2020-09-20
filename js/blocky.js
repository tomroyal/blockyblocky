console.log('go blocky');

// define global oject of color codes
var colorCodes = {'red':'#ff0000','green':'#00ff00','blue':'#0000ff','white':'#ffffff'};
var cycleColors = ["red", "green", "blue"]; // just for convenience of iterating
var canvasWidth = 400;
var canvasHeight = 400;
var canvasWidthUnits = 20;
var canvasHeightUnits = 20;
var framesPerSec = 10;
var lastRender = 0;
var sideSpeed = 10; // frames
var sideCounter = 0;

var state = {
  pressedKeys: {
    up: false,
    down: false,
    left: false,
    right: false
  },
  onScreen : {
    movingRight: [
      {
        x : 2,
        y : 10,
        color: 1
      },
      {
        x : 6,
        y : 15,
        color: 2
      }    
    ],
    movingLeft: [
      {
        x : 15,
        y : 18,
        color: 0
      }  
    ]
  }
}

function drawSquare(canvas,hLoc,vLoc,color){
  // draws a single unit
  canvas.fillStyle = colorCodes[color];
  canvas.fillRect(hLoc*(canvasWidth/canvasWidthUnits), vLoc*(canvasHeight/canvasHeightUnits), (canvasWidth/canvasWidthUnits), (canvasHeight/canvasHeightUnits));
}

function drawChequers(ctx){
  // draws an rgb grid as a test
  
  colorIndex = 0
  for (x = 0; x < canvasWidthUnits; x++) {
    for (y = 0; y < canvasHeightUnits; y++) {
      drawSquare(ctx,x,y,cycleColors[colorIndex]);
      colorIndex++;
      if (colorIndex == 3){
        colorIndex = 0;
      }
    }
  }
}

// really useful explainer and sample code on the game loop using state, loop and draw:
// https://www.sitepoint.com/quick-tip-game-loop-in-javascript/

function checkBounds(movingItem){
  // keep item in bounds - clip to other side if exceeded
  if (movingItem.x > (canvasWidthUnits - 1)){
    movingItem.x = 0;
  }
  else if (movingItem.x < 0){
      movingItem.x = (canvasWidthUnits - 1);
  }
  if (movingItem.y > (canvasHeightUnits - 1)){
    movingItem.y = 0;
  }
  else if (movingItem.y < 0){
      movingItem.y = (canvasHeightUnits - 1);
  }
  return movingItem;
}

function moveGroup(theGroup,movex,movey){
  for (var i = 0, l = theGroup.length; i < l; i++) {
    theGroup[i].x = theGroup[i].x + movex;
    theGroup[i].y = theGroup[i].y + movey;
    theGroup[i] = checkBounds(theGroup[i]);
  }
  return theGroup;
}

function update(progress) {
  // Update the state of the world

  // move U/D state according to user input
  if (state.pressedKeys.up) {
    // input up
    // move right units down
    state.onScreen.movingRight = moveGroup(state.onScreen.movingRight,0,-1);
    // move left units up
    state.onScreen.movingLeft = moveGroup(state.onScreen.movingLeft,0,1);    
  }
  if (state.pressedKeys.down) {
    // input down
    // move right units up
    state.onScreen.movingRight = moveGroup(state.onScreen.movingRight,0,1);
    // move left units down
    state.onScreen.movingLeft = moveGroup(state.onScreen.movingLeft,0,-1);
  }
  
  // move R/L state according to timer
  sideCounter++;
  if (sideSpeed == sideCounter){    
    // move right
    state.onScreen.movingRight = moveGroup(state.onScreen.movingRight,1,0);
    // move left
    state.onScreen.movingLeft = moveGroup(state.onScreen.movingLeft,-1,0);
    // reset counter until next R/L move
    sideCounter = 0;
  }
}

function draw() {
  // draw the world - clear canvas
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  // draw right moving items
  for (var i = 0, l = state.onScreen.movingRight.length; i < l; i++) {
    var thisSquare = state.onScreen.movingRight[i];
    drawSquare(ctx,thisSquare.x,thisSquare.y,cycleColors[thisSquare.color]);
  }
  // TODO draw left moving items
  for (var i = 0, l = state.onScreen.movingLeft.length; i < l; i++) {
    var thisSquare = state.onScreen.movingLeft[i];
    drawSquare(ctx,thisSquare.x,thisSquare.y,cycleColors[thisSquare.color]);
  }
  
}

function loop(timestamp) {
  // loop to control frames - self-reinitiates
  setTimeout(function(){ 
      var progress = timestamp - lastRender;

      update(progress);
      draw();

      lastRender = timestamp;
      window.requestAnimationFrame(loop);
    }, 1000/framesPerSec); 
}

// listen for key inputs and set state accordingly

var keyMap = {
  39: 'right',
  37: 'left',
  38: 'up',
  40: 'down'
}
function keydown(event) {
  var key = keyMap[event.keyCode]
  state.pressedKeys[key] = true
}
function keyup(event) {
  var key = keyMap[event.keyCode]
  state.pressedKeys[key] = false
}

window.addEventListener("keydown", keydown, false)
window.addEventListener("keyup", keyup, false)


// listen for canvas load, get a ref to the canvas, then init loop

document.addEventListener("DOMContentLoaded", function(event) { 
  var blockyCanvas = document.getElementById("blockyCanvas");
  var ctx = blockyCanvas.getContext("2d");
  window.ctx = ctx;
  window.requestAnimationFrame(loop)
});  