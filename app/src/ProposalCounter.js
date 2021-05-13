import "./ProposalCounter.css";

export const ProposalCounter = ({ completeProposals, maxProposals }) => {
  let proposalsRemaining = maxProposals;
  if (completeProposals)
    proposalsRemaining = maxProposals - completeProposals.length;
  const portionRemaining = proposalsRemaining / maxProposals;

  console.log("completeProposals: " + completeProposals);
  console.log("maxProposals: " + maxProposals);

  return (
    <div className="proposal-counter-container">
      <div className="proposal-counter-caption-container">
        <div className="proposal-counter-caption">Proposals Left: </div>
        <div className="proposal-counter-numbers">
          {proposalsRemaining} / {maxProposals}
        </div>
      </div>
      <div className="proposal-counter">
        <div
          className="inner"
          style={{ width: `${portionRemaining * 100}%` }}
        ></div>
      </div>
    </div>
  );
};
