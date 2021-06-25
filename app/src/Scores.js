import Web3 from "web3";
import classNames from "classnames";
import { gameConfig } from "./gameConfig";
import { formatCurrency } from "./utils.js";

export const Scores = ({ players, getPlayerName }) => {
  if (!players) return <div>LOADING...</div>;

  const topScore = Web3.utils.fromWei(
    players.slice().sort((p1, p2) => p2.balance - p1.balance)[0].balance
  );

  return (
    <>
      <h2>Ledger</h2>
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
                <div>{getPlayerName(player.playerAddress)}</div>
                <div>
                  {formatCurrency(Web3.utils.fromWei(player.balance))}{" "}
                  {gameConfig.gameCurrency}
                </div>
              </div>
              <div
                className="player-score-bar"
                style={{
                  width: `${
                    (Web3.utils.fromWei(player.balance) / topScore) * 100
                  }%`,
                }}
              ></div>
            </div>
          ))}
      </div>
    </>
  );
};
