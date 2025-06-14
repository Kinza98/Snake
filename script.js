window.addEventListener("load", function(){
  this.document.getElementById("pre-loader").classList.add("d-none");  // close the loader
  const controls = this.document.getElementById("controls");  // buttons
  const headingStats = this.document.querySelector(".stats");  // heading 
  // canvas element
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  let message = "";
  let startTime = 0;
  const gameState = {
    snake: [
    {x:40, y:0}, // head
    {x:20, y:0},
    {x: 0, y:0}, //tail
    ],
    boxSize: 20,
    food: {},
    walls: [],
    level: 1,
    score: 0,
    highScore: 0,
    speed: 200,
    direction: "right",
    gameOver: false,
    state: "run"
  }
  gameState.food = {  //snake food
    x: Math.floor((Math.random()*canvas.width)/ gameState.boxSize)*gameState.boxSize,
    y: Math.floor((Math.random()*canvas.height)/ gameState.boxSize)*gameState.boxSize
  }

  gameState.highScore = gameState.level === 1 ? (localStorage.getItem("e_highestScore") || 0) : (localStorage.getItem("h_highestScore") || 0)

  // draws snake
  function drawSnake(){
    gameState.snake.forEach((s, i) => {
      ctx.beginPath();
      ctx.fillStyle = "#39FF14";
      ctx.strokeStyle = "#00C853";
      if(i === gameState.snake.length-1) // make a tail its its last element of snake
        ctx.ellipse(s.x+gameState.boxSize/2, s.y+gameState.boxSize/2, gameState.boxSize/2, gameState.boxSize/3, 0, 0, 2*Math.PI);
      else
        ctx.arc(s.x+gameState.boxSize/2, s.y+gameState.boxSize/2, gameState.boxSize/2, 0, 2*Math.PI);  // body of snake

      ctx.fill();
      ctx.stroke();

      if(i === 0){  // add eyes it its head of the snake
        ctx.beginPath();
        ctx.fillStyle = "green";
        ctx.arc(s.x+gameState.boxSize/1.5, s.y+gameState.boxSize/4, gameState.boxSize/5, 0, 2*Math.PI);
        ctx.fill();
      }
    })
  }
  
  // store wall coordinates into wall variable
  function createWalls(){
    let nWall = Math.floor(Math.random()*2)+3 // 3-5
    for(let j = 0; j<nWall; j++){
      let wallLength = Math.floor(Math.random()*3)+5  // 5-7
      let wallType = Math.floor(Math.random()*3)
      let s = wallLength * gameState.boxSize;
      let newWall = getWall(wallType, s); 
      let x = newWall.x;
      let y = newWall.y;
      for(let i =0; i<wallLength; i++){
        if(wallType == 0)
          gameState.walls.push({x:x+i*gameState.boxSize, y:y})
        else if(wallType == 1)
          gameState.walls.push({x:x, y:y+i*gameState.boxSize})
        else if(wallType == 2){
          gameState.walls.push({x:x+i*gameState.boxSize, y:y})
          gameState.walls.push({x:x, y:y+i*gameState.boxSize})
        }
      }
    }
  }
  
  // functions that return wall coordinates
  function getWall(wallType, s){
    let x, y;
    if(wallType == 0){
      x = Math.floor((Math.random()*(canvas.width - s-3)/gameState.boxSize)+3)*gameState.boxSize;
      y = (Math.floor(Math.random()*((canvas.height/gameState.boxSize)-3))+3)*gameState.boxSize
    }else if(wallType == 1){
      x = (Math.floor(Math.random()*((canvas.width/gameState.boxSize)-3))+3)*gameState.boxSize;
      y = Math.floor(Math.random()*(canvas.height - s)/gameState.boxSize)*gameState.boxSize
    }else if(wallType == 2){
      x = Math.floor((Math.random()*(canvas.width - s-3)/gameState.boxSize)+3)*gameState.boxSize;
      y = Math.floor((Math.random()*(canvas.height - s-3)/gameState.boxSize)+3)*gameState.boxSize
    }
    gameState.walls.forEach(wall => {
      if(wall.x === x && wall.y === y) getWall(wallType, s)
    })
    return {x, y}
  }

  // draw walls
  function drawWalls(){
    ctx.beginPath();
    ctx.fillStyle = "#5e0101";
    ctx.strokeStyle = "brown";
    gameState.walls.forEach(wall => {
      ctx.rect(wall.x, wall.y, gameState.boxSize, gameState.boxSize);
      ctx.fill();
      ctx.stroke();
  })
  }

  // when level changes to level 2, level 2 button should be enabled
  function enableLevels(){
    if(level === 2){
      document.getElementById("level-2").disabled = false
    }
  }


  // draws food
  function drawFood(){
    ctx.beginPath();
    ctx.fillStyle = "#FF5722";
    ctx.fillRect(gameState.food.x, gameState.food.y,  gameState.boxSize,  gameState.boxSize);
  }

  // changes food position
  function changeFood(){
    gameState.food.x = Math.floor((Math.random()*canvas.width)/  gameState.boxSize)* gameState.boxSize;
    gameState.food.y = Math.floor((Math.random()*canvas.height)/  gameState.boxSize)* gameState.boxSize;
    gameState.snake.forEach(s => {
      if(s.x === gameState.food.x && s.y === gameState.food.y)
        changeFood();
    })
    if(gameState.walls.length > 0)
      gameState.walls.forEach(w => {
        if(w.x === gameState.food.x && w.y === gameState.food.y)
          changeFood();
      })
  }

  // snake Movement
  function moveSnake(){
    let change = 0
    let newPos = {
      x: gameState.snake[0].x,
      y: gameState.snake[0].y
    }
    // snake Moves
    if(gameState.direction === "up"){
      newPos.y -=  gameState.boxSize;
    }else if(gameState.direction === "down"){
      newPos.y +=  gameState.boxSize;
    }else if(gameState.direction === "left"){
      newPos.x -=  gameState.boxSize;
    }else if(gameState.direction === "right"){
      newPos.x += gameState.boxSize;
    }else{
      message = "Invalid Key/Movement"; // currently this message is not gonna display but can be added this feature as well
      return;
    }

    // if collide with walls
    if(newPos.y < 0 || newPos.y >= canvas.height || newPos.x < 0 || newPos.x >= canvas.width){
      if (newPos.x >= canvas.width) {
        newPos.x = 0;
      } else if (newPos.x < 0) {
        newPos.x = canvas.width - gameState.boxSize;
      }

      if (newPos.y >= canvas.height) {
        newPos.y = 0;
      } else if (newPos.y < 0) {
        newPos.y = canvas.height - gameState.boxSize;
      }
    }
    
    change = checkFoodCollision(newPos)
    
    // if position changed then change the snake
    if(!(gameState.snake[0].x === newPos.x && gameState.snake[0].y === newPos.y)){
      // self collision
      gameState.gameOver = checkSelfCollision(newPos)  
      console.log("self", gameState.gameOver)
      
      // wall collision 
      if(gameState.walls.length > 0)
        gameState.gameOver = checkWallCollision(newPos)

      if(!gameState.gameOver){
        gameState.snake.unshift(newPos)
        if(!change){
          gameState.snake.pop();
        }else{
          // changeFood(); eat food
          message = "You got a point"; // currently this message is not gonna display but can be added this feature as well
        } 
      }
        else
        console.log("over")
    }
  }

  // checks wall collisions
  function checkWallCollision(newPos){
    let state = false
    gameState.walls.forEach(w => {
      if(w.x === newPos.x && w.y === newPos.y){
        message = "Oh! You hit with the walls";
        state = true
      }
    })
    return state;
  }

  function checkSelfCollision(newPos){
    let state = false
     // self collision 
    gameState.snake.forEach(s => {
      if(s.x === newPos.x && s.y === newPos.y){
        message = "Oh! You bit yourself";
        state = true
      }
    })
    return state;
  }

  function checkFoodCollision(newPos){
    let change = 0;
    if(newPos.x === gameState.food.x && newPos.y === gameState.food.y){
      change = 1;
      updateScore();
      changeFood();
    }
    return change;
  }

  function updateScore(){
    gameState.score++;
    if(gameState.score > 10)
      gameState.speed = 150
    if(gameState.score > 20)
      gameState.speed = 120

    if(gameState.score > gameState.highScore){
      gameState.highScore = gameState.score;
      gameState.level === 1 ? 
      localStorage.setItem("e_highestScore", gameState.highScore.toString()): 
      localStorage.setItem("h_highestScore", gameState.highScore.toString());
    }

  }

  // when directions change
  function directionChange(event){
    if(gameState.state === "pause")
      return;
    let key = event.key;
    if(key == "ArrowUp"){
      if(gameState.direction === "down")
        message = "Invalid move! Snake cannot move backwards."  // currently this message is not gonna display but can be added this feature as well
      else{
        gameState.direction = "up"
      }
    }else if(key == "ArrowDown"){
      if(gameState.direction === "up")
        message = "Invalid move! Snake cannot move backwards." // currently this message is not gonna display but can be added this feature as well
      else{
        gameState.direction = "down"
      }
    }else if(key == "ArrowLeft"){
      if(gameState.direction === "right")
        message = "Invalid move! Snake cannot move backwards." // currently this message is not gonna display but can be added this feature as well
      else{
        gameState.direction = "left"
      }
    }else if(key == "ArrowRight"){
      if(gameState.direction === "left")
        message = "Invalid move! Snake cannot move backwards." // currently this message is not gonna display but can be added this feature as well
      else{
        gameState.direction = "right"
      }
    }else if(key !== "F5"){
      message = "Invalid Key/Movement"; // currently this message is not gonna display but can be added this feature as well
    }
  }

  
  // function for arrow buttons
  function controlBtn(s) {    
    let e ={ key : s};
    directionChange(e)
  }
  window.controlBtn = controlBtn;

  function syncUI(){
    document.querySelector("#score span").innerText = gameState.score;
    document.querySelector("#level span").innerText = gameState.level === 1 ? "Easy":"Hard";
    document.querySelector("#highScore span").innerText = 
    gameState.level === 1 ? (localStorage.getItem("e_highestScore") || 0) : (localStorage.getItem("h_highestScore") || 0);
  }


  // set canvas size
  let gameInterval; //canvas current state
  canvasResize();

  // game
  function drawGame(currentTime){
    clearCanvas()
    drawSnake();
    drawFood();
    syncUI();

    if(gameState.level === 2)
      drawWalls();
    
    if(gameState.state === "pause"){
      pauseText()
      return;
    }
    
    if(currentTime-startTime > gameState.speed){
      moveSnake();
      startTime = currentTime;
    }

    if(!gameState.gameOver && gameState.state === "run")
      gameInterval = requestAnimationFrame(drawGame)
    else if(gameState.gameOver){
      document.getElementById("error").innerText = message;
      document.getElementById("if_err").innerText = `Score (Level ${
        gameState.level == 1? 'Easy': 'Hard'
      }): ${gameState.score}`
      document.getElementById("home-page").classList.remove("d-none")
    }

  }

  
  function pauseFn(){
    let pauseBtn = document.getElementById("pause")
    gameState.state = gameState.state === "run" ? "pause": "run";
    if(gameState.state === "pause"){
        pauseBtn.innerText = "Play";
        pauseBtn.classList.add("active");     
        // cancelAnimationFrame(gameInterval);
    } 
    else{
      pauseBtn.innerText = "Pause";
      pauseBtn.classList.remove("active");
      startTime = 0;
      gameInterval = requestAnimationFrame(drawGame);
    }
  }
  window.pauseFn = pauseFn;

  function pauseText(){
    ctx.beginPath();
    ctx.font = "30px Arial";
    ctx.fillStyle = "#000000bf";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "lime"
    ctx.fillText ("Paused", (canvas.width/ 2)-50, (canvas.height/2)+15)
  }

  function adjustBoxSizeForScreen() {
  const width = window.innerWidth;
  const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  if (isMobile && width < 500) {
    gameState.boxSize = 40; // true mobile
  } else if (isMobile && width < 800) {
    gameState.boxSize = 30; // tablets or narrow laptops
  } else {
    gameState.boxSize = 20; // wide desktops/laptops
  }

  console.log(gameState.boxSize)
}
  
  // reset canvas size
 function canvasResize() {
  adjustBoxSizeForScreen()
  const dpr = window.devicePixelRatio || 1;

  // Calculate the number of whole boxes that can fit
  let mh = window.innerHeight - controls.offsetHeight - headingStats.offsetHeight;
  let h = Math.floor((mh) / gameState.boxSize) * gameState.boxSize;
  let w = Math.floor(window.innerWidth / gameState.boxSize) * gameState.boxSize;


  // Set canvas size *in pixels* for high-DPI displays
  canvas.width = w * dpr;
  canvas.height = h * dpr;

  // Make sure food is still visible
  if (gameState.food.x > w - gameState.boxSize) {
    gameState.food.x = w - gameState.boxSize;
  }
  if (gameState.food.y > h - gameState.boxSize) {
    gameState.food.y = h - gameState.boxSize;
  }
}


  // clear canvas
  function clearCanvas(){
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  // selects Level
  function chooseLevel(l){
    document.getElementById("home-page").classList.add("d-none");
    resetGame(l);
  }

  function resetGame(l){
    gameInterval = requestAnimationFrame(drawGame);
    gameState.level = l;
    gameState.score = 0;
    gameState.direction = "right";
    gameState.state = "run";
    gameState.gameOver = false;
    message = "";
    
    // Reset snake
    gameState.snake = [
      {x:40, y:0},
      {x:20, y:0},
      {x:0, y:0}
    ];

    // Reset food
    gameState.food = {
      x: Math.floor((Math.random()*canvas.width)/ gameState.boxSize)*gameState.boxSize,
      y: Math.floor((Math.random()*canvas.height)/ gameState.boxSize)*gameState.boxSize
    };

    if(gameState.level === 2)
      createWalls()
    else
      gameState.walls.length = 0;

    // Hide home screen and restart game
    startTime = 0;
    gameInterval = requestAnimationFrame(drawGame);
  }

  this.window.chooseLevel = chooseLevel

  this.window.addEventListener("resize", canvasResize);
  this.window.addEventListener("keydown", directionChange);
})
