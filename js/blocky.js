console.log('go blocky');

// define global oject of color codes
var colorCodes = {'red':'#ff0000','green':'#00ff00','blue':'#0000ff','white':'#ffffff'};
var cycleColors = ["red", "green", "blue"]; // just for convenience of iterating
var canvasWidth = 400;
var canvasHeight = 400;
var canvasWidthUnits = 30;
var canvasHeightUnits = 30;
var framesPerSec = 15;
var lastRender = 0;
var sideSpeed = 10; // frames
var sideCounter = 0;
var theScore = 0;
var lastObjectID = 2
var debugFrameCounter = 0;

var newSpriteCounter = 0;
var newSpriteEvery = 80;
var growMode = false;

// sample start state with a few items
var state = {
  pressedKeys: {
    up: false,
    down: false,
    left: false,
    right: false
  },
  onScreen : [
    {
      id: 1,
      x : 0,
      y : 14,
      color: 1,
      isMoving: 'right'
    }, 
    {
      id: 2,
      x : 7,
      y : 2,
      color: 1,
      isMoving: 'left'
    }  
  ]  
}




// really useful explainer and sample code on the game loop using state, loop and draw:
// https://www.sitepoint.com/quick-tip-game-loop-in-javascript/

function drawSquare(canvas,hLoc,vLoc,color){
  // draws a single unit
  canvas.fillStyle = colorCodes[color];
  canvas.fillRect(hLoc*(canvasWidth/canvasWidthUnits), vLoc*(canvasHeight/canvasHeightUnits), (canvasWidth/canvasWidthUnits), (canvasHeight/canvasHeightUnits));
}

function drawArrow(canvas,hLoc,vLoc,color,direction){
  // draws a single triangle
  canvas.fillStyle = colorCodes[color];
  var path=new Path2D();
  if (direction == 'right'){
    path.moveTo(hLoc*(canvasWidth/canvasWidthUnits),(vLoc*(canvasHeight/canvasHeightUnits)));
    path.lineTo(((hLoc+1)*(canvasWidth/canvasWidthUnits)),((vLoc+0.5)*(canvasHeight/canvasHeightUnits)));
    path.lineTo(hLoc*(canvasWidth/canvasWidthUnits),(vLoc+1)*(canvasHeight/canvasHeightUnits));
  }
  else {
    path.moveTo((hLoc+1)*(canvasWidth/canvasWidthUnits),(vLoc*(canvasHeight/canvasHeightUnits)));
    path.lineTo(((hLoc)*(canvasWidth/canvasWidthUnits)),((vLoc+0.5)*(canvasHeight/canvasHeightUnits)));
    path.lineTo((hLoc+1)*(canvasWidth/canvasWidthUnits),(vLoc+1)*(canvasHeight/canvasHeightUnits));
  }
  canvas.fill(path);
}

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

function checkCollission(thisItem,movex,movey){
  // receives individual item and intended travel, checks if something there (true) or not (false)
  // create object of potential new location
  var potentialLocation = {
    x : (thisItem.x + movex),
    y : (thisItem.y + movey)
  }
  // constrain  potential location in bounds
  potentialLocation = checkBounds(potentialLocation);
  // set up return var
  var foundCollission = false;
  // iterate all units, moving or not
    for (var i = 0, l = state.onScreen.length; i < l; i++) {
      if (state.onScreen[i].x == potentialLocation.x){
        if (state.onScreen[i].y == potentialLocation.y){
          foundCollission = state.onScreen[i].id;
        }
      }
    };
  return foundCollission;
}

function getItemByID(id){
  // passed an id, return the object
  for (var i = 0, l = state.onScreen.length; i < l; i++) {
    if (state.onScreen[i].id == id){
      foundObject = state.onScreen[i];
    }
  }
  return foundObject;
}

function stopItemMoving(id){
  findId = state.onScreen.findIndex(item => item.id == id);
  state.onScreen[findId].isMoving = 'no';
}

