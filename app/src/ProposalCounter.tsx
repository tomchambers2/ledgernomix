import "./ProposalCounter.css";
import { Tooltip } from "react-tooltip";

export const ProposalCounter = ({ completeProposals, maxProposals }) => {
  let proposalsRemaining = maxProposals;
  if (completeProposals)
    proposalsRemaining = maxProposals - completeProposals.length;
  const portionRemaining = proposalsRemaining / maxProposals;

  return (
    <div
      className="proposal-counter-container"
      data-tooltip-id="proposal-counter-tip"
      data-tooltip-content={"The game ends when the final proposal has completed"}
    >
      <Tooltip id="proposal-counter-tip" className="tooltip" />
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
