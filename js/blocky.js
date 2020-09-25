console.log('go blocky');

// TODO next - remove elements when they collide successfully and score - using delete array[n] maybe?

// define global oject of color codes
var colorCodes = {'red':'#ff0000','green':'#00ff00','blue':'#0000ff','white':'#ffffff'};
var cycleColors = ["red", "green", "blue"]; // just for convenience of iterating
var canvasWidth = 400;
var canvasHeight = 400;
var canvasWidthUnits = 20;
var canvasHeightUnits = 20;
var framesPerSec = 10;
var lastRender = 0;
var sideSpeed = 7; // frames
var sideCounter = 0;
var theScore = 0;
var lastObjectID = 2
var debugFrameCounter = 0;

var newSpriteCounter = 0;
var newSpriteEvery = 60;


// sample start state with a few items
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
        id: 1,
        x : 2,
        y : 10,
        color: 1,
        isMoving: true
      } 
    ],
    movingLeft: [      
      {
        id: 4,
        x : 14,
        y : 2,
        color: 1,
        isMoving: true
      }  
    ]
  }
}




// really useful explainer and sample code on the game loop using state, loop and draw:
// https://www.sitepoint.com/quick-tip-game-loop-in-javascript/

function drawSquare(canvas,hLoc,vLoc,color){
  // draws a single unit
  canvas.fillStyle = colorCodes[color];
  canvas.fillRect(hLoc*(canvasWidth/canvasWidthUnits), vLoc*(canvasHeight/canvasHeightUnits), (canvasWidth/canvasWidthUnits), (canvasHeight/canvasHeightUnits));
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
    for (var i = 0, l = state.onScreen.movingRight.length; i < l; i++) {
      if (state.onScreen.movingRight[i].x == potentialLocation.x){
        if (state.onScreen.movingRight[i].y == potentialLocation.y){
          // foundCollission = true;
          foundCollission = state.onScreen.movingRight[i].id;
        }
      }
    };
    for (var i = 0, l = state.onScreen.movingLeft.length; i < l; i++) {
      if (state.onScreen.movingLeft[i].x == potentialLocation.x){
        if (state.onScreen.movingLeft[i].y == potentialLocation.y){
          // foundCollission = true;
          foundCollission = state.onScreen.movingLeft[i].id;
        }
      }
    };  
  return foundCollission;
}

function getItemByID(id){
  // passed an id, return the object
  foundObject = false;
  for (var i = 0, l = state.onScreen.movingLeft.length; i < l; i++) {
    if (state.onScreen.movingLeft[i].id == id){
      foundObject = state.onScreen.movingLeft[i];
    }
  }
  // only check the other array if needed..
  if (foundObject === false){
    for (var i = 0, l = state.onScreen.movingRight.length; i < l; i++) {
      if (state.onScreen.movingRight[i].id == id){
        foundObject = state.onScreen.movingRight[i];
      }
    }
  } 
  return foundObject;
}

function stopItemMoving(id){
  findId = state.onScreen.movingLeft.findIndex(item => item.id == id);
  if (findId == -1){
    // in movingRight
    findId = state.onScreen.movingRight.findIndex(item => item.id == id);
    state.onScreen.movingRight[findId].isMoving = false;
  }
  else {
    state.onScreen.movingLeft[findId].isMoving = false;
  };
}

function checkCollissionType(id1,id2){
  // gets two collided item ids, check what to do with 'em
  console.log(id1+' hit '+id2);

  item1 = getItemByID(id1);
  item2 = getItemByID(id2);
  if (item1.color == item2.color){
    // inc score
    theScore = theScore + (sideSpeed*10);
    // init new blocks now
    newSpriteCounter = newSpriteEvery;
  }
  else {
    console.log('no score');
  }
}

