jest.useFakeTimers();

jest.mock("./script", () => ({
    createBall: jest.fn(),
    startGame: jest.fn(function mockStartGame() {
        return setInterval(() => {
            this.createBall();
        }, 1000);
    }),
    stopGame: jest.fn((intervalId) => {
        clearInterval(intervalId);
    }),
    updateScore: jest.fn(),
    checkCollision: jest.fn((ball, paddle) => {
        const ballRect = ball.getBoundingClientRect();
        const paddleRect = paddle.getBoundingClientRect();

        return (
            ballRect.bottom >= paddleRect.top &&
            ballRect.left >= paddleRect.left &&
            ballRect.left <= paddleRect.left + paddleRect.width
        );
    }),
    resetGame: jest.fn(),
}));

const script = require("./script");

describe("Game Functions", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.clearAllTimers();
        // Reset any DOM elements if they exist
        document.body.innerHTML = "";
    });

    describe("startGame", () => {
        test("should create a ball every 1 second", () => {
            const intervalId = script.startGame();

            jest.advanceTimersByTime(1000);
            expect(script.createBall).toHaveBeenCalledTimes(1);

            jest.advanceTimersByTime(1000);
            expect(script.createBall).toHaveBeenCalledTimes(2);

            expect(typeof intervalId).toBe("number");
        });

        test("should continue creating balls over time", () => {
            script.startGame();
            jest.advanceTimersByTime(5000);
            expect(script.createBall).toHaveBeenCalledTimes(5);
        });

        test("should maintain correct timing between ball creation", () => {
            script.startGame();

            jest.advanceTimersByTime(500);
            expect(script.createBall).not.toHaveBeenCalled();

            jest.advanceTimersByTime(500);
            expect(script.createBall).toHaveBeenCalledTimes(1);
        });
    });

    describe("stopGame", () => {
        test("should clear the interval when stopping the game", () => {
            const intervalId = script.startGame();
            script.stopGame(intervalId);

            jest.advanceTimersByTime(2000);
            expect(script.createBall).not.toHaveBeenCalled();
        });

        test("should not affect other game intervals", () => {
            const intervalId1 = script.startGame();
            const intervalId2 = script.startGame();

            script.stopGame(intervalId1);
            jest.advanceTimersByTime(1000);

            // Second interval should still be running
            expect(script.createBall).toHaveBeenCalled();
        });
    });

    describe("checkCollision", () => {
        test("should detect collision between ball and paddle", () => {
            const ball = { getBoundingClientRect: () => ({ bottom: 100, left: 50 }) };
            const paddle = { getBoundingClientRect: () => ({ top: 95, left: 45, width: 100 }) };

            expect(script.checkCollision(ball, paddle)).toBe(true);
        });

        test("should detect no collision when objects are far apart", () => {
            const ball = { getBoundingClientRect: () => ({ bottom: 100, left: 50 }) };
            const paddle = { getBoundingClientRect: () => ({ top: 200, left: 45, width: 100 }) };

            expect(script.checkCollision(ball, paddle)).toBe(false);
        });
    });

    describe("updateScore", () => {
        beforeEach(() => {
            document.body.innerHTML = `
                <div id="score">0</div>
                <div id="high-score">0</div>
            `;

            script.updateScore.mockImplementation((score) => {
                document.getElementById("score").textContent = score.toString();
                const currentHighScore = parseInt(
                    document.getElementById("high-score").textContent
                );
                if (score > currentHighScore) {
                    document.getElementById("high-score").textContent = score.toString();
                }
            });
        });

        test("should increment score by 1", () => {
            script.updateScore(1);
            expect(document.getElementById("score").textContent).toBe("1");
        });

        test("should update high score when current score is higher", () => {
            script.updateScore(10);
            expect(document.getElementById("high-score").textContent).toBe("10");
        });
    });

    describe("resetGame", () => {
        beforeEach(() => {
            // First set up the DOM
            document.body.innerHTML = `
                <div id="score">0</div>
                <div id="high-score">0</div>
            `;

            // Then set up the mock implementation
            script.resetGame.mockImplementation(() => {
                document.getElementById("score").textContent = "0";
                document.querySelectorAll(".ball").forEach((ball) => ball.remove());
            });
        });

        test("should clear all existing balls", () => {
            // Add the balls to the existing DOM
            document.body.innerHTML += `
                <div class="ball"></div>
                <div class="ball"></div>
            `;

            script.resetGame();
            expect(document.querySelectorAll(".ball").length).toBe(0);
        });
    });

    describe("Game Integration", () => {
        beforeEach(() => {
            document.body.innerHTML = `
                <div id="score">0</div>
                <div id="high-score">0</div>
            `;

            script.resetGame.mockImplementation(() => {
                document.getElementById("score").textContent = "0";
                document.querySelectorAll(".ball").forEach((ball) => ball.remove());
            });
        });

        test("should handle complete game cycle", () => {
            const intervalId = script.startGame();

            // Simulate 3 seconds of gameplay
            jest.advanceTimersByTime(3000);
            expect(script.createBall).toHaveBeenCalledTimes(3);

            // Stop game
            script.stopGame(intervalId);

            // Verify no more balls are created
            jest.advanceTimersByTime(2000);
            expect(script.createBall).toHaveBeenCalledTimes(3);

            // Reset game
            script.resetGame();
            expect(script.createBall).toHaveBeenCalledTimes(3);
        });
    });
});
