jest.useFakeTimers();

jest.mock("./script", () => ({
    createBall: jest.fn(),
    startGame: jest.fn(function mockStartGame() {
        return setInterval(() => {
            this.createBall();
        }, 1000);
    }),
}));

const script = require("./script");

describe("Game Functions", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.clearAllTimers();
    });

    describe("startGame", () => {
        test("should create a ball every 1 second", () => {
            script.startGame();
            jest.advanceTimersByTime(1000);
            expect(script.createBall).toHaveBeenCalledTimes(1);

            jest.advanceTimersByTime(1000);
            expect(script.createBall).toHaveBeenCalledTimes(2);
        });

        test("should continue creating balls over time", () => {
            script.startGame();
            jest.advanceTimersByTime(5000);
            expect(script.createBall).toHaveBeenCalledTimes(5);
        });
    });
});
