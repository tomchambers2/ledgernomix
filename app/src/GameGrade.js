import { Statistic } from "./Statistic";
import { gameConfig } from "./gameConfig";
const { startBalance } = gameConfig;

const vetocracy = (proposals) => {
  const successfulProposals = proposals.filter(
    ({ successful }) => successful
  ).length;
  console.log(successfulProposals);
  return successfulProposals > 0
    ? (successfulProposals / proposals.length) * 100
    : 0;
};

export const GameGrade = ({ players, proposals }) => {
  if (!players || !proposals) return <div>LOADING...</div>;

  console.log(players);
  console.log(proposals);

  return (
    <>
      <h2>Game grade</h2>
      <p>
        {[
          { title: "Equality", number: 60, avg: 45 },
          { title: "Participation", number: 41 },
          { title: "Inflation", number: 100 },
          { title: "Vetocracy", number: vetocracy(proposals) },
        ].map((statistic) => (
          <Statistic {...statistic}></Statistic>
        ))}
      </p>
    </>
  );
};
