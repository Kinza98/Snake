window.addEventListener("load", function(){
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
  let score = 0;
  let level = 1;
  let message = "";
  
  // snake
  const snake = [
    {x:40, y:0}, // head
    {x:20, y:0},
    {x: 0, y:0}, //tail
  ];
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
    changeFood();
  }
  this.window.gameReset = gameReset;

  // game Flow
  function gameFlow(){
    if(score >= 5) {
      if(level<=3){
        level++;
        score = 0;
      }
      if(level === 2)
        speed = 200;
    }
    clearCanvas();
    moveSnake();
    drawFood();
    drawSnake();
    if(message !== "")
      snakeError();
    if(speed <= 500)
      speedContainer.innerText = "Normal"; 
    else
      speedContainer.innerText = "High"; 
    let scoreMsg = "";
    if(level === 1){
      scoreMsg = score + " / " + 20;
      levelContainer.innerText = "Easy";
    }
    else if(level === 2){
      scoreMsg = score + " / " + 20;
      levelContainer.innerText = "Normal";
    }
    else if(level === 3){
      scoreMsg = score + " / " + 20;
      levelContainer.innerText = "Hard";
    }
      scoreContainer.innerText = scoreMsg; 
  }

  // Start game and keeps it continue
  function gameLoop(){
    gameFlow();
    gameInterval = setInterval(gameFlow, speed)
  }
  gameLoop()

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
          console.log("shift")
          snake.shift();
          snake.unshift(newPos)
        }
        else{
          console.log("no shift")
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


  function pauseFn(){
    pause = !pause;
    if(pause){
      saveCanvas();
      clearCanvas();
      clearInterval(gameInterval);
      getSavedCanvas();
      pauseBtn.innerText = "Play";
      canvas.classList.add("pause")
      document.querySelectorAll(".btns button").forEach(btn => btn.disabled = true)
    }else{
      gameLoop();
      pauseBtn.innerText = "Pause";
      canvas.classList.remove("pause")
      document.querySelectorAll(".btns button").forEach(btn => btn.disabled = false)
    }
  }
  window.pauseFn = pauseFn;

  function resetFn(){
    gameReset();
  }
  window.resetFn = resetFn;

  this.window.addEventListener("keydown", directionChange)


  // reset canvas size
  function canvasResize(){
    saveCanvas();  //save content of canvas before resizing
    let h =  Math.floor((window.innerHeight - controls.offsetHeight - heading.offsetHeight)/boxSize)*boxSize;
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
