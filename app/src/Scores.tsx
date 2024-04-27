import { Web3 } from "web3";
import classNames from "classnames";
import { gameConfig } from "./gameConfig";
import { formatCurrency } from "./utils";
import { Tooltip } from "react-tooltip";

export const Scores = ({
  players,
  getPlayerName,
}) => {
  if (!players) return <div>LOADING...</div>;

  const topScoreWei = players.slice().sort((p1, p2) => {
    const p1Balance = parseInt(Web3.utils.fromWei(p1.balance, "ether"));
    const p2Balance = parseInt(Web3.utils.fromWei(p2.balance, "ether"));
    return p2Balance - p1Balance;
  })[0].balance;

  const topScore = parseInt(Web3.utils.fromWei(topScoreWei, "ether"));

  return (
    <>
      <h2>Ledger</h2>
      <Tooltip id="player-address-tip" className="tooltip" />
      <div className="item">
        {players
          .slice()
          .sort((p1, p2) => {
            const p1Balance = parseInt(Web3.utils.fromWei(p1.balance, "ether"));
            const p2Balance = parseInt(Web3.utils.fromWei(p2.balance, "ether"));
            return p2Balance - p1Balance;
          })
          .map((player, i) => (
            <div
              key={i}
              className={classNames("player", player.updated && "updated")}
            >
              <div className="player-score">
                <div data-tooltip-content={"Player address: " + player.playerAddress} data-tooltip-id="player-address-tip">
                  {getPlayerName(player.playerAddress)}
                </div>
                <div>
                  {formatCurrency(Web3.utils.fromWei(player.balance, "ether"))}{" "}
                  {gameConfig.gameCurrency}
                </div>
              </div>
              <div
                className="player-score-bar"
                style={{
                  width: `${
                    (parseInt(Web3.utils.fromWei(player.balance, "ether"), 10) /
                      topScore) *
                    100
                  }%`,
                }}
              ></div>
            </div>
          ))}
      </div>
    </>
  );
};
