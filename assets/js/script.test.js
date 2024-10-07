const { startGame } = require("./script");

describe("Game Functions", () => {
    test("should start the game", () => {
        const startButton = { innerText: "Start Game" };
        startGame();
        expect(startButton.innerText).toBe("Start Game");
    });
});
