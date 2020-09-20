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

var state = {
  x: 10,
  y: 10,
  pressedKeys: {
    up: false,
    down: false
  },
  color: 0
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

function update(progress) {
  // Update the state of the world

  // cycle color, just to make the framerate clear!
  state.color++;
  if (state.color > 2){
    state.color = 0;
  }

  // move state according to user input
  if (state.pressedKeys.left) {
    state.x--;
  }
  if (state.pressedKeys.right) {
    state.x++;
  }
  if (state.pressedKeys.up) {
    state.y--;
  }
  if (state.pressedKeys.down) {
    state.y++;
  }

  // keep in bounds
  if (state.x > 19){
    state.x = 19;
  }
  if (state.y > 19){
    state.y = 19;
  }
  if (state.x < 0){
    state.x = 0;
  }
  if (state.y < 0){
    state.y = 0;
  }  
}

function draw() {
  // draw the world - clear canvas, draw square at current loc
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  drawSquare(ctx,state.x,state.y,cycleColors[state.color]);
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