const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreElement = document.getElementById("score");

const grid = 20;
const snakeColor = "#00FF00";
const foodColor = "#FF0000";
let score = 0;
let touchStartX = null;
let touchStartY = null;
let gameOver = false;

function handleTouchStart(event) {
  touchStartX = event.touches[0].clientX;
  touchStartY = event.touches[0].clientY;
}

function handleTouchMove(event) {
  if (!touchStartX || !touchStartY) return;

  const touchEndX = event.touches[0].clientX;
  const touchEndY = event.touches[0].clientY;

  const diffX = touchStartX - touchEndX;
  const diffY = touchStartY - touchEndY;

  if (Math.abs(diffX) > Math.abs(diffY)) {
    if (diffX > 0) {
      snake.direction = { x: -grid, y: 0 };
    } else {
      snake.direction = { x: grid, y: 0 };
    }
  } else {
    if (diffY > 0) {
      snake.direction = { x: 0, y: -grid };
    } else {
      snake.direction = { x: 0, y: grid };
    }
  }

  touchStartX = null;
  touchStartY = null;
}

function handleKeydown(event) {
  const key = event.key;

  if (key === "ArrowUp" && snake.direction.y !== grid) {
    snake.direction = { x: 0, y: -grid };
  } else if (key === "ArrowDown" && snake.direction.y !== -grid) {
    snake.direction = { x: 0, y: grid };
  } else if (key === "ArrowLeft" && snake.direction.x !== grid) {
    snake.direction = { x: -grid, y: 0 };
  } else if (key === "ArrowRight" && snake.direction.x !== -grid) {
    snake.direction = { x: grid, y: 0 };
  }
}

function updateScore() {
  scoreElement.innerText = `Score: ${score}`;
}

function initGame() {
  window.addEventListener("keydown", handleKeydown);
  canvas.addEventListener("touchstart", handleTouchStart, false);
  canvas.addEventListener("touchmove", handleTouchMove, false);
  gameLoop();
}

class Snake {
  constructor() {
    this.positions = [{ x: canvas.width / 2, y: canvas.height / 2 }];
    this.direction = { x: 0, y: -grid };
  }

  move() {
  const newHead = {
    x: this.positions[0].x + this.direction.x,
    y: this.positions[0].y + this.direction.y,
  };

  if (
    newHead.x < 0 || newHead.x >= canvas.width ||
    newHead.y < 0 || newHead.y >= canvas.height
  ) {
    gameOver = true;
    return;
  }

  this.positions.unshift(newHead);
  this.positions.pop();
}
  
 checkCollision(food) {
  if (
    this.positions[0].x === food.position.x &&
    this.positions[0].y === food.position.y
  ) {
    score++;
    this.grow();
    food.randomize();
  }

  if (
    this.positions[0].x < 0 ||
    this.positions[0].x >= canvas.width ||
    this.positions[0].y < 0 ||
    this.positions[0].y >= canvas.height
  ) {
    gameOver = true;
    return false;
  }

  for (let i = 1; i < this.positions.length; i++) {
    if (
      this.positions[0].x === this.positions[i].x &&
      this.positions[0].y === this.positions[i].y
    ) {
      return false;
    }
  }

  return true;
}


grow() {
this.positions.push({ ...this.positions[this.positions.length - 1] });
}

draw() {
ctx.fillStyle = snakeColor;
this.positions.forEach((pos) => {
ctx.fillRect(pos.x, pos.y, grid, grid);
});
}
}

class Food {
constructor() {
this.position = { x: 0, y: 0 };
this.randomize();
}

randomize() {
this.position.x = Math.floor(
Math.random() * ((canvas.width - grid) / grid)
) * grid;
this.position.y = Math.floor(
Math.random() * ((canvas.height - grid) / grid)
) * grid;
}

draw() {
ctx.fillStyle = foodColor;
ctx.fillRect(this.position.x, this.position.y, grid, grid);
}
}

const snake = new Snake();
const food = new Food();

function gameLoop() {
if (gameOver) {
return;
}

ctx.clearRect(0, 0, canvas.width, canvas.height);

snake.move();

if (!snake.checkCollision(food)) {
gameOver = true;
return;
}

if (snake.positions[0].x === food.position.x && snake.positions[0].y === food.position.y) {
food.randomize();
score++;
snake.grow();
}

snake.draw();
food.draw();

updateScore();

setTimeout(gameLoop, 100);
}

initGame();
