let basket = document.getElementById("basket");
let scoreDisplay = document.getElementById("score");
let levelDisplay = document.getElementById("level");
let container = document.querySelector(".game-container");
let missedBallsDisplay = document.getElementById("missed");
let startButton = document.getElementById("startButton");
let missedBalls = 0;
let score = 0;
let level = 1;
let ballSpeed = 3;
let basketSpeed = 3;
let basketDirection = 0;
let ballCreationInterval;
let ballArray = [];

// Basket Movement
document.addEventListener("keydown", function (event) {
    if (event.code === "ArrowLeft") {
        basketDirection = -1;
    } else if (event.code === "ArrowRight") {
        basketDirection = 1;
    }
});

document.addEventListener("keyup", function (event) {
    if (event.code === "ArrowLeft" || event.code === "ArrowRight") {
        basketDirection = 0;
    }
});

function moveBasket() {
    let basketLeft = parseInt(window.getComputedStyle(basket).getPropertyValue("left"));
    let containerWidth = container.offsetWidth;
    let basketWidth = basket.offsetWidth;
    if (basketLeft + basketDirection * basketSpeed >= 0 && basketLeft + basketDirection * basketSpeed <= containerWidth - basketWidth) {
        basket.style.left = basketLeft + basketDirection * basketSpeed + "px";
    }
    requestAnimationFrame(moveBasket);
}

// Create Ball
function createBall() {
    let ball = document.createElement("div");
    ball.classList.add("ball");
    let containerWidth = container.offsetWidth;
    let ballWidth = ball.offsetWidth;
    ball.style.left = Math.random() * (containerWidth - ballWidth) + "px";
    ball.style.top = "0px";
    container.appendChild(ball);
    ballArray.push(ball);

    let ballInterval = setInterval(function () {
        let ballTop = parseInt(window.getComputedStyle(ball).getPropertyValue("top"));
        if (ballTop >= 580) {
            clearInterval(ballInterval);
            container.removeChild(ball);
            if (ball.parentNode === null) {
                // Ball was not caught
                missedBalls++; // Increment missed balls count
                missedBallsDisplay.innerText = "Missed: " + missedBalls; // Update missed balls display
                // Check if the player missed 10 balls
                if (missedBalls >= 10) {
                    resetGame();
                    alert("Game Over! You missed 10 balls. Starting again from level 1.");
                    startButton.innerText = "Start Game"; // Change button text back to "Start Game"
                }
            }
        } else {
            ball.style.top = ballTop + ballSpeed + "px";
        }

        // Check if the ball hits the basket
        let basketLeft = parseInt(window.getComputedStyle(basket).getPropertyValue("left"));
        if (ballTop >= 560 && ballTop <= 580) {
            let ballLeft = parseInt(window.getComputedStyle(ball).getPropertyValue("left"));
            if (ballLeft >= basketLeft && ballLeft <= basketLeft + 80) {
                clearInterval(ballInterval);
                container.removeChild(ball);
                score++;
                scoreDisplay.innerText = "Score: " + score;
            }
        }
    }, 20);
}

// Ball Generation Interval
function startGame() {
    ballCreationInterval = setInterval(createBall, 1000);
}

// Reset Game
function resetGame() {
    clearInterval(ballCreationInterval);
    ballArray.forEach((ball) => {
        if (ball.parentNode) {
            container.removeChild(ball);
        }
    });
    ballArray = []; // Reset the ball array
    score = 0;
    scoreDisplay.innerText = "Score: " + score;
    level = 1; // Reset level to 1
    levelDisplay.innerText = "Level: " + level; // Update level display
    level = 1; // Reset level to 1
    missedBalls = 0; // Reset missed balls count
    ballSpeed = 3; // Reset ball speed
    basketSpeed = 3; // Reset basket speed
    missedBallsDisplay.innerText = "Missed: " + missedBalls; // Reset missed balls display

    // Reset basket to center
    let containerWidth = container.offsetWidth;
    let basketWidth = basket.offsetWidth;
    let centerPosition = (containerWidth - basketWidth) / 2;
    basket.style.left = centerPosition + "px";
}

// Game Win Condition
setInterval(function () {
    if (score >= 5) {
        level++; // Increase level
        levelDisplay.innerText = "Level: " + level; // Update level display
        if (level > 10) {
            resetGame(); // End the game
            alert("Congratulations! You reached level 10. Starting again from level 1.");
            return; // Exit the function
        }
        score = 0; // Reset score
        scoreDisplay.innerText = "Score: " + score; // Update score display
        ballSpeed++; // Increase ball speed
        basketSpeed++; // Increase basket speed
        alert("Level Up!");
    }
}, 100);

// Start the game when button is clicked
document.addEventListener("DOMContentLoaded", function () {
    const startButton = document.getElementById("startButton");
    startButton.addEventListener("click", function () {
        if (startButton.innerText === "Start Game") {
            startGame();
            startButton.innerText = "Stop Game"; // Change button text to "Stop Game"
        } else {
            resetGame();
            startButton.innerText = "Start Game"; // Change button text to "Start Game"
        }
    });
});
requestAnimationFrame(moveBasket);

module.exports = { startGame };
