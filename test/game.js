const { it } = require("mocha");

const Game = artifacts.require("Game");

contract("Game", (accounts) => {
  describe("thing", () => {
    it("should set a game name", () => {
      Game.deployed().then((instance) => {
        assert.equal(instance.name, "the game");
      });
    });
  });
});
