import { Web3 } from "web3";
import classNames from "classnames";
import { gameConfig } from "./gameConfig";
import { formatCurrency } from "./utils";
import ReactTooltip from "react-tooltip";

export const Scores = ({ players, getPlayerName }) => {
  if (!players) return <div>LOADING...</div>;

  const topScore = parseInt(Web3.utils.fromWei(
    players.slice().sort((p1, p2) => p2.balance - p1.balance)[0].balance, "ether"
  ), 10);

  return (
    <>
      <h2>Ledger</h2>
      <ReactTooltip className="tooltip" effect="solid" />
      <div className="item">
        {players
          .slice()
          .sort((p1, p2) => p2.balance - p1.balance)
          .map((player, i) => (
            <div
              key={i}
              className={classNames("player", player.updated && "updated")}
            >
              <div className="player-score">
                <div data-tip={"Player address: " + player.playerAddress}>
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
                  width: `${(parseInt(Web3.utils.fromWei(player.balance, "ether"), 10) / topScore) * 100
                    }%`,
                }}
              ></div>
            </div>
          ))}
      </div>
    </>
  );
};
