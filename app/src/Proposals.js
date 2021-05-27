import "./Proposals.css";
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
                    <div className="votes-column">
                      <div
                        className="button"
                        onClick={() => voteOnProposal(proposal.index, true)}
                      >
                        Yes
                      </div>
                      {proposal.votes &&
                        proposal.votes
                          .filter(({ vote, playerAddress }) => vote)
                          .map(() => (
                            <>{getPlayerName(playerAddress)} voted 👍🏻</>
                          ))}
                    </div>
                    <div className="votes-column">
                      <div
                        className="button"
                        onClick={() => voteOnProposal(proposal.index, false)}
                      >
                        No
                      </div>
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
};
