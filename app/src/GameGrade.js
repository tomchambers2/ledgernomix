import { Statistic } from "./Statistic";
import { gameConfig } from "./gameConfig";
import { weiToEth } from "./utils";

const equality = (players) => {
  let intBalancesArray = [];

  for (let i = 0; i < players.length; i++) {
    intBalancesArray.push(parseInt(players[i].balance));
  }
  const intBalancesArraySorted = intBalancesArray.sort((a, b) =>
    a > b ? 1 : -1
  );

  return intBalancesArraySorted[0] > 0
    ? (intBalancesArraySorted[0] /
        intBalancesArraySorted[intBalancesArraySorted.length - 1]) *
        100
    : 0;
};

const participation = (proposals, players) => {
  let totalVotes = 0;
  const possibleVotes = proposals.length * players.length;
  for (let i = 0; i < proposals.length; i++) {
    totalVotes += proposals[i].votes.length;
  }

  return totalVotes > 0 ? (totalVotes / possibleVotes) * 100 : 0;
};

const vetocracy = (proposals) => {
  const successfulProposals = proposals.filter(
    ({ successful }) => successful
  ).length;
  return successfulProposals > 0
    ? 100 - (successfulProposals / proposals.length) * 100
    : 100;
};

const inflation = (players) => {
  const totalStartGameBalance = gameConfig.startBalance * players.length;
  const totalEndGameBalanceWei = players.reduce(
    (acc, { balance }) => acc + parseInt(balance),
    0
  );
  const totalEndGameBalance = weiToEth(totalEndGameBalanceWei);

  // console.log("totalEndGameBalanceWei: ", totalEndGameBalanceWei);
  // console.log("totalEndGameBalance: ", totalEndGameBalance);
  // console.log("totalStartGameBalance: ", totalStartGameBalance);

  const actualInflation =
    (totalEndGameBalance / totalStartGameBalance) * 100 - 100;
  const inflationRankFactor = 0.01;

  const inverseTanInflation = Math.atan(actualInflation * inflationRankFactor);

  const normalisedInflationRank =
    ((inverseTanInflation + Math.PI / 2) / Math.PI) * 100;

  return normalisedInflationRank;
};

export const GameGrade = ({ players, proposals }) => {
  if (!players || !proposals) return <div>LOADING...</div>;

  return (
    <>
      <h2>Game Grade</h2>

      {[
        {
          title: "Equality",
          number: equality(players).toFixed(0),
          description:
            "Indicates even distribution with a higher score showing a smaller gap between rich and poor",
        },
        {
          title: "Participation",
          number: participation(proposals, players).toFixed(0),
          description:
            "Indicates how frequently playes were able to vote on proposals",
        },
        {
          title: "Inflation Rank",
          number: inflation(players).toFixed(0),
          description: "???",
        },
        {
          title: "Vetocracy",
          number: vetocracy(proposals).toFixed(0),
          description: "???",
        },
      ].map((statistic) => (
        <Statistic key={statistic.title} {...statistic}></Statistic>
      ))}
    </>
  );
};
