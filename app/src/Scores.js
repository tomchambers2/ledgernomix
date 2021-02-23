import Web3 from "web3";
import classNames from "classnames";

export const Scores = ({ players, getPlayerName }) => {
  return (
    <>
      <h2>Ledger</h2>
      <div className="item">
        {players
          .sort((p1, p2) => p2.balance - p1.balance)
          .map((player, i) => (
            <div
              key={i}
              className={classNames("player", player.updated && "updated")}
            >
              <div className="player-score">
                <div>{getPlayerName(player.playerAddress)}</div>
                <div>{Web3.utils.fromWei(player.balance)}</div>
              </div>
              <div className="player-score-bar" style={{ width: `30%` }}></div>
            </div>
          ))}
      </div>
    </>
  );
};
