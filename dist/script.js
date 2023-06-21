let scoreCount = 0; //スコア
let time = 0; //時間
let run = 0; //動作状況 (0:スタート前 1:動作中 2:一時停止、ゲームオーバー、ゲームクリア)
let level = 1; //レベル (ボールの数)

//html要素
let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');
let watch = document.getElementById('watch');
let buttonField = document.getElementById('buttonField');
let button = document.getElementById('button');
let score = document.getElementById('score');
let levelField = document.getElementById('levelField');
let levelText = document.getElementById('levelText');

//ボールのクラス
class Ball {
  constructor(color, radius, X, Y, xMove, yMove) {
    this.color = color;
    this.radius = radius;
    this.X = X;
    this.Y = Y;
    this.xMove = xMove;
    this.yMove = yMove;
    
  }
}
let ballArray = [];

//ボールのインスタンス化
function createBall(){
  for(let i = 0; i <level ; i++){
    if(i % 2 == 0){
      ballArray.push (new Ball('red', 10, canvas.width * (Math.random() * (0.9 - 0.1) + 0.1), canvas.height - 30, 2 + i/2, -2 - i/2));
    }else{
      ballArray.push (new Ball('blue', 7, canvas.width * (Math.random() * (0.9 - 0.1) + 0.1), canvas.height - 20, 2 - i/2, -2 + i/2));
    }
    
  }
  console.log(ballArray)
}

//操作する板の設定
const BAR_COLOR = '#bac72b'; //板の色
const BAR_HEIGHT = 15;  //板の高さ
const BAR_WIDTH = 100; //板の幅
let barX = (canvas.width - BAR_WIDTH) / 2;
let rigthKeyFlag = false;
let leftKeyFlag = false;

//ブロックの設定
const BLOCK_COLOR = '#c9d5ee'
const BLOCK_ROW_COUNT = 5; //ブロックの縦の数
const BLOCK_COLUMN_COUNT = 8; //ブロックの横の数
const BLOCK_WIDTH = 75; //ブロックの幅
const BLOCK_HEGHT = 20; //ブロックの高さ
const BLOCK_MARGIN = 10; //ブロックとブロックの隙間
const BLOCK_AREA_MARGIN = 25; //ブロックを並べる領域と画面の隙間
let blockArray = []; //配置したブロック位置の配列
for(let i = 0; i < BLOCK_ROW_COUNT * BLOCK_COLUMN_COUNT; i++){
  let row = Math.floor(i/BLOCK_COLUMN_COUNT);
  let column = i - (BLOCK_COLUMN_COUNT * row); 
  blockArray.push( {
    x : BLOCK_AREA_MARGIN + BLOCK_MARGIN * column + BLOCK_WIDTH * column,
    y : BLOCK_AREA_MARGIN + BLOCK_MARGIN * row +  BLOCK_HEGHT * row
    } );
}

//ボールの描画
function drawBall(ball) {
  ball.X += ball.xMove;
  ball.Y += ball.yMove;
  ctx.beginPath();
  ctx.arc(ball.X, ball.Y, ball.radius, 0, Math.PI * 2);
  ctx.fillStyle = ball.color;
  ctx.fill();
  ctx.closePath();
  if (ball.X + ball.xMove > canvas.width - ball.radius || ball.X + ball.xMove < ball.radius) {
    ball.xMove = -ball.xMove;
  }
  if (ball.Y + ball.yMove < ball.radius) {
    ball.yMove = -ball.yMove;
  } else if (ball.Y + ball.yMove > canvas.height - ball.radius) {
    if (ball.X > barX && ball.X < barX + BAR_WIDTH) {
      ball.yMove = -ball.yMove;
    } else {
      gameOver();
      return;
    }
  }
}

