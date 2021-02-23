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
        <div
          key={i}
          className={classNames("item", proposal.updated && "updated")}
        >
          <div className={classNames("title", proposal.complete && "complete")}>
            {getPlayerName(proposal.proposer)}{" "}
            {proposal.complete ? "proposed" : "proposes"}:<br></br> "
            {rules[proposal.ruleIndex].name} should be {proposal.value}"
          </div>
          <div className="votes"></div>
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
                  <div
                    className="button"
                    onClick={() => voteOnProposal(proposal.index, true)}
                  >
                    Yes
                    {proposal.votes &&
                      proposal.votes
                        .filter(({ vote, playerAddress }) => vote)
                        .map(() => (
                          <>{getPlayerName(playerAddress)} voted 👍🏻</>
                        ))}
                  </div>
                  <div
                    className="button"
                    onClick={() => voteOnProposal(proposal.index, false)}
                  >
                    No
                    {proposal.votes &&
                      proposal.votes
                        .filter(({ vote, playerAddress }) => !vote)
                        .map(() => (
                          <>{getPlayerName(playerAddress)} voted 👎</>
                        ))}
                  </div>
                </>
              )}
          </div>
        </div>
      ))}
  </>
);
