const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const snakeSize = 20;
const startMenu = document.getElementById("start-menu");
const startButton = document.getElementById("start-button");
const gameOver = document.getElementById("game-over");
const finalScore = document.getElementById("final-score");
const restartButton = document.getElementById("restart-button");
const instructions = document.getElementById("instructions");

let isGameOver = false;
let scoreValue = 0;
let currentGameLoop;
let foodImg = new Image();
foodImg.src = "apple.png";

let bombImg = new Image();
bombImg.src = "bomb.png";

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
  ctx.fillStyle = "#1b4d30"; // Dark green color for the background
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw the grid pattern
  const gridSize = snakeSize;
  ctx.strokeStyle = "#2c6a43"; // Slightly lighter green color for the grid lines
  ctx.lineWidth = 1;
  for (let x = gridSize; x < canvas.width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = gridSize; y < canvas.height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
}

function getGameSpeed() {
  if (scoreValue >= 200) {
    return 50; // 2x speed
  } else if (scoreValue >= 100) {
    return 66; // 1.5x speed
  } else {
    return 100; // normal speed
  }
}
function drawSnake() {
  const gradientColors = ['#76b852', '#4CAF50', '#388E3C', '#2E7D32', '#1B5E20'];

  for (let i = 0; i < snake.body.length; i++) {
    const segment = snake.body[i];
    const colorIndex = Math.floor(i / (snake.body.length / gradientColors.length));

    ctx.fillStyle = gradientColors[colorIndex];
    ctx.fillRect(segment.x, segment.y, snakeSize, snakeSize);
  }
}


function drawFood() {
  ctx.drawImage(foodImg, food.x, food.y, snakeSize, snakeSize);
}

function drawBomb() {
  for (const bomb of bombs) {
    ctx.drawImage(bombImg, bomb.x, bomb.y, snakeSize, snakeSize);
  }
}

function drawScore() {
  ctx.font = "16px Arial";
  ctx.fillStyle = "#a0db8e"; // Light green color for the text
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
    gameOver.style.display = "block";
    finalScore.textContent = scoreValue;
    // Save the user's score
    saveScore(scoreValue);
    displayScores();
  }
}


function handleCollisionWithBomb() {
  const head = snake.body[0];
  for (const bomb of bombs) {
    if (head.x === bomb.x && head.y === bomb.y) {
      isGameOver = true;
      gameOver.style.display = "block";
      finalScore.textContent = scoreValue;
      break;
    }
  }
}


// Existing variables and functions
function generateSafeBomb() {
  do {
    generateBomb();
  } while (Math.abs(bomb.x - snake.x) < snakeSize * 3 || Math.abs(bomb.y - snake.y) < snakeSize * 3);
}
function reset() {
  isGameOver = false;
  scoreValue = 0;
  snake = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    dirX: 1,
    dirY: 0,
    body: [{ x: canvas.width / 2, y: canvas.height / 2 }],
    maxBodySize: 1,
  };
  generateFood();
  generateBombs(getNumberOfBombs());
}
function generateBombs(numberOfBombs) {
  bombs = [];
  for (let i = 0; i < numberOfBombs; i++) {
    generateSafeBomb();
    bombs.push({ x: bomb.x, y: bomb.y });
  }
}


function getNumberOfBombs() {
  if (scoreValue >= 200) {
    return 3;
  } else if (scoreValue >= 100) {
    return 2;
  } else {
    return 1;
  }
}
function saveScore(score) {
  // Retrieve the existing scores from localStorage
  let scores = localStorage.getItem('snake-scores');

  // If no scores exist, create an empty array
  if (!scores) {
    scores = [];
  } else {
    // Otherwise, parse the scores string into an array
    scores = JSON.parse(scores);
  }

  // Add the new score to the array
  scores.push(score);

  // Sort the scores in descending order
  scores.sort((a, b) => b - a);

  // Truncate the scores to the last 5 entries
  scores = scores.slice(0, 5);

  // Save the scores back to localStorage
  localStorage.setItem('snake-scores', JSON.stringify(scores));
}