function deleteItemById(deleteItemId){
  // console.log('delete '+deleteItemId);
  //  delete the block with id deleteItemId
  var newMoving = Array();
  for (var i = 0, l = state.onScreen.length; i < l; i++) {
    if (state.onScreen[i].id == deleteItemId){
      foundAlready = true;
    }
    else {
      newMoving.push(state.onScreen[i]);
    }
  }
  state.onScreen.length = 0;
  state.onScreen = state.onScreen.concat(newMoving);

  return;
}

function checkCollissionType(id1,id2){
  // gets two collided item ids, check what to do with 'em
  // console.log(id1+' hit '+id2);

  item1 = getItemByID(id1);
  item2 = getItemByID(id2);
  if (item1.color == item2.color){
    // inc score
    theScore = theScore + (sideSpeed*10);
    // remove those items!
    deleteItemById(id1);
    deleteItemById(id2);
    // init new blocks now
    newSpriteCounter = newSpriteEvery; 
    if (growMode) {
      canvasWidthUnits++;
      canvasHeightUnits++;
    }
    
    
  }
  else {
    // no score!
  }
}

function moveGroup(theFilter,movex,movey){  
  // move any isMoving = theFilter items in array theGroup in direction movex,movey
  // also checks for collissions that might block the move and constrains in bounds
  for (var i = 0, l = state.onScreen.length; i < l; i++) {
    if(typeof state.onScreen[i] !== 'undefined') {
      if (state.onScreen[i].isMoving == theFilter) {
        var checkColl = checkCollission(state.onScreen[i],movex,movey);
        if (checkColl !== false){
          if (movey == 0){
            // this is a horiz move, so stop and possibly score
            stopItemMoving(state.onScreen[i].id);
            stopItemMoving(checkColl);
            checkCollissionType(state.onScreen[i].id,checkColl); // checks for score
          }
        }
        else {
          // no collide so move
          state.onScreen[i].x = state.onScreen[i].x + movex;
          state.onScreen[i].y = state.onScreen[i].y + movey;
          state.onScreen[i] = checkBounds(state.onScreen[i]);
        }    
      }
    }  
  }
  return;
}