function moveGroup(theGroup,movex,movey){  
  // move any isMoving items in array theGroup in direction movex,movey
  // also checks for collissions that might block the move and constrains in bounds
  for (var i = 0, l = theGroup.length; i < l; i++) {
    if (theGroup[i].isMoving) {
      var checkColl = checkCollission(theGroup[i],movex,movey);
      if (checkColl !== false){
        if (movey == 0){
          // this is a horiz move, so stop and possibly score
          stopItemMoving(theGroup[i].id);
          stopItemMoving(checkColl);
          checkCollissionType(theGroup[i].id,checkColl); // checks for score
        }
      }
      else {
        // no collide so move
        theGroup[i].x = theGroup[i].x + movex;
        theGroup[i].y = theGroup[i].y + movey;
        theGroup[i] = checkBounds(theGroup[i]);
      }    
    }  
  }
  return theGroup;
}

function randomIntFromInterval(min, max) { 
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function addNewBlocks(){
  // first check - what vacant spaces do we have on edges?
  var leftState = Array();
  var rightState = Array(); 
  // iterate all blocks, marking any where x = 0 or x = (canvasWidthUnits - 1)
  var allBlocks = state.onScreen.movingLeft.concat(state.onScreen.movingRight);
  for (var i = 0, l = allBlocks.length; i < l; i++) {
    if (allBlocks[i].x == 0){
      leftState.push(i);
    }
    else if (allBlocks[i].x == (canvasWidthUnits - 1)){
      rightState.push(i);
    }  
  };
  if ((leftState.length == canvasHeight) || (rightState.length == canvasHeight)){
    // all units occupied, yikes
    console.log('all occupied cannot add!');
  }
  else {
    // create array of clear left edge elements
    var leftClearSquares = Array();
    for (var i = 0, l = (canvasHeightUnits - 1); i < l; i++) {
      if (leftState.includes(i)){
        // full!
      }
      else {
        leftClearSquares.push(i);
      }
    }
    var rightClearSquares = Array();
    for (var i = 0, l = (canvasHeightUnits - 1); i < l; i++) {
      if (rightState.includes(i)){
        // full!
      }
      else {
        rightClearSquares.push(i);
      }
    }   
    // add new blocks in spaces
    var newLeftSpace = randomIntFromInterval(0, (canvasHeightUnits - leftState.length));
    var newLeftLocation = leftClearSquares[newLeftSpace];
    var newRightMovingBlock = {
      id : (lastObjectID+1),
      x : 0,
      y : newLeftLocation,
      color: randomIntFromInterval(0,2),
      isMoving: true
    };
    state.onScreen.movingRight.push(newRightMovingBlock); 
    
    var newRightSpace = randomIntFromInterval(0, (canvasHeightUnits - rightState.length));
    var newRightLocation = rightClearSquares[newRightSpace];
    console.log('New right at '+newRightLocation);
    var newLeftMovingBlock = {
      id : (lastObjectID+2),
      x : (canvasWidthUnits - 1),
      y : newRightLocation,
      color: randomIntFromInterval(0,2),
      isMoving: true
    };
    state.onScreen.movingLeft.push(newLeftMovingBlock);
    // update globals
    lastObjectID = (lastObjectID+2);
    newSpriteCounter = 0;
  }
}

function checkGameOver(){
  // check to see if anything still moving!
  foundMoving = false;
  for (var i = 0, l = state.onScreen.movingLeft.length; i < l; i++) {
    if (state.onScreen.movingLeft[i].isMoving){
      return false;
    }
  }
  for (var i = 0, l = state.onScreen.movingRight.length; i < l; i++) {
    if (state.onScreen.movingRight[i].isMoving){
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
  if (newSpriteCounter == newSpriteEvery){
    addNewBlocks();
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
  // draw left moving items
  for (var i = 0, l = state.onScreen.movingLeft.length; i < l; i++) {
    var thisSquare = state.onScreen.movingLeft[i];
    drawSquare(ctx,thisSquare.x,thisSquare.y,cycleColors[thisSquare.color]);
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