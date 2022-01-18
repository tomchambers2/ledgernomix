import { gameConfig } from "./gameConfig";

export const ruleConfig = {
  "Entry fee": {
    name: "Entry fee",
    description: "The amount in xDAI to buy into the game",
    inactive: 5,
    unproposable: true,
    hidden: true,
  },
  "Start balance": {
    name: "Start balance",
    description: "The amount of game tokens a player starts with",
    unit: " " + gameConfig.gameCurrency,
    inactive: 1000,
    unproposable: true,
  },
  "Proposal reward": {
    name: "Proposal reward",
    description:
      "The amount awarded to a player when their proposal is successful",
    unit: " " + gameConfig.gameCurrency,
    inactive: 0,
  },
  Majority: {
    name: "Majority required",
    append: ">",
    description:
      "The proportion of Yes votes that must be exceeded for a proposal to be enacted",
    unit: "%",
  },
  Quorum: {
    name: "Quorum required",
    description:
      "The proportion of players votes required for a proposal to complete",
    unit: "%",
  },
  "Game length": {
    name: "Game length",
    description: "The game ends when this many proposals have been completed",
    unit: " proposals",
    unproposable: false,
  },
  "Poll tax": {
    name: "Poll tax",
    description: "A fixed tax collected after every completed proposal",
    inactive: 0,
    unit: " " + gameConfig.gameCurrency,
  },
  "Wealth tax": {
    name: "Wealth tax",
    description: "A percentage tax collected after every completed proposal",
    unit: "%",
    inactive: 0,
  },
  "Wealth tax threshold": {
    name: "Wealth tax threshold",
    description:
      "Only a player's points above this score will be subject to any wealth tax",
    unit: " " + gameConfig.gameCurrency,
    inactive: 0,
  },
  "Proposal fee": {
    name: "Proposal fee",
    description: "A fee deducted for creating a proposal",
    inactive: 0,
    unit: " " + gameConfig.gameCurrency,
  },
  Dividend: {
    name: "Dividend",
    description: "A payment awarded to all players each round",
    unit: " " + gameConfig.gameCurrency,
    inactive: 0,
  },
};
