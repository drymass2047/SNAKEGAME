const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const snakeSize = 20;
const startMenu = document.getElementById("start-menu");
const startButton = document.getElementById("start-button");
const gameOver = document.getElementById("game-over");
const finalScore = document.getElementById("final-score");
const restartButton = document.getElementById("restart-button");

let isGameOver = false;
let scoreValue = 0;

let snake = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  dirX: 1,
  dirY: 0,
  body: [],
  maxBodySize: 1,
};

let food = {
  x: 0,
  y: 0,
};

let bomb = {
  x: 0,
  y: 0,
};

function clearCanvas() {
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawSnake() {
  ctx.fillStyle = "green";
  for (const segment of snake.body) {
    ctx.fillRect(segment.x, segment.y, snakeSize, snakeSize);
  }
}

function drawFood() {
  ctx.fillStyle = "red";
  ctx.fillRect(food.x, food.y, snakeSize, snakeSize);
}

function drawBomb() {
  ctx.fillStyle = "black";
  ctx.fillRect(bomb.x, bomb.y, snakeSize, snakeSize);
}

function drawScore() {
  ctx.font = "16px Arial";
  ctx.fillStyle = "black";
  ctx.fillText("Score: " + scoreValue, 8, 20);
}

function generateRandomPosition() {
  return Math.floor(Math.random() * (canvas.width / snakeSize)) * snakeSize;
}

function generateFood() {
  food.x = generateRandomPosition();
  food.y = generateRandomPosition();
}

function generateBomb() {
  bomb.x = generateRandomPosition();
  bomb.y = generateRandomPosition();
}

function handleInput(event) {
  switch (event.key) {
    case "ArrowUp":
      if (snake.dirY !== 1) {
        snake.dirX = 0;
        snake.dirY = -1;
      }
      break;
    case "ArrowDown":
      if (snake.dirY !== -1) {
        snake.dirX = 0;
        snake.dirY = 1;
      }
      break;
    case "ArrowLeft":
      if (snake.dirX !== 1) {
        snake.dirX = -1;
        snake.dirY = 0;
      }
      break;
    case "ArrowRight":
      if (snake.dirX !== -1) {
        snake.dirX = 1;
        snake.dirY = 0;
      }
      break;
  }
}

function checkGameOver() {
  const head = snake.body[0];
  const hitLeftWall = head.x < 0;
  const hitRightWall = head.x > canvas.width - snakeSize;
  const hitTopWall = head.y < 0;
  const hitBottomWall = head.y > canvas.height - snakeSize;

  if (hitLeftWall || hitRightWall || hitTopWall || hitBottomWall) {
    isGameOver = true;
  }

  for (let i = 1; i < snake.body.length; i++) {
    if (head.x === snake.body[i].x && head.y === snake.body[i].y) {
      isGameOver = true;
      break;
    }
  }

  if (isGameOver) {
    drawGameOver();
  } else {
    // Increase the snake's max body size
    snake.maxBodySize += 1;
  }
}


function handleCollisionWithBomb() {
  if (snake.x === bomb.x && snake.y === bomb.y) {
    isGameOver = true;
    gameOver.style.display = "block";
    finalScore.textContent = scoreValue;
  }
}
// Existing variables and functions

function reset() {
  isGameOver = false;
  scoreValue = 0;
  snake = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    dirX: 1,
    dirY: 0,
    body: [],
    maxBodySize: 1,
  };
  generateFood();
  generateBomb();
}

// Updated gameLoop function
function gameLoop() {
  if (isGameOver) {
    return;
  }

  setTimeout(() => {
    clearCanvas();

    // Move the snake
    const head = { x: snake.x + snake.dirX * snakeSize, y: snake.y + snake.dirY * snakeSize };
    snake.body.unshift(head);

    // Check if the snake ate the food
    if (head.x === food.x && head.y === food.y) {
      scoreValue += 10;
      drawScore();
      snake.maxBodySize++;
      generateFood();
    } else {
      if (snake.body.length > snake.maxBodySize) {
        snake.body.pop();
      }
    }

    // Check if the snake collided with the bomb
    handleCollisionWithBomb();

    drawSnake();
    drawFood();
    drawBomb();
    checkGameOver();

    snake.x = head.x;
    snake.y = head.y;

    gameLoop();
  }, 100);
}

document.addEventListener("DOMContentLoaded", () => {
  const startButton = document.getElementById("start-button");
  startButton.addEventListener("click", () => {
    startMenu.style.display = "none";
    gameLoop();
  });
});

// Other event listeners
document.addEventListener("keydown", handleInput);

restartButton.addEventListener("click", () => {
  gameOver.style.display = "none";
  reset();
  gameLoop();
});




// Initial setup
generateFood();
generateBomb();
