const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreElement = document.getElementById("score");

const grid = 20;
const snakeColor = "#00FF00";
const foodColor = "#FF0000";
let score = 0;
let touchStartX = null;
let touchStartY = null;

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

// The rest of the code remains the same

class Snake {
  // ...
}

class Food {
  // ...
}

const snake = new Snake();
const food = new Food();

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  snake.move();
  if (!snake.checkCollision(food)) {
    gameIsRunning = false;
    return;
  }

  if (snake.positions[0].x === food.position.x && snake.positions[0].y === food.position.y) {
    food.randomize();
    score++;
  }

  snake.draw();
  food.draw();

  updateScore();

  setTimeout(gameLoop, 100);
}

initGame();
