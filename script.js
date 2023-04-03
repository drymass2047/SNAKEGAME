const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const grid = 20;
const snakeColor = "#00FF00";
const foodColor = "#FF0000";
let score = 0;

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
    alert("Game Over!");
    window.location.reload();
    return;
  }

  if (
    snake.positions[0].x === food.position.x &&
    snake.positions[0].y === food.position.y
  ) {
    food.randomize();
    score++;
  }

  snake.draw();
  food.draw();

  updateScore();

  setTimeout(gameLoop, 100);
}

function updateScore() {
  document.getElementById("score").innerText = `Score: ${score}`;
}

gameLoop();


