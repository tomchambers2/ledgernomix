export const ruleConfig = {
  "Entry fee": {
    name: "Entry Fee",
    description: "The amount in DAI to buy into the game",
    inactive: 10,
    unproposable: true,
  },
  "Start balance": {
    name: "Start Balance",
    description: "The amount of game tokens a player starts with",
    unit: "",
    inactive: 1000,
  },
  "Proposal reward": {
    name: "Successful Proposal Reward",
    description:
      "The amount given to a player when their proposal is successful",
    unit: "",
    inactive: 0,
  },
  Majority: {
    name: "Majority",
    description:
      "The proportion of votes required for a proposal to be enacted",
    unit: "%",
  },
  Quorum: {
    name: "Quorum",
    description:
      "The proportion of players required for a proposal to complete",
    unit: "%",
  },
  "Max proposals": {
    name: "Max Proposals",
    description: "The game ends when this many proposals have been completed",
    unit: "",
    inactive: 30,
  },
  "Poll tax": {
    name: "Poll Tax",
    description: "A fixed tax collected on every completed proposal",
    inactive: 0,
  },
  "Wealth tax": {
    name: "Wealth Tax",
    description: "A percentage tax collected on every completed proposal",
    unit: "%",
    inactive: 0,
  },
  "Wealth tax threshold": {
    name: "Wealth Tax Threshold",
    description: "A percentage tax collected on every completed proposal",
    inactive: 0,
  },
  "Proposal fee": {
    name: "Proposal Fee",
    description: "A fee collected on newly created proposals",
    inactive: 0,
  },
};
