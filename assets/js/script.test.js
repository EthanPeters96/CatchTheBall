jest.useFakeTimers();

jest.mock("./script", () => {
    const createBall = jest.fn();
    const startGame = jest.fn(() => {
        setInterval(() => {
            createBall();
        }, 1000);
    });

    return { startGame, createBall };
});

const script = require("./script");

describe("Game Functions", () => {
    test("should create a ball every 1 second", () => {
        script.startGame();
        jest.advanceTimersByTime(1000);
        expect(script.createBall).toHaveBeenCalledTimes(1);
    });
});
