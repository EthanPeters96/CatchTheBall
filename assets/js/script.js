// Game state constants
const GAME_STATES = {
    STOPPED: "stopped",
    RUNNING: "running",
};

const GAME_CONFIG = {
    INITIAL_BALL_SPEED: 3,
    INITIAL_BASKET_SPEED: 3,
    MAX_MISSED_BALLS: 10,
    BALLS_FOR_LEVEL_UP: 5,
    MAX_LEVEL: 10,
};

class Game {
    constructor() {
        // DOM elements
        this.basket = document.getElementById("basket");
        this.container = document.querySelector(".game-container");
        this.scoreDisplay = document.getElementById("score");
        this.levelDisplay = document.getElementById("level");
        this.missedBallsDisplay = document.getElementById("missed");
        this.startButton = document.getElementById("startButton");

        // Game state
        this.state = GAME_STATES.STOPPED;
        this.score = 0;
        this.level = 1;
        this.missedBalls = 0;
        this.ballSpeed = GAME_CONFIG.INITIAL_BALL_SPEED;
        this.basketSpeed = GAME_CONFIG.INITIAL_BASKET_SPEED;
        this.basketDirection = 0;
        this.ballArray = [];
        this.userName = "";

        // Bind methods
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        this.moveBasket = this.moveBasket.bind(this);
        this.checkLevelUp = this.checkLevelUp.bind(this);

        // Initialize
        this.initializeEventListeners();
        requestAnimationFrame(this.moveBasket);
    }

    initializeEventListeners() {
        document.addEventListener("keydown", this.handleKeyDown);
        document.addEventListener("keyup", this.handleKeyUp);
        this.startButton.addEventListener("click", () => this.toggleGame());
    }

    handleKeyDown(event) {
        if (event.code === "ArrowLeft") this.basketDirection = -1;
        else if (event.code === "ArrowRight") this.basketDirection = 1;
    }

    handleKeyUp(event) {
        if (event.code === "ArrowLeft" || event.code === "ArrowRight") {
            this.basketDirection = 0;
        }
    }

    moveBasket() {
        let basketLeft = parseInt(window.getComputedStyle(this.basket).getPropertyValue("left"));
        let containerWidth = this.container.offsetWidth;
        let basketWidth = this.basket.offsetWidth;
        if (
            basketLeft + this.basketDirection * this.basketSpeed >= 0 &&
            basketLeft + this.basketDirection * this.basketSpeed <= containerWidth - basketWidth
        ) {
            this.basket.style.left = basketLeft + this.basketDirection * this.basketSpeed + "px";
        }
        requestAnimationFrame(this.moveBasket);
    }

    createBall() {
        const ball = document.createElement("div");
        ball.classList.add("ball");
        const containerWidth = this.container.offsetWidth;
        ball.style.left = Math.random() * (containerWidth - 20) + "px";
        ball.style.top = "0px";
        this.container.appendChild(ball);
        this.ballArray.push(ball);

        this.moveBall(ball);
    }

    moveBall(ball) {
        const ballInterval = setInterval(() => {
            if (this.state !== GAME_STATES.RUNNING) {
                clearInterval(ballInterval);
                return;
            }

            const ballTop = parseInt(window.getComputedStyle(ball).getPropertyValue("top"));
            if (this.checkBallMiss(ball, ballTop)) {
                clearInterval(ballInterval);
                return;
            }

            if (this.checkBallCatch(ball, ballTop)) {
                clearInterval(ballInterval);
                return;
            }

            ball.style.top = ballTop + this.ballSpeed + "px";
        }, 20);
    }

    checkBallMiss(ball, ballTop) {
        if (ballTop >= 580) {
            this.container.removeChild(ball);
            this.missedBalls++;
            this.updateDisplay();

            if (this.missedBalls >= GAME_CONFIG.MAX_MISSED_BALLS) {
                this.gameOver();
            }
            return true;
        }
        return false;
    }

    checkBallCatch(ball, ballTop) {
        let basketLeft = parseInt(window.getComputedStyle(this.basket).getPropertyValue("left"));
        if (ballTop >= 560 && ballTop <= 580) {
            let ballLeft = parseInt(window.getComputedStyle(ball).getPropertyValue("left"));
            if (ballLeft >= basketLeft && ballLeft <= basketLeft + 80) {
                this.score++;
                this.updateDisplay();
                this.checkLevelUp();
                this.container.removeChild(ball);
                return true;
            }
        }
        return false;
    }

    toggleGame() {
        if (this.state === GAME_STATES.STOPPED) {
            this.startGame();
        } else {
            this.stopGame();
        }
    }

    startGame() {
        this.userName = prompt("Please enter your name:");

        if (this.userName) {
            this.state = GAME_STATES.RUNNING;
            this.startButton.innerText = "Stop Game";
            this.createBall();
            this.ballInterval = setInterval(() => {
                if (this.state === GAME_STATES.RUNNING) {
                    this.createBall();
                }
            }, 2000);
        } else {
            alert("You must enter your name to start the game.");
        }
    }

    stopGame() {
        this.state = GAME_STATES.STOPPED;
        this.startButton.innerText = "Start Game";
        if (this.ballInterval) {
            clearInterval(this.ballInterval);
        }
        this.ballArray.forEach((ball) => {
            if (ball.parentNode) {
                this.container.removeChild(ball);
            }
        });
        this.ballArray = [];
        this.clearGame();
    }

    clearGame() {
        this.state = GAME_STATES.STOPPED;
        this.startButton.innerText = "Start Game";
        this.score = 0;
        this.scoreDisplay.innerText = `Score: ${this.score}`;
        this.level = 1;
        this.levelDisplay.innerText = `Level: ${this.level}`;
        this.missedBalls = 0;
        this.missedBallsDisplay.innerText = `Missed: ${this.missedBalls}`;
        this.ballSpeed = GAME_CONFIG.INITIAL_BALL_SPEED;
        this.basketSpeed = GAME_CONFIG.INITIAL_BASKET_SPEED;
        this.basketDirection = 0;
        this.basket.style.left = (this.container.offsetWidth - this.basket.offsetWidth) / 2 + "px";
    }

    checkLevelUp() {
        if (this.score >= GAME_CONFIG.BALLS_FOR_LEVEL_UP) {
            this.level++;
            this.levelDisplay.innerText = `Level: ${this.level}`;
            this.score = 0;
            this.scoreDisplay.innerText = `Score: ${this.score}`;
            this.ballSpeed++;
            this.basketSpeed++;
            alert("Level Up!");
        }
    }

    updateDisplay() {
        this.scoreDisplay.innerText = `Score: ${this.score}`;
        this.levelDisplay.innerText = `Level: ${this.level}`;
        this.missedBallsDisplay.innerText = `Missed: ${this.missedBalls}`;
    }

    gameOver() {
        this.state = GAME_STATES.STOPPED;
        this.startButton.innerText = "Start Game";
        this.clearGame();
        alert("Game Over! You missed 10 balls. Starting again from level 1.");
    }
}

// Initialize game
const game = new Game();

if (typeof module === "object") {
    module.exports = Game;
}
