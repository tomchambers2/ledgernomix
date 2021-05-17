export const ruleConfig = {
  "Entry fee": {
    name: "Entry fee",
    description: "The amount in DAI to buy into the game",
  },
  "Proposal reward": {
    name: "Proposal reward",
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
    name: "Max proposals",
    description: "The game ends when this many proposals have been completed",
    unit: "",
    inactive: 30,
  },
  "Poll tax": {
    name: "Poll tax",
    description: "A fixed tax collected on every completed proposal",
    inactive: 0,
  },
  "Wealth tax": {
    name: "Wealth tax",
    description: "A percentage tax collected on every completed proposal",
    inactive: 0,
  },
  "Wealth tax threshold": {
    name: "Wealth tax threshold",
    description: "A percentage tax collected on every completed proposal",
    inactive: 0,
  },
  "Proposal fee": {
    name: "Proposal fee",
    description: "A fee collected on newly created proposals",
    inactive: 0,
  },
};
