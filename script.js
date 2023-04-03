// Define canvas and context
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Set block size and number of blocks
const blockSize = 20;
const blockCount = 20;

// Set initial snake direction and position
let snakeDirection = 'right';
let snakePosition = [{ x: 3, y: 0 }, { x: 2, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 0 }];

// Set initial food position
let foodPosition = { x: 15, y: 15 };

// Draw a block
function drawBlock(x, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x * blockSize, y * blockSize, blockSize, blockSize);
  ctx.strokeStyle = 'black';
  ctx.strokeRect(x * blockSize, y * blockSize, blockSize, blockSize);
}

// Draw the snake
function drawSnake() {
  snakePosition.forEach(function (block) {
    drawBlock(block.x, block.y, 'green');
  });
}

// Draw the food
function drawFood() {
  drawBlock(foodPosition.x, foodPosition.y, 'red');
}

// Move the snake
function moveSnake() {
  // Remove the last block of the snake
  snakePosition.pop();

  // Get the head of the snake
  const head = snakePosition[0];

  // Determine the direction to move
  if (snakeDirection === 'right') {
    snakePosition.unshift({ x: head.x + 1, y: head.y });
  } else if (snakeDirection === 'left') {
    snakePosition.unshift({ x: head.x - 1, y: head.y });
  } else if (snakeDirection === 'up') {
    snakePosition.unshift({ x: head.x, y: head.y - 1 });
  } else if (snakeDirection === 'down') {
    snakePosition.unshift({ x: head.x, y: head.y + 1 });
  }
}

// Check for collisions with walls or the snake's body
function checkCollisions() {
  // Check for collision with walls
  const head = snakePosition[0];
  if (head.x < 0 || head.x >= blockCount || head.y < 0 || head.y >= blockCount) {
    return true;
  }

  // Check for collision with the snake's body
  for (let i = 1; i < snakePosition.length; i++) {
    if (head.x === snakePosition[i].x && head.y === snakePosition[i].y) {
      return true;
    }
  }

  return false;
}

// Check if the snake has eaten the food
// Check if the snake has eaten the food
function checkFood() {
  if (snakePosition[0].x === foodPosition.x && snakePosition[0].y === foodPosition.y) {
    // Add a block to the snake
    snakePosition.push(snakePosition[snakePosition.length - 1]);

    // Generate new food position
    foodPosition.x = Math.floor(Math.random() * blockCount);
    foodPosition.y = Math.floor(Math.random() * blockCount);
  }
}
// Game loop
function gameLoop() {
// Clear the canvas
ctx.clearRect(0, 0, canvas.width, canvas.height);

// Move the snake
moveSnake();

// Check for collisions
if (checkCollisions()) {
alert('Game over!');
return;
}

// Check for food
checkFood();

// Draw the snake and food
drawSnake();
drawFood();

// Call the game loop again
setTimeout(gameLoop, 100);
}

// Start the game loop
gameLoop();

