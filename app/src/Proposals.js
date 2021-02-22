import "./Proposals.css";
import classNames from "classnames";

export const Proposals = ({
  rules,
  proposals,
  voteOnProposal,
  getPlayerName,
  playerAddress,
  isPlayer,
  gameActive,
}) => (
  <>
    <h2>Proposals</h2>
    {(!rules.length && "LOADING...") ||
      (!proposals.length &&
        "No rule changes have been proposed so far. Use the 'Propose rule change' form to start the game")}

    {proposals
      .map((proposal, index) => ({ ...proposal, index }))
      .slice()
      .reverse()
      .map((proposal, i) => (
        <div key={i} className="proposal">
          <div className={classNames("title", proposal.complete && "complete")}>
            {getPlayerName(proposal.proposer)}{" "}
            {proposal.complete ? "proposed" : "proposes"}{" "}
            {rules[proposal.ruleIndex].name} should be {proposal.value}
          </div>
          <div className="votes">
            {proposal.votes &&
              proposal.votes
                .filter(({ vote, playerAddress }) => vote)
                .map(() => <>{getPlayerName(playerAddress)} voted 👍🏻</>)}
            {proposal.votes &&
              proposal.votes
                .filter(({ vote, playerAddress }) => !vote)
                .map(() => <>{getPlayerName(playerAddress)} voted 👎</>)}
          </div>
          {/* {proposal.successful.toString()} */}
          {proposal.pending && "PENDING"}
          <div className="vote-actions">
            {isPlayer &&
              gameActive &&
              !proposal.votes.some(
                ({ playerAddress: voter }) => voter === playerAddress
              ) &&
              !proposal.complete &&
              !proposal.pending && (
                <>
                  <button
                    className="small"
                    onClick={() => voteOnProposal(proposal.index, true)}
                  >
                    For
                  </button>
                  <button
                    className="small"
                    onClick={() => voteOnProposal(proposal.index, false)}
                  >
                    Against
                  </button>
                </>
              )}
          </div>
        </div>
      ))}
  </>
);