//ブロックの描画
function drawBlock(ball) {
  blockArray = blockArray.filter( (block, index) => {
    if (ball.X > block.x && ball.X < block.x + BLOCK_WIDTH && ball.Y > block.y && ball.Y < block.y + BLOCK_HEGHT) {
      ball.yMove = -ball.yMove;
      scoreCount++;
      score.textContent = scoreCount;
    }else{
      return block;
    }
  });
  if(blockArray.length === 0){
    gameClear();
    return;
  }
  blockArray.forEach((block) => {
    ctx.beginPath();
    ctx.rect(block.x, block.y, BLOCK_WIDTH, BLOCK_HEGHT);
    ctx.fillStyle = BLOCK_COLOR;
    ctx.fill();
    ctx.closePath();
  });
}

//操作する板の描画
function drawBar() {
  if (rigthKeyFlag && barX < canvas.width - BAR_WIDTH) {
    barX += 7;
  } else if (leftKeyFlag && barX > 0) {
    barX -= 7;
  }
  ctx.beginPath();
  ctx.rect(barX, canvas.height - BAR_HEIGHT, BAR_WIDTH, BAR_HEIGHT);
  ctx.fillStyle = BAR_COLOR;
  ctx.fill();
  ctx.closePath();
}

//板の操作
function keyDownHandler(e) {
  if (e.key == 'Right' || e.key == 'ArrowRight') {
    rigthKeyFlag = true;
  } else if (e.key == 'Left' || e.key == 'ArrowLeft') {
    leftKeyFlag = true;
  }
}

function keyUpHandler(e) {
  if (e.key == 'Right' || e.key == 'ArrowRight') {
    rigthKeyFlag = false;
  } else if (e.key == 'Left' || e.key == 'ArrowLeft') {
    leftKeyFlag = false;
  }
}

//レベル入力
const levelChange =()=> {
  if(run == 0){
    level = prompt('Select a level from 1 to 5','1');
    while(level <= 0 || 6 <= level){
      level = prompt('Please enter between 1 and 5','1');
    }
    levelText.textContent = level;
  }
};

//タイマー
const timer =()=> {
    let minute=setInterval(()=>{
      if(run == 1){
        time++;
        watch.textContent=time;
      }else if(run == 2){
        clearInterval(minute);
      }
  
    },1000);
};

//描画 
const draw =()=> {
  let interval=setInterval(()=>{
    if(run == 1){
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for(let i = 0; i < level; i++){
        drawBall(ballArray[i]);
        drawBlock(ballArray[i]);
      }
      drawBar();
    }else if(run == 2){
      clearInterval(interval);
    }
  },10);
}

//ボタン
const buttonChange =()=> {
  if(button.textContent=='START'){
    run = 1;
    createBall();
    timer();
    draw();
    button.textContent = 'RUNNING';
  }else if(button.textContent=='RUNNING'){
    run = 2;
    button.textContent = 'STOPPING';
  }else if(button.textContent=='STOPPING'){
    run = 1;
    timer();
    draw();
    button.textContent = 'RUNNING';
  }else{
    run = 2;
    window.location.reload()
  }
};

//ゲームオーバー
const gameOver =()=> {
  run = 2;
  button.textContent = 'RETRY?'

  const result=confirm(`GAME OVER\nYour score is ${scoreCount} × ${level} = ${scoreCount * level}!\nOne more play?`);

  if(result==true){window.location.reload()};
}

//ゲームクリア
const gameClear =()=> {
  run = 2;
  button.textContent = 'RETRY?'

  const result=confirm(`GAME CLEAR! CONGRATULATIONS!\nYour score is ${scoreCount} × ${level} + time bounus ${Math.floor((1000-time)/100) * level}!\nIn total ${(scoreCount + Math.floor((1000-time)/100)) * level}!\nOne more play?`);

  if(result==true){window.location.reload()};
}

document.addEventListener('keydown', keyDownHandler);
document.addEventListener('keyup', keyUpHandler);
buttonField.addEventListener('click', buttonChange);