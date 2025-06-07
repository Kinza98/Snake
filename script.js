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
  let pause = false;  // to check if game is paused
  let gameInterval;  // stores game loop
  let speed = 500; //speed for snake
  let score = 0; // initial score
  let highScore = 15; // highest score
  let level = 1;  // game levels
  let message = "";  // message to display
  let isGameReset = false;  // flag indicates if game needs to be reset
  let onResume = false;  // flag indicates game is not on resume/reset 
  let isWall = false;  // flag indicates if walls need to be displayed
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

  // changes food position
  function changeFood(){
    food.x = Math.floor((Math.random()*canvas.width)/ boxSize)*boxSize;
    food.y = Math.floor((Math.random()*canvas.height)/ boxSize)*boxSize;
    snake.forEach(s => {
      if(s.x === food.x && s.y === food.y)
        changeFood();
    })
    if(walls.length > 0)
      walls.forEach(w => {
        if(w.x === food.x && w.y === food.y)
          changeFood();
      })
  }
  changeFood()

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

  // functions that return wall coordinates
  function getWall(wallType, s){
    let x, y;
    if(wallType == 0){
      x = Math.floor((Math.random()*(canvas.width - s-3)/boxSize)+3)*boxSize;
      y = (Math.floor(Math.random()*((canvas.height/boxSize)-3))+3)*boxSize
    }else if(wallType == 1){
      x = (Math.floor(Math.random()*((canvas.width/boxSize)-3))+3)*boxSize;
      y = Math.floor(Math.random()*(canvas.height - s)/boxSize)*boxSize
    }else if(wallType == 2){
      x = Math.floor((Math.random()*(canvas.width - s-3)/boxSize)+3)*boxSize;
      y = Math.floor((Math.random()*(canvas.height - s-3)/boxSize)+3)*boxSize
    }
    walls.forEach(wall => {
      if(wall.x === x && wall.y === y) getWall(wallType, s)
    })
    return {x, y}
  }

  // store wall coordinates into wall variable
  function createWalls(){
    let nWall = Math.floor(Math.random()*3)+3 // 3-6
    for(let j = 0; j<nWall; j++){
      let wallLength = Math.floor(Math.random()*3)+5  // 5-7
      let wallType = Math.floor(Math.random()*3)
      let s = wallLength * boxSize;
      let newWall = getWall(wallType, s); 
      let x = newWall.x;
      let y = newWall.y;
      for(let i =0; i<wallLength; i++){
        if(wallType == 0)
          walls.push({x:x+i*boxSize, y:y})
        else if(wallType == 1)
          walls.push({x:x, y:y+i*boxSize})
        else if(wallType == 2){
          walls.push({x:x+i*boxSize, y:y})
          walls.push({x:x, y:y+i*boxSize})
        }
      }
    }
  }

  // draw walls
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

  // when level changes to level 2, level 2 button should be enabled
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
    console.log('reset')
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
    isGameReset = true;
    pauseFn();
    changeFood();
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
    }else if(level === 2 && score < 5){
      speed = 300
    }else if(level === 2 && score >=5 && score < 10){
      speed = 200
    }else if(level === 2 && score >= 10 && score < highScore){
      speed = 150
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
    drawFood();
    drawSnake();
    moveSnake();
    if(message !== "")
      snakeError();
    displaySpeedAndLevel();
    if(level == 2 && !isWall){
      createWalls();
      isWall = true;
    }
    if(level == 2)
      drawWalls();

    if(level === 2 && score === highScore){
      message = "YOU WONNNNN!";
      resetFn();
    }
    if(message !== "")
      snakeError();
  }

  // Start game and keeps it continue
  let lastTime = 0;
  function gameLoop(currentTime){
    if(!lastTime) 
      lastTime = currentTime
    const dTime = currentTime - lastTime;

    if(dTime>=speed){
      gameFlow();
      lastTime = currentTime
    }

    gameInterval = requestAnimationFrame(gameLoop)
  }

  function startGame(l){
    document.getElementById("home-page").classList.add("d-none");
    if(l === "level-2"){
      level = 2;
      score = 0;
      speed = 300;
      direction = "right"
    }
    else if(l === "level-1"){
      level = 1;
      score = 0;
      speed = 500;
      direction = "right"
    }
    if(l !== 'resume')
      gameReset();
    else{
      pause = false;
      resumeGame()
      gameLoop();
    }
  }

  this.window.startGame = startGame;
  
  // when directions change
  function directionChange(event){
    if(pause)
      return
    let key = event.key;
    cancelAnimationFrame(gameInterval)
    // snake Moves
    if(key == "ArrowUp"){
      if(direction === "down")
        message = "Invalid move! Snake cannot move backwards."
      else{
        direction = "up"
        speed = 150;
      }
    }else if(key == "ArrowDown"){
      if(direction === "up")
        message = "Invalid move! Snake cannot move backwards."
      else{
        direction = "down"
        speed = 150;
      }
    }else if(key == "ArrowLeft"){
      if(direction === "right")
        message = "Invalid move! Snake cannot move backwards."
      else{
        direction = "left"
        speed = 150;
      }
    }else if(key == "ArrowRight"){
      if(direction === "left")
        message = "Invalid move! Snake cannot move backwards."
      else{
        direction = "right"
        speed = 150;
      }
    }else if(key !== "F5"){
      message = "Invalid Key/Movement";
    }
    gameLoop();
  }

  // snake Movement
  function moveSnake(){
    let change = 0;
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
      onResume = false
      resetFn(); // Pause the game
      newPos = snake[0];
      score = 0;
      flag = 0
      return;
    }

    // if position changed then change the snake
    if(!(snake[0].x === newPos.x && snake[0].y === newPos.y)){
      let flag = 1;
      // self collision and food eating
      snake.forEach(s => {
        if(s.x === newPos.x && s.y === newPos.y){
          message = "Oh! You bit yourself";
          // gameReset();
          onResume = false
          resetFn();
          newPos = snake[0];
          score = 0;
          flag = 0
          return;
        }
      })
      // wall collision 
      if(walls.length > 0)
      walls.forEach(w => {
        if(w.x === newPos.x && w.y === newPos.y){
          message = "Oh! You hit yourself";
          onResume = false
          resetFn()
          newPos = snake[0];
          score = 0;
          flag = 0
          return;
        }
      })
      if(flag){
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

  function pauseGame(){
    saveCanvas();
    clearCanvas();
    cancelAnimationFrame(gameInterval);
    getSavedCanvas();
    ctx.font = "30px Arial";
    ctx.fillStyle = "#000000bf";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "lime"
    ctx.fillText ("Paused", (canvas.width/ 2)-50, (canvas.height/2)+15)
    document.querySelectorAll(".btns button").forEach(btn => btn.disabled = true)
  }

  function resumeGame(){
    document.querySelectorAll(".btns button").forEach(btn => btn.disabled = false)
    pauseBtn.innerText = "Pause";
    pauseBtn.classList.remove("active");
    canvas.classList.remove("pause")
  }


  function pauseFn(){
    if(isGameReset){
      cancelAnimationFrame(gameInterval);
      resumeGame();
      gameLoop();
      isGameReset = false;
      pause = false;
    }else{
      pause = !pause;
      if(pause){
        console.log("pause")
        pauseGame()
        pauseBtn.innerText = "Play";
        pauseBtn.classList.add("active");
        canvas.classList.add("pause");
      }else{
        resumeGame();
        gameLoop();
      }
    } 
  }
  window.pauseFn = pauseFn;

  function resetFn(){
    cancelAnimationFrame(gameInterval)
    document.getElementById("home-page").classList.remove("d-none");
    if(onResume){
      document.getElementById("resume").classList.remove("d-none");
      onResume = false
    }else{
      document.getElementById("resume").classList.add("d-none");
    }
    document.getElementById("error").innerText = message
  }

  function resetBtnFn(){
    onResume = true;
    resetFn()
  }
  window.resetBtnFn = resetBtnFn;

  function resetSpeed(){ 
    updateSpeedandLevels()
  }

  this.window.resetSpeed = resetSpeed

  this.window.addEventListener("keydown", directionChange)
  this.window.addEventListener("keyup", resetSpeed)


  // reset canvas size
  function canvasResize(){
    saveCanvas();  //save content of canvas before resizing
    ctx.clearRect(0, 0, canvas.width, canvas.height)
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
