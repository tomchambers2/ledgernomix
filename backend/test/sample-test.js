const chai = require("chai");
const { expect } = require("chai");
const { describe } = require("mocha");
const chaiAsPromised = require("chai-as-promised");

chai.use(chaiAsPromised);

// describe("Greeter", function () {
//   it("Should return the new greeting once it's changed", async function () {
//     const Greeter = await ethers.getContractFactory("Greeter");
//     const greeter = await Greeter.deploy("Hello, world!");

//     await greeter.deployed();
//     expect(await greeter.greet()).to.equal("Hello, world!");

//     await greeter.setGreeting("Hola, mundo!");
//     expect(await greeter.greet()).to.equal("Hola, mundo!");
//   });
// });

describe("Game", () => {
  let game;
  let owner, addr1;

  beforeEach(async () => {
    const Game = await ethers.getContractFactory("Game");
    game = await Game.deploy();
    await game.deployed();
    [owner, addr1, addr2] = await ethers.getSigners();
  });

  describe("joinGame", () => {
    it("should reject the call if the game has ended", () => {
      // not sure how to give it state
    });

    it("should reject the call if value is wrong", async () => {
      try {
        await game.joinGame({
          value: "1000000000000000000",
        });
      } catch (e) {
        expect(e.message).to.equal(
          "VM Exception while processing transaction: revert You must send 5 xDai to join the game"
        );
      }
    });

    it("should allow entry the call if value is correct", async () => {
      await game.joinGame({
        value: "5000000000000000000",
      });
    });

    it("should create a new player", async () => {
      await game.joinGame({
        value: "5000000000000000000",
      });
      const player = await game.players(0);
      expect(player.playerAddress).to.equal(owner.address);
    });
  });

  describe("createProposal", () => {
    it("should reject the call if the game has ended");

    it("should reject the call if the caller is not a player in the game", async () => {
      await expect(game.createProposal(0, 0)).to.eventually.be.rejectedWith(
        "You must have joined the game to call this function"
      );
    });

    it("should reject a proposal that does not apply to an existing rule", async () => {
      await game.joinGame({
        value: "5000000000000000000",
      });
      await expect(
        game.createProposal(12, 999999)
      ).to.eventually.be.rejectedWith(
        "Proposal must apply to an existing rule"
      );
    });

    it("should reject a proposal that has an out of bounds value", async () => {
      await game.joinGame({
        value: "5000000000000000000",
      });
      await expect(
        game.createProposal(0, 999999)
      ).to.eventually.be.rejectedWith(
        "Proposal value must be within rule bounds"
      );
    });

    it("should create a new proposal", async () => {
      await game.joinGame({
        value: "5000000000000000000",
      });
      await game.createProposal(0, 12);
      const proposal = await game.proposals(0);
      expect(proposal.proposer).to.equal(owner.address);
      expect(proposal.value).to.equal(12);
      expect(proposal.ruleIndex).to.equal(0);
    });
  });

  describe("vote on proposal", () => {
    it("should reject the call if the caller is not a player in the game", async () => {
      await game.joinGame({
        value: "5000000000000000000",
      });
      await game.createProposal(0, 12);

      await expect(
        game.connect(addr1).voteOnProposal()
      ).to.eventually.be.rejectedWith(
        "You must have joined the game to call this function"
      );
    });

    it("should reject the call if the proposal is complete", async () => {
      await game.joinGame({
        value: "5000000000000000000",
      });
      await game.createProposal(0, 12);

      await game.joinGame({
        value: "5000000000000000000",
      });

      await expect(game.voteOnProposal()).to.eventually.be.rejectedWith(
        "You must have joined the game to call this function"
      );
    });

    it("should reject the call if the player has already voted", async () => {
      await game.joinGame({
        value: "5000000000000000000",
      });
      await game.createProposal(0, 12);
      await game.voteOnProposal(0, true);

      await expect(game.voteOnProposal(0, true)).to.eventually.be.rejectedWith(
        "You have already voted on this proposal"
      );
    });

    it("should record the players vote on the proposal", async () => {
      await game.joinGame({
        value: "5000000000000000000",
      });
      await game.createProposal(0, 12);
      await game.voteOnProposal(0, true);
      const vote = await game.functions.getVote(0, 0);
      expect(vote[0]).to.equal(owner.address);
      expect(vote[1]).to.equal(true);
    });

    it.only("should mark the proposal complete if voting reaches quorum", async () => {
      await game.joinGame({
        value: "5000000000000000000",
      });
      await game.connect(addr2).joinGame({
        value: "5000000000000000000",
      });
      await game.createProposal(0, 12);
      await game.voteOnProposal(0, true);
      await game.connect(addr2).voteOnProposal(0, true);
      const proposal = await game.proposals(0);
      expect(proposal.complete).to.equal(true);
    });

    it("should mark the proposal successful if sufficient votes", async () => {});

    it("should mark the proposal not successful if sufficient votes", async () => {});
  });

  describe("calculateQuorum", () => {
    it.only("should return correct values for quorum", async () => {
      const quorum = await game.functions.calculateQuorum(50, 5);
      console.log(quorum);
      expect(quorum).to.equal(3);
    });
  });
});
