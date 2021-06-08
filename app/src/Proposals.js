import classNames from "classnames";
import { Propose } from "./Propose";
import { Loader } from "./Loader";
import { useContract } from "./useContract";
import { useContractFn } from "./useContractFn";
import { default as GameContract } from "./contracts/Game.json";
import { useParams } from "react-router-dom";

export const Proposals = ({
  rules,
  proposals,
  voteOnProposal,
  getPlayerName,
  playerAddress,
  isPlayer,
  gameActive,
  web3,
  account,
  players,
  playerIndex,
}) => {
  const { gameAddress } = useParams();
  const game = useContract(web3, GameContract.abi, gameAddress);
  const createProposal = useContractFn(game, "createProposal", {
    from: account,
  });

  return (
    <>
      <h2>Proposals</h2>
      {(!rules.length && "LOADING...") ||
        // (!proposals.length &&
        //   "No rule changes have been proposed so far. Use the 'Propose rule change' form to start the game")}

        (gameActive && (
          <div className="item">
            {(rules && (
              <Propose
                rules={rules}
                createProposal={createProposal}
                isPlayer={isPlayer}
                gameActive={gameActive}
                players={players}
                proposals={proposals}
                playerIndex={playerIndex}
                getPlayerName={getPlayerName}
              ></Propose>
            )) || <Loader></Loader>}
          </div>
        ))}

      {proposals
        .map((proposal, index) => ({ ...proposal, index }))
        .slice()
        .reverse()
        .map((proposal, i) => (
          <div
            key={i}
            className={classNames("item", proposal.updated && "updated")}
          >
            <div
              className={classNames("title", proposal.complete && "complete")}
            >
              {getPlayerName(proposal.proposer)}{" "}
              {proposal.complete
                ? proposal.successful
                  ? "successfully proposed"
                  : "unsuccessfully proposed"
                : "proposes"}
              :<br></br> "{rules[proposal.ruleIndex].name} should be{" "}
              {proposal.value}"
            </div>
            <div className="votes"></div>
            {proposal.pending && "PENDING"}
            <div className="vote-actions">
              {!proposal.pending && (
                <>
                  <div className="votes-column">
                    {((proposal.votes.some(
                      ({ playerAddress: voter }) => voter === playerAddress
                    ) ||
                      proposal.complete ||
                      !isPlayer) && (
                      <div className="votes-column-header">Yes</div>
                    )) || (
                      <div
                        className="button"
                        onClick={() => voteOnProposal(proposal.index, true)}
                      >
                        Yes
                      </div>
                    )}
                    <div className="votes-row-divider"></div>
                    <div className="voters">
                      {proposal.votes &&
                        proposal.votes
                          .filter(({ vote }) => vote)
                          .map((vote) => (
                            <div>{getPlayerName(vote.playerAddress)}</div>
                          ))}
                    </div>
                  </div>
                  <div className="votes-column-divider"></div>
                  <div className="votes-column">
                    {((proposal.votes.some(
                      ({ playerAddress: voter }) => voter === playerAddress
                    ) ||
                      proposal.complete ||
                      !isPlayer) && (
                      <div className="votes-column-header">No</div>
                    )) || (
                      <div
                        className="button"
                        onClick={() => voteOnProposal(proposal.index, true)}
                      >
                        No
                      </div>
                    )}
                    <div className="votes-row-divider"></div>
                    <div className="voters">
                      {proposal.votes &&
                        proposal.votes
                          .filter(({ vote }) => !vote)
                          .map((vote) => (
                            <div>{getPlayerName(vote.playerAddress)}</div>
                          ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
    </>
  );
};
