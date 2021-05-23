const chai = require("chai");
const { expect } = require("chai");
const { describe } = require("mocha");
const chaiAsPromised = require("chai-as-promised");
const { intToHex } = require("ethjs-util");

chai.use(chaiAsPromised);

describe("Game", () => {
  let Game;
  let game;
  let calculations;
  let players;
  let owner, addr1;
  let startAndProposal;
  let playGameToEnd;
  let createGame;
  const ether = 1000000000000000000;

  beforeEach(async () => {
    players = await ethers.getSigners();
    [owner, addr1, addr2] = players;

    const Calculations = await ethers.getContractFactory("Calculations");
    calculations = await Calculations.deploy({ gasPrice: 0 });
    await calculations.deployed();

    Game = await ethers.getContractFactory("Game", {
      libraries: {
        Calculations: calculations.address,
      },
    });

    createGame = async ({
      entryFee = 5,
      startBalance = 10,
      reward = 4,
      majority = 50,
      quorum = 50,
      maxProposals = 3,
      pollTax = 0,
      wealthTax = 0,
      wealthTaxThreshold = 0,
      proposalCost = 0,
    } = {}) => {
      game = await Game.deploy(
        owner.address,
        entryFee,
        startBalance,
        reward,
        majority,
        quorum,
        maxProposals,
        pollTax,
        wealthTax,
        wealthTaxThreshold,
        proposalCost,
        {
          value: intToHex(entryFee * 1000000000000000000),
          // "0x4563918244F40000", // 5 ether in hex
          gasPrice: 0,
        }
      );
      await game.deployed();
      return game;
    };

    game = await createGame();
    await game.deployed();

    startAndProposal = async (numPlayers, game) => {
      for (let index = 1; index < numPlayers; index++) {
        await game.connect(players[index]).joinGame({
          value: "5000000000000000000",
        });
      }
      await game.connect(players[0]).createProposal(0, 12);
    };

    playGameToEnd = async () => {
      await game.connect(players[1]).joinGame({
        value: "5000000000000000000",
      });
      await game.connect(players[2]).joinGame({
        value: "5000000000000000000",
      });
      for (let i = 0; i < 3; i++) {
        await game.createProposal(0, 12);
        await game.connect(players[0]).voteOnProposal(i, false);
        await game.connect(players[1]).voteOnProposal(i, false);
      }
    };
  });

  describe("joinGame", () => {
    it("should reject the call if the game has ended", async () => {
      await playGameToEnd();
      await expect(
        game.connect(players[3]).joinGame({
          value: "5000000000000000000",
        })
      ).to.eventually.be.rejectedWith(
        "You cannot interact with this game because it has ended"
      );
    });

    it("should reject the call if the player is already in the game", async () => {
      game.connect(players[1]).joinGame({
        value: "5000000000000000000",
      });
      await expect(
        game.connect(players[1]).joinGame({
          value: "5000000000000000000",
        })
      ).to.eventually.be.rejectedWith("You have already joined this game");
    });

    it("should reject the call if value is wrong", async () => {
      try {
        await game.connect(players[1]).joinGame({
          value: "1000000000000000000",
        });
      } catch (e) {
        await expect(e.message).to.equal(
          "VM Exception while processing transaction: revert You must send required entry fee to join the game"
        );
      }
    });

    it("should allow entry the call if value is correct", async () => {
      await game.connect(players[1]).joinGame({
        value: "5000000000000000000",
      });
    });

    it("should create a new player", async () => {
      await game.connect(players[1]).joinGame({
        value: "5000000000000000000",
      });
      const player = await game.players(0);
      expect(player.playerAddress).to.equal(owner.address);
    });
  });

  describe("createProposal", () => {
    it("should reject the call if the game has ended", async () => {
      await playGameToEnd();
      expect(game.createProposal(0, 0)).to.eventually.be.rejectedWith(
        "You cannot interact with this game because it has ended"
      );
    });

    it("should reject the call if the caller is not a player in the game", async () => {
      await expect(
        game.connect(players[1]).createProposal(0, 0)
      ).to.eventually.be.rejectedWith(
        "You must have joined the game to call this function"
      );
    });

    it("should reject the call if the game has reached the maximum number of proposals", async () => {
      await playGameToEnd();
      await expect(game.createProposal(0, 0)).to.eventually.be.rejectedWith(
        "You cannot interact with this game because it has ended"
      );
    });

    it("should reject a proposal that does not apply to an existing rule", async () => {
      await game.connect(players[1]).joinGame({
        value: "5000000000000000000",
      });
      await expect(
        game.createProposal(12, 999999)
      ).to.eventually.be.rejectedWith(
        "Proposal must apply to an existing rule"
      );
    });

    it("should reject a proposal that has an out of bounds value", async () => {
      await game.connect(players[1]).joinGame({
        value: "5000000000000000000",
      });
      await expect(
        game.createProposal(0, 999999)
      ).to.eventually.be.rejectedWith(
        "Proposal value must be within rule bounds"
      );
    });

    it("should create a new proposal", async () => {
      await game.connect(players[1]).joinGame({
        value: "5000000000000000000",
      });
      await game.createProposal(0, 12);
      const proposal = await game.proposals(0);
      await expect(proposal.proposer).to.equal(owner.address);
      await expect(proposal.value).to.equal(12);
      await expect(proposal.ruleIndex).to.equal(0);
    });
  });

  describe("vote on proposal", () => {
    it("should reject the call if the caller is not a player in the game", async () => {
      await game.connect(players[1]).joinGame({
        value: "5000000000000000000",
      });
      await game.createProposal(0, 12);

      await expect(
        game.connect(players[2]).voteOnProposal(0, true)
      ).to.eventually.be.rejectedWith(
        "You must have joined the game to call this function"
      );
    });

    it("should reject the call if the game has ended", async () => {
      await playGameToEnd();
      await expect(game.voteOnProposal(0, true)).to.eventually.be.rejectedWith(
        "You cannot interact with this game because it has ended"
      );
    });

    it("should reject the call if the proposal is complete", async () => {
      await game.connect(players[1]).joinGame({
        value: "5000000000000000000",
      });
      await game.connect(players[2]).joinGame({
        value: "5000000000000000000",
      });

      await game.createProposal(0, 12);

      await game.connect(players[0]).voteOnProposal(0, true);
      await game.connect(players[1]).voteOnProposal(0, true);

      await expect(
        game.connect(players[2]).voteOnProposal(0, true)
      ).to.eventually.be.rejectedWith("You may not vote on completed proposal");
    });

    it("should reject if the proposal does not exist", async () => {
      await game.connect(players[1]).joinGame({
        value: "5000000000000000000",
      });
      await expect(
        game.connect(players[0]).voteOnProposal(99, true)
      ).to.eventually.be.rejectedWith("Voted on non-existent proposal");
    });

    it("should reject the call if the player has already voted", async () => {
      await startAndProposal(4, game);
      await game.voteOnProposal(0, true);

      await expect(game.voteOnProposal(0, true)).to.eventually.be.rejectedWith(
        "You have already voted on this proposal"
      );
    });

    it("should record the players vote on the proposal", async () => {
      await game.connect(players[1]).joinGame({
        value: "5000000000000000000",
      });
      await game.createProposal(0, 12);
      await game.voteOnProposal(0, true);
      const vote = await game.functions.getVote(0, 0);
      await expect(vote[0]).to.equal(owner.address);
      await expect(vote[1]).to.equal(true);
    });

    it("should mark the proposal complete if voting reaches quorum with 2 players", async () => {
      await game.connect(players[1]).joinGame({
        value: "5000000000000000000",
      });
      await game.createProposal(0, 12);
      await game.voteOnProposal(0, true);
      const proposal = await game.proposals(0);
      await expect(proposal.complete).to.equal(true);
    });

    it("should mark the proposal complete if voting reaches quorum with 3 players", async () => {
      await game.connect(players[1]).joinGame({
        value: "5000000000000000000",
      });
      await game.connect(players[2]).joinGame({
        value: "5000000000000000000",
      });
      await game.createProposal(0, 12);
      await game.connect(players[0]).voteOnProposal(0, true);
      await game.connect(players[1]).voteOnProposal(0, true);
      const proposal = await game.proposals(0);
      await expect(proposal.complete).to.equal(true);
    });

    it("should mark the proposal successful if sufficient yes votes", async () => {
      await startAndProposal(4, game);
      await game.connect(players[0]).voteOnProposal(0, true);
      await game.connect(players[1]).voteOnProposal(0, true);
      const proposal = await game.proposals(0);
      await expect(proposal.complete).to.equal(true);
      await expect(proposal.successful).to.equal(true);
    });

    it("should reward the proposer of a successful proposer", async () => {
      await startAndProposal(4, game);
      await game.connect(players[1]).voteOnProposal(0, true);
      await game.connect(players[2]).voteOnProposal(0, true);
      const player = await game.players(0);
      expect(player.balance.toString()).to.equal("14000000000000000000");
    });

    it("should mark the proposal successful if sufficient yes votes", async () => {
      await startAndProposal(10, game);
      for (let index = 0; index < 3; index++) {
        await game.connect(players[index]).voteOnProposal(0, true);
      }
      for (let index = 0; index < 2; index++) {
        await game.connect(players[index + 3]).voteOnProposal(0, false);
      }
      const proposal = await game.proposals(0);
      expect(proposal.complete).to.equal(true);
      expect(proposal.successful).to.equal(true);
    });

    it("should not mark the proposal successful if yes votes come after no votes", async () => {
      await startAndProposal(10, game);
      for (let index = 0; index < 3; index++) {
        await game.connect(players[index]).voteOnProposal(0, false);
      }
      for (let index = 0; index < 2; index++) {
        await game.connect(players[index + 3]).voteOnProposal(0, true);
      }
      const proposal = await game.proposals(0);
      expect(proposal.complete).to.equal(true);
      expect(proposal.successful).to.equal(false);
    });

    it("should apply the proposal if successful", async () => {
      await startAndProposal(4, game);
      await game.connect(players[0]).voteOnProposal(0, true);
      await game.connect(players[1]).voteOnProposal(0, true);
      const rule = await game.rules(0);
      await expect(rule.value).to.equal(12);
    });

    it("should leave the proposal not successful if insufficient yes votes", async () => {
      await startAndProposal(4, game);
      await game.connect(players[0]).voteOnProposal(0, true);
      await game.connect(players[1]).voteOnProposal(0, false);
      const proposal = await game.proposals(0);
      await expect(proposal.complete).to.equal(true);
      await expect(proposal.successful).to.equal(false);
    });

    it("should reject the call if the game has reached the maximum number of proposals", async () => {
      await game.connect(players[1]).joinGame({
        value: "5000000000000000000",
      });
      await game.connect(players[3]).joinGame({
        value: "5000000000000000000",
      });
      for (let i = 0; i < 3; i++) {
        await game.createProposal(0, 12);
        await game.connect(players[0]).voteOnProposal(i, false);
        await game.connect(players[1]).voteOnProposal(i, false);
      }
      const p = await game.proposals(0);
      await expect(
        game.connect(players[3]).voteOnProposal(0, true)
      ).to.eventually.be.rejectedWith(
        "You cannot interact with this game because it has ended"
      );
    });
  });

  describe("taxes", () => {
    it("should apply a poll tax to all players on complete proposal", async () => {
      const game = await createGame({ pollTax: 6 });
      await startAndProposal(4, game);
      await game.connect(players[0]).voteOnProposal(0, false);
      await game.connect(players[1]).voteOnProposal(0, false);
      const player = await game.players(0);
      expect(player.balance.toString()).to.equal("4000000000000000000");
    });

    it("should apply a wealth tax to all players on complete proposal", async () => {
      game = await createGame({ startBalance: 10, wealthTax: 50 }); //wealth tax is percentage
      await game.deployed();

      await startAndProposal(4, game);
      await game.connect(players[0]).voteOnProposal(0, false);
      await game.connect(players[1]).voteOnProposal(0, false);
      const player = await game.players(3);
      expect(player.balance.toString()).to.equal("5000000000000000000");
    });

    it("should not reduce balance to less than zero when applying poll tax", async () => {
      game = await createGame({ pollTax: 100 });

      await startAndProposal(4, game);
      await game.connect(players[0]).voteOnProposal(0, false);
      await game.connect(players[1]).voteOnProposal(0, false);
      const player = await game.players(0);
      expect(player.balance.toString()).to.equal("0");
    });

    it("should reject creating a proposal when balance is less than proposal fee", async () => {
      game = await createGame({
        entryFee: 0,
        startBalance: 0,
        proposalCost: 10,
      });
      await game.connect(players[1]).joinGame({
        value: "0",
      });

      return expect(
        game.connect(players[1]).createProposal(0, 500, { gasPrice: 0 })
      ).to.eventually.be.rejectedWith(
        "You do not have enough game funds to pay the proposal cost"
      );
    });

    it("should apply a proposal fee when a proposal is made", async () => {
      game = await createGame({ startBalance: 5, proposalCost: 1 });

      let player = await game.players(0);
      expect(player.balance.toString()).to.equal("5000000000000000000");
      await game.createProposal(0, 500, { gasPrice: 0 });
      player = await game.players(0);
      expect(player.balance.toString()).to.equal("4000000000000000000");
      await game.createProposal(0, 500, { gasPrice: 0 });
      player = await game.players(0);
      expect(player.balance.toString()).to.equal((3 * ether).toString());
    });
  });

  describe("endGame", async () => {
    it("should return deposits in proportion to players", async () => {
      await game.connect(players[1]).joinGame({
        value: "5000000000000000000",
        gasPrice: 0,
      });

      const player1BalanceStart = ethers.utils.formatEther(
        await players[0].getBalance()
      );
      const player2BalanceStart = ethers.utils.formatEther(
        await players[1].getBalance()
      );

      for (let i = 0; i < 30; i++) {
        await game.connect(players[0]).createProposal(0, 500, { gasPrice: 0 });
        await game.connect(players[0]).voteOnProposal(i, true, { gasPrice: 0 });
      }

      const player1 = await game.players(0);
      const player2 = await game.players(1);

      const player1BalanceEnd = ethers.utils.formatEther(
        await players[0].getBalance()
      );
      const player2BalanceEnd = ethers.utils.formatEther(
        await players[1].getBalance()
      );

      const player1Payout = player1BalanceEnd - player1BalanceStart;
      const player2Payout = player2BalanceEnd - player2BalanceStart;
      expect(player1Payout).to.equal(6.875);
      expect(player2Payout).to.equal(3.125);
    });

    it("should payout correctly after 100 rounds", async () => {
      const game = await createGame({
        maxProposals: 100,
        reward: 100000,
      });

      await game.connect(players[1]).joinGame({
        value: "5000000000000000000",
        gasPrice: 0,
      });

      const player1BalanceStart = ethers.utils.formatEther(
        await players[0].getBalance()
      );
      const player2BalanceStart = ethers.utils.formatEther(
        await players[1].getBalance()
      );

      for (let i = 0; i < 100; i++) {
        await game.connect(players[0]).createProposal(0, 500, { gasPrice: 0 });
        await game.connect(players[0]).voteOnProposal(i, true, { gasPrice: 0 });
      }

      const player1 = await game.players(0);
      const player2 = await game.players(1);

      const player1BalanceEnd = ethers.utils.formatEther(
        await players[0].getBalance()
      );
      const player2BalanceEnd = ethers.utils.formatEther(
        await players[1].getBalance()
      );

      const player1Payout = player1BalanceEnd - player1BalanceStart;
      const player2Payout = player2BalanceEnd - player2BalanceStart;

      expect(player1Payout).to.toBeGreaterThan(9.99);
      expect(player2Payout).to.toBeLessThan(0.01);
    });

    it("should handle the case where payment cannot be made due to rounding", async () => {
      const game = await createGame({
        pollTax: 100,
        reward: 0,
        proposalCost: 0,
      });

      await game.connect(players[1]).joinGame({
        value: "5000000000000000000",
        gasPrice: 0,
      });

      for (let i = 0; i < 3; i++) {
        console.log("round");
        await game.connect(players[0]).createProposal(0, 500, { gasPrice: 0 });
        console.log("vote");
        await game.connect(players[0]).voteOnProposal(i, true, { gasPrice: 0 });
      }
    });
  });

  describe("calculationMajority", () => {
    it("should return correct values for majority", async () => {
      const quorum = await calculations.functions.calculateMajority(50, 5);
      await expect(quorum[0].toNumber()).to.equal(2);
    });

    it("should return correct values for majority", async () => {
      const quorum = await calculations.functions.calculateMajority(50, 10);
      await expect(quorum[0].toNumber()).to.equal(5);
    });

    it("should return correct values for majority", async () => {
      const quorum = await calculations.functions.calculateMajority(20, 10);
      await expect(quorum[0].toNumber()).to.equal(2);
    });
  });

  describe("calculateQuorum", () => {
    it("should return correct values for quorum", async () => {
      const quorum = await calculations.functions.calculateQuorum(50, 5);
      await expect(quorum[0].toNumber()).to.equal(3);

      const quorum2 = await calculations.functions.calculateQuorum(80, 6);
      await expect(quorum2[0].toNumber()).to.equal(5);

      const quorum3 = await calculations.functions.calculateQuorum(80, 50);
      await expect(quorum3[0].toNumber()).to.equal(40);

      const quorum4 = await calculations.functions.calculateQuorum(50, 100);
      await expect(quorum4[0].toNumber()).to.equal(50);

      const quorum5 = await calculations.functions.calculateQuorum(30, 15);
      await expect(quorum5[0].toNumber()).to.equal(5);

      const quorum6 = await calculations.functions.calculateQuorum(100, 10);
      await expect(quorum6[0].toNumber()).to.equal(10);

      const quorum7 = await calculations.functions.calculateQuorum(99, 50);
      await expect(quorum7[0].toNumber()).to.equal(50);
    });
  });
});
