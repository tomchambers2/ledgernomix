import classNames from "classnames";
import { Propose } from "./Propose";
import { Loader } from "./Loader";
import { useContract } from "./useContract";
import { useContractFn } from "./useContractFn";
import { default as GameContract } from "./contracts/Game.json";
import { useParams } from "react-router-dom";
import { ruleConfig } from "./ruleConfig";
import ReactTooltip from "react-tooltip";

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
  pendingPlayers,
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
      {pendingPlayers &&
        pendingPlayers.slice().map((pendingPlayer, i) => (
          <div key={i} className={classNames("item button")}>
            <div>Admit new player</div>
            <div>
              {" "}
              {pendingPlayer.playerAddress.substring(0, 5)}...
              {pendingPlayer.playerAddress.substring(38, 42)}
            </div>
          </div>
        ))}

      {(!rules.length && "LOADING...") ||
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
              <ReactTooltip className="tooltip" effect="solid" />
              <span
                data-tip={
                  ruleConfig[rules[proposal.ruleIndex].name].description
                }
              >
                {getPlayerName(proposal.proposer)}{" "}
                {proposal.complete
                  ? proposal.successful
                    ? "successfully proposed"
                    : proposal.feePaid
                    ? "unsuccessfully proposed"
                    : "tried to propose"
                  : "proposes"}
                :<br></br> "{rules[proposal.ruleIndex].name} should be{" "}
                {proposal.value}
                {ruleConfig[rules[proposal.ruleIndex].name].unit}"
              </span>
            </div>

            {(!proposal.feePaid && <div> but could not afford fee</div>) || (
              <div className="votes">
                {proposal.pending && "Submitting vote..."}
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
                                <div key={vote.playerAddress}>
                                  {getPlayerName(vote.playerAddress)}
                                </div>
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
                            onClick={() =>
                              voteOnProposal(proposal.index, false)
                            }
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
            )}
          </div>
        ))}
    </>
  );
};
