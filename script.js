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
let isFirstIteration = true;
let isGameOver = false;
let scoreValue = 0;
let gameSpeed = 100;
let currentGameLoop;
let foodImg = new Image();
foodImg.src = "apple.png";
let funnyMode = false;
let level = 1;
let gameDuration = 0;
let initialStart = true; // Add this line
let startTime = new Date().getTime();
let bombs = [];
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
function startGame() {
  reset();
  setTimeout(() => {
    gameLoop();
    initialStart = false; // Reset the initialStart flag after the first game loop
  }, 500);
}

function showInstructions() {
  const instructionsContainer = document.getElementById("instructions");
  instructionsContainer.style.display = "block";

  // Create and append the X button to the instructions box
  const closeButton = document.createElement("span");
  closeButton.id = "close-instructions-button";
  closeButton.innerHTML = "&times;";
  instructionsContainer.appendChild(closeButton);

  // Add the click event listener for the X button
  closeButton.addEventListener("click", function() {
    instructionsContainer.style.display = "none";
  });

  // Adjust the position of the button for mobile devices
  const isMobile = window.matchMedia("only screen and (max-width: 600px)").matches;
  if (isMobile) {
    const button = document.getElementById("show-instructions-button");
    const buttonRect = button.getBoundingClientRect();
    const instructionsRect = instructionsContainer.getBoundingClientRect();
    const newButtonTop = instructionsRect.bottom + 20; // Add 20 pixels of margin
    button.style.top = `${newButtonTop}px`;
  }
}


function closeInstructions() {
  const instructionsContainer = document.getElementById("instructions");
  instructionsContainer.style.display = "none";
  instructionsContainer.style.zIndex = "5";
}

const showInstructionsButton = document.getElementById("show-instructions-button");
showInstructionsButton.addEventListener("click", showInstructions);



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
  if (initialStart) {
    return 1000; // Delay for the initial game start
  } else if (scoreValue >= 200) {
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
function drawSpeed() {
  ctx.font = "16px Arial";
  ctx.fillStyle = "#a0db8e"; // Light green color for the text
  ctx.fillText("Speed: " + gameSpeed, canvas.width - 100, 20);
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
  }
  return isGameOver;
}


// Existing variables and functions
function generateSafeBomb() {
  do {
    generateBomb();
  } while (Math.abs(bomb.x - snake.x) < snakeSize * 3 || Math.abs(bomb.y - snake.y) < snakeSize * 3);
}
function reset() {
  if (currentGameLoop) {
    cancelAnimationFrame(currentGameLoop);
  }

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
  if (checkGameOver()) {
    checkCollisionWithBomb(); // Replace handleCollisionWithBomb with checkCollisionWithBomb
    saveScore(scoreValue);
    return;
  }

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

  function checkCollisionWithBomb() {
  const head = snake.body[0];

  for (const bomb of bombs) {
    if (head.x === bomb.x && head.y === bomb.y) {
      isGameOver = true;
      break;
    }
  }
}

  // Check if the snake collided with the bomb
  checkCollisionWithBomb();

  drawSnake();
  drawFood();
  drawBomb();
  drawSpeed(); 
  snake.x = head.x;
  snake.y = head.y;

  drawScore();
  drawLevelAndDuration();

  // Update the game duration
  gameDuration = new Date().getTime() - startTime;
  console.log(`Current game speed: ${getGameSpeed()}`); // Log the current game speed

   if (isFirstIteration) {
    setTimeout(gameLoop, 100); // Use a fixed speed for the first iteration
    isFirstIteration = false;
  } else {
    setTimeout(gameLoop, getGameSpeed());
  }
}

function saveScore(score) {
  if (score === undefined) {
    console.error('Error: score is undefined');
    return;
  }
  
  firebase.auth().signInAnonymously()
    .then((userCredential) => {
      const userId = userCredential.user.uid;
      const scoresRef = firebase.database().ref('leaderboard/' + userId);

      scoresRef.once('value', (snapshot) => {
        const existingScore = snapshot.val();
        if (existingScore && existingScore.score >= score) {
          // If the user already has a score on the leaderboard and their new score
          // is not higher than their existing score, do not update the leaderboard
          return;
        }

        // Otherwise, update the user's score on the leaderboard
        const timestamp = new Date().getTime();
        const scoreObj = { score: score, timestamp: timestamp };
        console.log('Score:', score);
        scoresRef.push(scoreObj).then(() => {
          showLeaderboard();
        });
      });
    })
    .catch((error) => {
      console.error('Error signing in anonymously:', error);
    });
}


function showLeaderboard() {
  const leaderboardList = document.getElementById('leaderboard-list');
  
  const scoresRef = firebase.database().ref('leaderboard');

  scoresRef.once('value', (snapshot) => {
    leaderboardList.innerHTML = ''; // Clear the leaderboardList here
    let rank = 1;
    const uniqueScores = [];
    const allScores = [];

    snapshot.forEach((userSnapshot) => {
      userSnapshot.forEach((scoreSnapshot) => {
        const childData = scoreSnapshot.val();
        const score = childData.score;
        const timestamp = childData.timestamp;

        allScores.push({ score, timestamp });
      });
    });

    allScores.sort((a, b) => b.score - a.score).slice(0, 5).forEach((scoreData) => {
      let timestamp = scoreData.timestamp;
      if (!timestamp) {
        timestamp = 'N/A';
      } else {
        timestamp = parseInt(timestamp);
        if (isNaN(timestamp)) {
          timestamp = 'Invalid Timestamp';
        } else {
          timestamp = new Date(timestamp);
          timestamp = `${timestamp.getFullYear()}/${(timestamp.getMonth() + 1).toString().padStart(2, '0')}/${timestamp.getDate().toString().padStart(2, '0')}, ${timestamp.getHours().toString().padStart(2, '0')}:${timestamp.getMinutes().toString().padStart(2, '0')}`;
        }
      }

      const scoreObj = { score: scoreData.score, timestamp };
      const scoreKey = `${scoreData.score}-${timestamp}`;

      if (uniqueScores.find((entry) => entry === scoreKey)) {
        return;
      }
      uniqueScores.push(scoreKey);

      const li = document.createElement('li');
      li.textContent = `${rank}. Score: ${scoreData.score} - Timestamp: ${timestamp}`;
      leaderboardList.appendChild(li);

      rank++;
    });
  });
}


// Add this event listener
startButton.addEventListener("click", function () {
  startMenu.style.display = "none";
  startGame();
});


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
       startGame();
    });

    window.addEventListener('touchmove', (event) => {
      event.preventDefault();
    }, { passive: false });
  });
});
