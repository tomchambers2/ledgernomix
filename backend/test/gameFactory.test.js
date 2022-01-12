const chai = require("chai");
const { expect } = require("chai");
const { describe } = require("mocha");
const chaiAsPromised = require("chai-as-promised");
const gameAbi = require("../artifacts/contracts/Game.sol/Game.json");

chai.use(chaiAsPromised);

describe("GameFactory", () => {
  let signer;
  let gameFactory;

  beforeEach(async () => {
    const Calculations = await ethers.getContractFactory("Calculations");
    calculations = await Calculations.deploy();
    await calculations.deployed();

    GameFactory = await ethers.getContractFactory("GameFactory", {
      libraries: {
        Calculations: calculations.address,
      },
    });
    gameFactory = await GameFactory.deploy();
    await gameFactory.deployed();

    [signer] = await ethers.getSigners();
  });

  describe("newGame", () => {
    it.only("should create a new game and add to the list of addresses", async () => {
      await gameFactory.connect(signer).newGame({
        value: "5000000000000000000",
      });
      const game = await gameFactory.games(0);
      // expect(game).to.equal("0x8C310F133d4906CF931F55D6574c790cD5964afd"); // FIXME: address doesn't seem to be consistent during tests
      const gameContract = new ethers.Contract(game, gameAbi.abi, signer);
      const player = await gameContract.players(0);
      const playersLength = await gameContract.getPlayersLength();
      expect(playersLength).to.equal(1);
      expect(player.playerAddress).to.equal(signer.address);
    });

    it("should create a new game with an entry fee that is the value of the transaction", async () => {
      await gameFactory.connect(signer).newGame({
        value: "10000000000000000000",
      });
      const game = await gameFactory.games(0);
      const gameContract = new ethers.Contract(game, gameAbi.abi, signer);
      const rule = await gameContract.rules(0);
      await expect(rule.value).to.equal("10000000000000000000");
    });
  });
});
