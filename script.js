const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const snakeSize = 20;
const startMenu = document.getElementById("start-menu");
const startButton = document.getElementById("start-button");
const gameOver = document.getElementById("game-over");
const finalScore = document.getElementById("final-score");
const restartButton = document.getElementById("restart-button");
const instructions = document.getElementById("instructions");
const firebaseConfig = {
  apiKey: "AIzaSyD0Mnylp25zOG_pUYt_gYm9Mw1a7pJGgjY",
  authDomain: "snack-2eea1.firebaseapp.com",
  databaseURL: "https://snack-2eea1-default-rtdb.firebaseio.com",
  projectId: "snack-2eea1",
  storageBucket: "snack-2eea1.appspot.com",
  messagingSenderId: "748447762728",
  appId: "1:748447762728:web:5f1e5725d3c1dcb3fce81d"
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();

let isGameOver = false;
let scoreValue = 0;
let currentGameLoop;
let foodImg = new Image();
foodImg.src = "apple.png";
let funnyMode = false;
let level = 1;
let gameDuration = 0;
let startTime = new Date().getTime();

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

  if (funnyMode) {
    if (head.x < 0) head.x = canvas.width - snakeSize;
    if (head.x > canvas.width - snakeSize) head.x = 0;
    if (head.y < 0) head.y = canvas.height - snakeSize;
    if (head.y > canvas.height - snakeSize) head.y = 0;
  } else {
    const hitLeftWall = head.x < 0;
    const hitRightWall = head.x > canvas.width - snakeSize;
    const hitTopWall = head.y < 0;
    const hitBottomWall = head.y > canvas.height - snakeSize;

    if (hitLeftWall || hitRightWall || hitTopWall || hitBottomWall) {
      isGameOver = true;
      
   
      
    }
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
    saveScore(scoreValue); 
  }
}



function handleCollisionWithBomb() {
  const head = snake.body[0];
  for (const bomb of bombs) {
    if (head.x === bomb.x && head.y === bomb.y) {
      isGameOver = true;
      gameOver.style.display = "block";
      finalScore.textContent = scoreValue;
      saveScore(scoreValue); 
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
  startTime = new Date().getTime(); // Add this line to reset the start time when the game restarts

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
function drawLevelAndDuration() {
  const minutes = Math.floor(gameDuration / 60000);
  const seconds = ((gameDuration % 60000) / 1000).toFixed(0);
  const formattedTime = `${minutes}:${(seconds < 10 ? '0' : '')}${seconds}`;

  ctx.fillStyle = 'white';
  ctx.font = '20px Arial';
  ctx.fillText(`Level: ${level} | Time: ${formattedTime}`, 10, 40);
}

// Updated gameLoop function
function gameLoop() {
  // Call the checkGameOver function at the beginning of the gameLoop function
  checkGameOver();

  if (isGameOver) {
    return;
  }

  clearCanvas();

  // Move the snake
  const head = { x: snake.x + snake.dirX * snakeSize, y: snake.y + snake.dirY * snakeSize };

  // Update the snake's position based on the funnyMode
  if (funnyMode) {
    if (head.x < 0) head.x = canvas.width - snakeSize;
    if (head.x > canvas.width - snakeSize) head.x = 0;
    if (head.y < 0) head.y = canvas.height - snakeSize;
    if (head.y > canvas.height - snakeSize) head.y = 0;
  }

  snake.body.unshift(head);

  if (snake.body.length > snake.maxBodySize) snake.body.pop();

  // Check if the snake ate the food
  if (head.x === food.x && head.y === food.y) {
    scoreValue += 10;

    // Update the level based on the player's score
    if (scoreValue >= 200) {
      level = 3;
    } else if (scoreValue >= 100) {
      level = 2;
    } else {
      level = 1;
    }

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
  drawLevelAndDuration();

  // Update the game duration
  gameDuration = new Date().getTime() - startTime;

  // Add this line to call the gameLoop function again
  setTimeout(gameLoop, getGameSpeed());
}

function saveScore(score) {
  firebase.auth().signInAnonymously()
    .then((userCredential) => {
      const userId = userCredential.user.uid;
      const scoresRef = firebase.database().ref('leaderboard/' + userId);

      // Add a timestamp property to the score object
      const timestamp = firebase.database.ServerValue.TIMESTAMP;
      const scoreObj = { score: score, timestamp: timestamp };

      scoresRef.push(scoreObj).then(() => {
        showLeaderboard();
      });
    })
    .catch((error) => {
      console.error('Error signing in anonymously:', error);
    });
}


function showLeaderboard() {
  const leaderboardList = document.getElementById('leaderboard-list');
  leaderboardList.innerHTML = '';

  // Query the scores in descending order based on the score value
  const scoresRef = firebase.database().ref('leaderboard').orderByChild('score').limitToLast(10);

  let rank = 1; // Add a counter to keep track of the rank
  let uniqueScores = []; // Add an array to keep track of unique score and timestamp combinations
  scoresRef.once('value', (snapshot) => {
    snapshot.forEach((userSnapshot) => {
      userSnapshot.forEach((childSnapshot) => {
        const childData = childSnapshot.val();

        // Check if the score and timestamp combination has already been added to the leaderboard
        const score = childData.score;
        const timestamp = childData.timestamp;
        const scoreObj = {score, timestamp};
        if (uniqueScores.some(obj => JSON.stringify(obj) === JSON.stringify(scoreObj))) {
          return; // Skip this score if it has already been added
        }
        uniqueScores.push(scoreObj); // Add this score to the array of unique scores

        const li = document.createElement('li');

        // Display the score and timestamp
        const formattedTime = new Date(timestamp).toLocaleString();
        li.textContent = `${rank}. Score: ${score} - Timestamp: ${formattedTime}`;
        leaderboardList.appendChild(li);

        rank++; // Increment the rank counter

        if (rank > 5) { // Stop adding scores to the leaderboard after 5
          return;
        }
      });
    });
  });
}






function hideLeaderboard() {
  document.getElementById('leaderboard').style.display = 'none';
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

const funnyModeButton = document.getElementById("funny-mode-button");

funnyModeButton.addEventListener("click", () => {
  funnyMode = !funnyMode;
  funnyModeButton.textContent = funnyMode ? "Disable Funny Mode" : "Enable Funny Mode";
});

const showLeaderboardButton = document.getElementById("show-leaderboard");
const leaderboard = document.getElementById("leaderboard");
showLeaderboardButton.addEventListener("click", () => {
  leaderboard.style.display = leaderboard.style.display === "none" ? "block" : "none";
  showLeaderboard();
});


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
    document.getElementById('show-leaderboard').addEventListener('click', showLeaderboard);
    document.getElementById('leaderboard-close').addEventListener('click', hideLeaderboard);

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