function displayScores() {
  // Retrieve the scores from localStorage
  let scores = localStorage.getItem('snake-scores');

  // If no scores exist, display a message
  if (!scores) {
    finalScore.textContent = "No scores yet!";
    return;
  }

  // Otherwise, parse the scores string into an array
  scores = JSON.parse(scores);

  // Create a list of score elements
  const scoreList = document.createElement('ul');
  scoreList.className = 'score-list';
  for (const score of scores) {
    const scoreItem = document.createElement('li');
    scoreItem.textContent = score;
    scoreList.appendChild(scoreItem);
  }

  // Replace the final score element with the score list
  finalScore.parentNode.replaceChild(scoreList, finalScore);
}

// Updated gameLoop function
function gameLoop() {
  if (isGameOver) {
    return;
  }

  clearCanvas();

  // Move the snake
  const head = { x: snake.x + snake.dirX * snakeSize, y: snake.y + snake.dirY * snakeSize };
  snake.body.unshift(head);

  if (snake.body.length > snake.maxBodySize) snake.body.pop();

  // Check if the snake ate the food
  if (head.x === food.x && head.y === food.y) {
    scoreValue += 10;

    snake.maxBodySize++;
    generateFood();

    // Update the number of bombs if the score reaches 100 or 200
    if (scoreValue === 100 && bombs.length < 2) {
      generateBombs(getNumberOfBombs());
    } else if (scoreValue === 200 && bombs.length < 3) {
      generateBombs(getNumberOfBombs());
    }
  }

  // Check if the snake collided with the bomb
  handleCollisionWithBomb();

  drawSnake();
  drawFood();
  drawBomb();

  snake.x = head.x;
  snake.y = head.y;

  drawScore();

  // Call the checkGameOver function at the end of the gameLoop function
  checkGameOver();

  // Add this line to call the gameLoop function again
  setTimeout(gameLoop, getGameSpeed());
}



canvas.addEventListener('touchstart', handleTouchStart, false);
canvas.addEventListener('touchmove', handleTouchMove, false);
canvas.addEventListener('touchend', handleTouchEnd, false);
let touchStartX = 0;
let touchStartY = 0;



function handleTouchStart(e) {
  e.preventDefault();
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
}

function handleTouchMove(e) {
  e.preventDefault();
}

function handleTouchEnd(e) {
  e.preventDefault();
  const touchEndX = e.changedTouches[0].clientX;
  const touchEndY = e.changedTouches[0].clientY;
  const deltaX = touchEndX - touchStartX;
  const deltaY = touchEndY - touchStartY;

  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    if (deltaX > 0) {
      if (snake.dirX !== -1) {
        snake.dirX = 1;
        snake.dirY = 0;
      }
    } else {
      if (snake.dirX !== 1) {
        snake.dirX = -1;
        snake.dirY = 0;
      }
    }
  } else {
    if (deltaY > 0) {
      if (snake.dirY !== -1) {
        snake.dirX = 0;
        snake.dirY = 1;
      }
    } else {
      if (snake.dirY !== 1) {
        snake.dirX = 0;
        snake.dirY = -1;
      }
    }
  }
}
document.addEventListener("DOMContentLoaded", () => {
  Promise.all([
    new Promise(resolve => foodImg.addEventListener('load', resolve)),
    new Promise(resolve => bombImg.addEventListener('load', resolve))
  ]).then(() => {
    startButton.addEventListener("click", () => {
  startMenu.style.display = "none";
  instructions.style.display = "none"; // Add this line to hide instructions
  reset();
  gameLoop();
});

    // Other event listeners
    document.addEventListener("keydown", handleInput);
    canvas.addEventListener('touchstart', handleTouchStart, false);
    canvas.addEventListener('touchmove', handleTouchMove, false);
    canvas.addEventListener('touchend', handleTouchEnd, false);

    restartButton.addEventListener("click", () => {
      gameOver.style.display = "none";
      reset();
      gameLoop();
    });

    window.addEventListener('touchmove', (event) => {
      event.preventDefault();
    }, { passive: false });
  });
});

