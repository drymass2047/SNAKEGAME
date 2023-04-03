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

function handleTouchEnd(event) {
  const touchEndX = event.changedTouches[0].clientX;
  const touchEndY = event.changedTouches[0].clientY;

  const deltaX = touchEndX - touchStartX;
  const deltaY = touchEndY - touchStartY;

  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    if (deltaX > 0 && snake.direction.x !== -grid) {
      snake.direction = { x: grid, y: 0 };
    } else if (deltaX < 0 && snake.direction.x !== grid) {
      snake.direction = { x: -grid, y: 0 };
    }
  } else {
    if (deltaY > 0 && snake.direction.y !== -grid) {
      snake.direction = { x: 0, y: grid };
    } else if (deltaY < 0 && snake.direction.y !== grid) {
      snake.direction = { x: 0, y: -grid };
    }
  }
}

canvas.addEventListener("touchstart", handleTouchStart, false);
canvas.addEventListener("touchend", handleTouchEnd, false);

function initGame() {
  window.addEventListener("keydown", handleKeydown);
  canvas.addEventListener("touchstart", handleTouchStart, false);
  canvas.addEventListener("touchmove", handleTouchMove, false);
  gameLoop();
}


// The rest of the code remains the same

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

    this.positions.unshift(newHead);
    this.positions.pop();
  }

  checkCollision(food) {
    if (
      this.positions[0].x === food.position.x &&
      this.positions[0].y === food.position.y
    ) {
      this.grow();
      return true;
    }

    if (
      this.positions[0].x < 0 ||
      this.positions[0].x >= canvas.width ||
      this.positions[0].y < 0 ||
      this.positions[0].y >= canvas.height
    ) {
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
    this.position.x = Math.floor(Math.random() * (canvas.width / grid)) * grid;
    this.position.y = Math.floor(Math.random() * (canvas.height / grid)) * grid;
  }

  draw() {
    ctx.fillStyle = foodColor;
    ctx.fillRect(this.position.x, this.position.y, grid, grid);
  }
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

  food.draw();
  snake.draw();

  setTimeout(gameLoop, 100);
}

gameLoop();

window.addEventListener("keydown", (event) => {
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
});
