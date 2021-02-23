const chai = require("chai");
const { expect } = require("chai");
const { describe } = require("mocha");
const chaiAsPromised = require("chai-as-promised");
const gameAbi = require("../artifacts/contracts/Game.sol/Game.json");

chai.use(chaiAsPromised);

describe.only("GameFactory", () => {
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
    it("should create a new game and add to the list of addresses", async () => {
      await gameFactory.connect(signer).newGame({
        value: "10000000000000000000",
      });
      const game = await gameFactory.games(0);
      expect(game).to.equal("0xCafac3dD18aC6c6e92c921884f9E4176737C052c");
      const gameContract = new ethers.Contract(game, gameAbi.abi, signer);
      const player = await gameContract.players(0);
      const playersLength = await gameContract.getPlayersLength();
      expect(playersLength).to.equal(1);
      expect(player.playerAddress).to.equal(signer.address);
    });
  });
});
