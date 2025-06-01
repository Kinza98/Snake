window.addEventListener("load", function(){
  this.document.getElementById("pre-loader").classList.add("d-none");
  // canvas element
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");
  
  const controls = this.document.getElementById("controls");  // buttons
  const heading = this.document.getElementById("heading");  // heading 
  let errorContent = this.document.getElementById("error-content");  // error message container
  let scoreContainer = this.document.querySelector("#score>span");  //score container
  let speedContainer = this.document.querySelector("#speed>span");  //speed container
  let levelContainer = this.document.querySelector("#level>span");  //level container
  let pauseBtn = this.document.getElementById("pause");  //pause button
  let pause = false;
  let gameInterval;
  let speed = 500;
  let score = 14;
  let highScore = 15;
  let level = 1;
  let message = "";
  let isGameReset = false;
  
  // snake
  const snake = [
    {x:40, y:0}, // head
    {x:20, y:0},
    {x: 0, y:0}, //tail
  ];
  // walls for level 2
  const walls = [];
  const boxSize = 20;  // size of each block of snake
  let direction = "right"  // direction of snake head
  let canvasImg; //canvas current state
  let food = {  //snake food
    x: Math.floor((Math.random()*canvas.width)/ boxSize)*boxSize,
    y: Math.floor((Math.random()*canvas.height)/ boxSize)*boxSize
  }

  // set canvas size
  canvasResize();

  // function to clear canvas
  function clearCanvas(){
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  // function that draws food
  function drawFood(){
    ctx.beginPath();
    ctx.fillStyle = "#FF5722";
    ctx.fillRect(food.x, food.y, boxSize, boxSize);
  }

  function changeFood(){
    food.x = Math.floor((Math.random()*canvas.width)/ boxSize)*boxSize;
    food.y = Math.floor((Math.random()*canvas.height)/ boxSize)*boxSize;
  }

  // function that draws snake
  function drawSnake(){
    snake.forEach((s, i) => {
      ctx.beginPath();
      ctx.fillStyle = "lime";
      ctx.strokeStyle = "#00C853";
      if(i === snake.length-1) // make a tail its its last element of snake
        ctx.ellipse(s.x+boxSize/2, s.y+boxSize/2, boxSize/2, boxSize/3, 0, 0, 2*Math.PI);
      else
        ctx.arc(s.x+boxSize/2, s.y+boxSize/2, boxSize/2, 0, 2*Math.PI);  // body of snake

      ctx.fill();
      ctx.stroke();

      if(i === 0){  // add eyes it its head of the snake
        ctx.beginPath();
        ctx.fillStyle = "green";
        ctx.arc(s.x+boxSize/1.5, s.y+boxSize/4, boxSize/5, 0, 2*Math.PI);
        ctx.fill();
      }
    })
  }

  function createWalls(){
    for(let i =0; i<5; i++)
      walls.push({x:100+i*boxSize, y:100})
    for(let i =0; i<5; i++)
      walls.push({x:50, y:200+i*boxSize})
    for(let i =0; i<5; i++){
      walls.push({x:300, y:250+i*boxSize})
    }
    for(let i =0; i<5; i++){
      walls.push({x:300+i*boxSize, y:250})
    }
    console.log(walls)
  }

  function drawWalls(){
    ctx.beginPath();
    ctx.fillStyle = "#5e0101";
    ctx.strokeStyle = "brown";
    walls.forEach(wall => {
      ctx.rect(wall.x, wall.y, boxSize, boxSize);
      ctx.fill();
      ctx.stroke();
  })
  }

  // createWalls();
  // drawWalls()

  function enableLevels(){
    if(level === 2){
      document.getElementById("level-2").disabled = false
    }
  }

  // error box 
  function snakeError(){
    errorContent.innerText = message;
    setTimeout(closeError, 1000)
  }

  // clear error message
  function closeError() {    
    errorContent.innerText = ""
    message = ""
  }

  // function for arrow buttons
  function controlBtn(s) {    
    let e ={ key : s};
    directionChange(e)
  }
  window.controlBtn = controlBtn;

  // reset the whole game
  function gameReset(){
    while(snake.length !== 0)
        snake.pop();
    if(snake.length === 0){
      snake.unshift({x:0, y:0});
      snake.unshift({x:20, y:0});
      snake.unshift({x:40, y:0});
    }
    // gameLoop();
    direction = "right";
    score = 0;
    updateSpeedandLevels();
    changeFood();
    isGameReset = true;
    pauseFn();
  }
  this.window.gameReset = gameReset;

  // function to increase speed and levels
  function updateSpeedandLevels(){
    if(level === 1 && score >=5 && score < 10){
      speed = 200;
    } else if (level === 1 && score >= 10 && score < highScore){
      speed = 100
    } else if (level === 1 && score === highScore){
      level = 2;
      gameReset();   
      enableLevels();  
    }else if(level === 2){
      speed = 300
    }else if(level === 1){
      speed = 500
    }
  }

  // function to increase speed and levels
  function displaySpeedAndLevel(){
    if(speed <= 100)
      speedContainer.innerText = "High"; 
    else if(speed <= 200)
      speedContainer.innerText = "Normal"; 
    else if (speed <= 500)
      speedContainer.innerText = "Easy"; 
    levelContainer.innerText = "Level " + level
    scoreContainer.innerText = score + " / " + highScore; 
  }

  // game Flow
  function gameFlow(){
    clearCanvas();
    moveSnake();
    drawFood();
    drawSnake();
    if(message !== "")
      snakeError();
    displaySpeedAndLevel();
  }

  // Start game and keeps it continue
  function gameLoop(){
    gameFlow();
    gameInterval = setInterval(gameFlow, speed)
  }

  function startGame(l){
    document.getElementById("home-page").classList.add("d-none");
    if(l !== 'resume')
      gameReset();
    else{
      gameLoop();
    }
  }

  this.window.startGame = startGame;
  
  // when directions change
  function directionChange(event){
    if(pause)
      return
    let key = event.key;
    clearInterval(gameInterval)
    // snake Moves
    if(key == "ArrowUp"){
      if(direction === "down")
        message = "Invalid move! Snake cannot move backwards."
      else
        direction = "up"
    }else if(key == "ArrowDown"){
      if(direction === "up")
        message = "Invalid move! Snake cannot move backwards."
      else
      direction = "down"
    }else if(key == "ArrowLeft"){
      if(direction === "right")
        message = "Invalid move! Snake cannot move backwards."
      else
      direction = "left"
    }else if(key == "ArrowRight"){
      if(direction === "left")
        message = "Invalid move! Snake cannot move backwards."
      else
      direction = "right"
    }else if(key !== "F5"){
      message = "Invalid Key/Movement";
    }
    gameLoop();
  }


  // snake Movement
  function moveSnake(){
    let change = 0;
    let shift = 0;
    let newPos = {
      x: snake[0].x,
      y: snake[0].y
    }
    // snake Moves
    if(direction === "up"){
      newPos.y -= boxSize;
      direction = "up"
    }else if(direction === "down"){
      newPos.y += boxSize;
      direction = "down"
    }else if(direction === "left"){
      newPos.x -= boxSize;
      direction = "left"
    }else if(direction === "right"){
      newPos.x +=boxSize;
      direction = "right"
    }else{
      message = "Invalid Key/Movement";
      return;
    }

    if(newPos.x === food.x && newPos.y === food.y){
      change = 1;
      score++;
      updateSpeedandLevels();
    }

    // if collide with walls
    if(newPos.y < 0 || newPos.y >= canvas.height || newPos.x < 0 || newPos.x >= canvas.width){
      message = "You are out! You hit the wall";
      gameReset();
      newPos = snake[0];
      score = 0;
      return;
    }

    // if position changed then change the snake
    if( JSON.stringify(snake[0]) !== JSON.stringify(newPos) ){
      let flag = 1;
      // self collision and food eating
      snake.forEach(s => {
        if(JSON.stringify(s) === JSON.stringify(newPos)){
          message = "Oh! You bit yourself";
          gameReset();
          newPos = snake[0];
          score = 0;
          flag = 0
          return;
        }
      })
      if(flag){
        if(shift){
          snake.shift();
          snake.unshift(newPos)
        }
        else{
          snake.unshift(newPos)
          if(!change){
            snake.pop();
          }else{
            changeFood();
            message = "You got a point";
          } 
        }
      }
    }
  }

  function pauseGame(){
    saveCanvas();
    clearCanvas();
    clearInterval(gameInterval);
    getSavedCanvas();
    document.querySelectorAll(".btns button").forEach(btn => btn.disabled = true)
  }

  function resumeGame(){
    document.querySelectorAll(".btns button").forEach(btn => btn.disabled = false)
  }


  function pauseFn(){
    if(isGameReset){
      console.log("yes reset")
      clearInterval(gameInterval);
      gameLoop();
      isGameReset = false;
      pause = false;
    }else{
      pause = !pause;
      if(pause){
        pauseGame()
        pauseBtn.innerText = "Play";
        pauseBtn.classList.add("active");
        canvas.classList.add("pause");
      }else{
        pauseBtn.innerText = "Pause";
        pauseBtn.classList.remove("active");
        canvas.classList.remove("pause")
        resumeGame();
        gameLoop();
      }
    } 
  }
  window.pauseFn = pauseFn;

  function resetFn(){
    clearInterval(gameInterval)
    document.getElementById("home-page").classList.remove("d-none");
    document.getElementById("resume").classList.remove("d-none");
  }
  window.resetFn = resetFn;

  this.window.addEventListener("keydown", directionChange)


  // reset canvas size
  function canvasResize(){
    saveCanvas();  //save content of canvas before resizing
    let h =  Math.floor((window.innerHeight - controls.offsetHeight - heading.offsetHeight - 2)/boxSize)*boxSize;
    canvas.height = h;
    canvas.width = Math.floor(window.innerWidth/ boxSize)*boxSize;
    getSavedCanvas(); //get content of canvas after resizing
  }

  // save canvas data
  function saveCanvas(){
    canvasImg = ctx.getImageData(0, 0, canvas.width, canvas.height);
  }

  // get canvas saved data
  function getSavedCanvas(){
    ctx.putImageData(canvasImg, 0, 0)
  }
  this.window.addEventListener("resize", canvasResize);
  window.closeError = closeError;

})