function randomIntFromInterval(min, max) { 
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function addNewBlocks(){
  // this really is ugly af
  // first check - what vacant spaces do we have on edges?
  var leftState = Array();
  var rightState = Array(); 
  for (var i = 0, l = (canvasHeightUnits); i < l; i++) {
    // default value of square is empty
    leftState[i] = 0;
    rightState[i] = 0;
  }
  // iterate all blocks, marking any where x = 0 or x = (canvasWidthUnits - 1)
  for (var i = 0, l = state.onScreen.length; i < l; i++) {
    if (state.onScreen[i].x == 0){
      leftState[state.onScreen[i].y] = 1;
    }
    else if (state.onScreen[i].x == (canvasWidthUnits - 1)){
      rightState[state.onScreen[i].y] = 1;
    }  
  };
  // count current occupancy of those edge areas
  var leftEdgeWeight = leftState.reduce((a, b) => a + b, 0);
  var rightEdgeWeight = rightState.reduce((a, b) => a + b, 0);
  // is.. there any room?
  if ((leftEdgeWeight == canvasHeightUnits) || (rightEdgeWeight == canvasHeightUnits)){
    // one edge is full
    console.log('cannot add new blocks..');
    newSpriteCounter = 0;
  }
  else {
    // calculate a random position limited by the available space
    var newLeftSpace = randomIntFromInterval(0, (canvasHeightUnits - leftEdgeWeight));
    var leftCounter = 0;
    var foundLoc = 0;
    for (var i = 0, l = (canvasHeightUnits); i < l; i++) {
      if (leftState[i] == 0){
        if (leftCounter == newLeftSpace){
          foundLoc = i;
        }
        leftCounter++;
      }
    }
    console.log(newLeftSpace+'th empty space is '+foundLoc);
    
    var newRightMovingBlock = {
      id : (lastObjectID+1),
      x : 0,
      y : foundLoc,
      color: randomIntFromInterval(0,2),
      isMoving: 'right'
    };
    state.onScreen.push(newRightMovingBlock); 
    
    // repeat, urgh

    var newRightSpace = randomIntFromInterval(0, (canvasHeightUnits - rightEdgeWeight));
    var rightCounter = 0;
    var foundLoc = 0;
    for (var i = 0, l = (canvasHeightUnits); i < l; i++) {
      if (rightState[i] == 0){
        if (rightCounter == newRightSpace){
          foundLoc = i;
        }
        rightCounter++;
      }
    }
    console.log(newRightSpace+'th empty space is '+foundLoc);
    
    var newLeftMovingBlock = {
      id : (lastObjectID+2),
      x : (canvasWidthUnits - 1),
      y : foundLoc,
      color: randomIntFromInterval(0,2),
      isMoving: 'left'
    };
    state.onScreen.push(newLeftMovingBlock); 
    
    // update globals
    
    lastObjectID = (lastObjectID+2);
    newSpriteCounter = 0;
    
  }  

}

function checkGameOver(){
  // check to see if anything still moving!
  foundMoving = false;
  for (var i = 0, l = state.onScreen.length; i < l; i++) {
    if (state.onScreen[i].isMoving != 'no'){
      return false;
    }
  }
  // not found a moving item? in that case, game over.
  return true;
}

function update(progress) {
  // Update the state of the world

  // move U/D state according to user input
  if (state.pressedKeys.up) {
    // input up
    // move right units down
    moveGroup('right',0,-1);
    // move left units up
    moveGroup('left',0,1);    
  }
  if (state.pressedKeys.down) {
    // input down
    // move right units up
    moveGroup('right',0,1);
    // move left units down
    moveGroup('left',0,-1);
  }
  
  // move R/L state according to timer
  sideCounter++;
  if (sideSpeed == sideCounter){    
    // move right
    moveGroup('right',1,0);
    // move left
    moveGroup('left',-1,0);
    // reset counter until next R/L move
    sideCounter = 0;
  }
  if (newSpriteCounter == newSpriteEvery){
    addNewBlocks();
  }
}

function draw() {
  // draw the world - clear canvas
  // console.log(JSON.parse(JSON.stringify(state.onScreen)));
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  // draw all moving items
  for (var i = 0, l = state.onScreen.length; i < l; i++) {
    var thisSquare = state.onScreen[i];
    if ((thisSquare.y < 0) || (thisSquare.y > canvasWidthUnits)){
      console.log('whut '.thisSquare.id);
    }
    if (thisSquare.isMoving == "no"){
      drawSquare(ctx,thisSquare.x,thisSquare.y,cycleColors[thisSquare.color]);
    }
    else {
      drawArrow(ctx,thisSquare.x,thisSquare.y,cycleColors[thisSquare.color],thisSquare.isMoving);
    }
    
  }

  // draw score
  document.getElementById('blockyScore').innerHTML = 'Score '+theScore;
  // debug counter
  document.getElementById('blockyFrameCounter').innerHTML = debugFrameCounter;
}

function loop(timestamp) {
  // loop to control frames - self-reinitiates
  debugFrameCounter++;
  newSpriteCounter++;
  if (checkGameOver()){
    // um, game over
    console.log('Game over!');
  }
  else if (state.pressedKeys.left) {
    // QUIT
  }  
  else {
    setTimeout(function(){ 
        var progress = timestamp - lastRender;

        update(progress);

        draw();

        lastRender = timestamp;
        window.requestAnimationFrame(loop);
      }, 1000/framesPerSec); 
  }
  
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
  window.requestAnimationFrame(loop);
});  