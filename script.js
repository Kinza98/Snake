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
    highScore: localStorage.getItem("highestScore") || 0,
    speed: 200,
    direction: "right",
    gameOver: false,
    state: "run"
  }
  gameState.food = {  //snake food
    x: Math.floor((Math.random()*canvas.width)/ gameState.boxSize)*gameState.boxSize,
    y: Math.floor((Math.random()*canvas.height)/ gameState.boxSize)*gameState.boxSize
  }

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
      message = "Invalid Key/Movement";
      return;
    }

    change = checkFoodCollision(newPos)

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
          message = "You got a point";
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
        message = "Oh! You hit yourself";
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
    if(gameState.score > 5)
      gameState.level =2;
    else if(gameState.score >10)
      gameState.level = 3

    if(gameState.level === 2)
      gameState.speed = 150
    if(gameState.level === 3 )
      gameState.speed = 200

    if(gameState.score > gameState.highScore){
      gameState.highScore = gameState.score;
      localStorage.setItem("highestScore", gameState.highScore.toString());
    }

  }

  // when directions change
  function directionChange(event){
    if(gameState.state === "pause")
      return;
    let key = event.key;
    if(key == "ArrowUp"){
      if(gameState.direction === "down")
        message = "Invalid move! Snake cannot move backwards."
      else{
        gameState.direction = "up"
      }
    }else if(key == "ArrowDown"){
      if(gameState.direction === "up")
        message = "Invalid move! Snake cannot move backwards."
      else{
        gameState.direction = "down"
      }
    }else if(key == "ArrowLeft"){
      if(gameState.direction === "right")
        message = "Invalid move! Snake cannot move backwards."
      else{
        gameState.direction = "left"
      }
    }else if(key == "ArrowRight"){
      if(gameState.direction === "left")
        message = "Invalid move! Snake cannot move backwards."
      else{
        gameState.direction = "right"
      }
    }else if(key !== "F5"){
      message = "Invalid Key/Movement";
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
    document.querySelector("#level span").innerText = gameState.level;
    document.querySelector("#highScore span").innerText = gameState.highScore;
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

    if(currentTime-startTime > gameState.speed){
      moveSnake();
      startTime = currentTime;
    }

    if(!gameState.gameOver && gameState.state === "run")
      gameInterval = requestAnimationFrame(drawGame)
    else if(gameState.gameOver){
      document.getElementById("error").innerText = message;
      document.getElementById("home-page").classList.remove("d-none")
    }
  }

  
  function pauseFn(){
    let pauseBtn = document.getElementById("pause")
    gameState.state = gameState.state === "run" ? "pause": "run";
    if(gameState.state === "pause"){
        pauseBtn.innerText = "Play";
        pauseBtn.classList.add("active");      
        cancelAnimationFrame(gameInterval);
        pauseText()
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
    ctx.font = "30px Arial";
    ctx.fillStyle = "#000000bf";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "lime"
    ctx.fillText ("Paused", (canvas.width/ 2)-50, (canvas.height/2)+15)
  }
  
  // reset canvas size
  function canvasResize(){
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    let h =  Math.floor((window.innerHeight - controls.offsetHeight - headingStats.offsetHeight - 2)/gameState.boxSize)*gameState.boxSize;
    canvas.height = h;
    canvas.width = Math.floor(window.innerWidth/ gameState.boxSize)*gameState.boxSize;
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
    gameState.speed = l === 1 ? 200 : (l === 2 ? 150 : 200); // adjust speed based on level
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

    // Hide home screen and restart game
    startTime = 0;
    gameInterval = requestAnimationFrame(drawGame);
  }

  this.window.chooseLevel = chooseLevel

  this.window.addEventListener("resize", canvasResize);
  this.window.addEventListener("keydown", directionChange);
})
