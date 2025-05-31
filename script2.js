window.addEventListener("load", function(){
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");
  const canvasBoard = canvas.getBoundingClientRect(); //canvas coordinates and w, h
  let tempImg;

  let snakePosition = [
    { x: 20, y: 20, r: 10, s:0, e:2*Math.PI},
    { x: 40, y: 20, r: 10, s:0, e:2*Math.PI}
  ]
  for(let i=0; i<snakePosition.length; i++){
    ctx.beginPath();
    ctx.arc(snakePosition[i].x, snakePosition[i].y, snakePosition[i].r, snakePosition[i].s, snakePosition[i].e);
    ctx.fill();
  }

  // prize
  let prizePosition = { x: 20, y: 20, r: 10, s:0, e:2*Math.PI}

  // set canvas size
  function canvasResize(){
    saveCanvas();
    let height = canvasBoard.y
    canvas.width = Math.floor(window.innerWidth/20)*20;
    canvas.height = Math.floor((window.innerHeight - height )/20)*20 ;
    getSavedCanvas()
  }
  canvasResize();

  //preserve canvas data
  function saveCanvas(){
    tempImg = ctx.getImageData(0, 0, canvas.width, canvas.height);
  }

  //preserve canvas data
  function getSavedCanvas(){
    ctx.putImageData(tempImg, 0, 0);
  }

  function draw(obj){
    ctx.clearRect(0, 0, canvas.width, canvas.height)
      generatePrize();

    for(let i=0; i<obj.length; i++){
    ctx.beginPath();
    ctx.arc(obj[i].x, obj[i].y, obj[i].r, obj[i].s, obj[i].e);
    ctx.fill();
  }
  }

  function generatePrize(){
    ctx.beginPath()
    ctx.fillStyle = "Green"
    ctx.arc(prizePosition.x, prizePosition.y, prizePosition.r, prizePosition.s, prizePosition.e);
    ctx.fill()
  }

  function prizeCoord(){
    let x, y;
    do{
      x = Math.floor((Math.random()*canvas.width)/20)*20
      prizePosition.x = x
    }while(x ==snakePosition.x)
    do{
      y = Math.floor((Math.random()*canvas.height)/20)*20
      prizePosition.y = y
    }while(y == snakePosition.y);
  }
  prizeCoord();
  generatePrize();

  window.addEventListener("resize", canvasResize);
  this.window.addEventListener("keydown", function(e){
    let obj =  [...snakePosition]; // Copy current position
    if(e.key == 'ArrowUp'){
      for(let i=0; i<obj.length;i++)
        obj[i].y = snakePosition[i].y-20;
    }
    else if(e.key == 'ArrowDown'){
      for(let i=0; i<obj.length;i++)
        obj[i].y = snakePosition[i].y+20;
    }
    else if(e.key == 'ArrowLeft'){
      for(let i=0; i<obj.length;i++)
      obj[i].x = snakePosition[i].x-20;
    }
    else if(e.key == 'ArrowRight'){
      for(let i=0; i<obj.length;i++)
      obj[i].x = snakePosition[i].x+20;
    }
    else{
      console.log('Wrong Key')
    }
      if(obj[0].x > canvas.width-20 || obj[0].y > canvas.height-20 || obj[0].x < 0 || obj[0].y < 0){
        alert("out");
      }
      console.log(JSON.stringify(obj[0]) === JSON.stringify(prizePosition))
      if(JSON.stringify(obj[0]) === JSON.stringify(prizePosition)){
        obj.push(prizePosition);
        console.log(obj)
        generatePrize();
      }
      console.log(obj)
      draw(obj)
      snakePosition = obj
  })
})