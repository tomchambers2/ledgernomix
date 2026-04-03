import { Web3 } from 'web3';
import { gameConfig } from "./gameConfig";
import { getNumberWithOrdinal, formatCurrency } from "./utils";
import "./Payout.css";
import { useState } from "react";
const { cryptocurrency } = gameConfig;

export const Payout = ({
  players,
  userPlayerAddress,
  getPlayerName,
  gamePot,
}) => {
  const playerIndex = players.findIndex(
    ({ playerAddress: otherPlayerAddress }) =>
      otherPlayerAddress === userPlayerAddress
  );

  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(playerIndex);

  const player = players[currentPlayerIndex];

  if (!players || !player) return <div>LOADING...</div>;

  const totalBalance = players.reduce(
    (acc, { balance }) => acc + parseFloat(Web3.utils.fromWei(balance, "ether")),
    0
  );

  const place =
    players
      .slice()
      .sort((p1, p2) => {
        const p1Balance = parseFloat(Web3.utils.fromWei(p1.balance, "ether"));
        const p2Balance = parseFloat(Web3.utils.fromWei(p2.balance, "ether"));
        return p2Balance - p1Balance;
      })
      .findIndex(
        ({ playerAddress: otherPlayerAddress }) =>
          otherPlayerAddress === player.playerAddress
      ) + 1;

  if (!player) return <div></div>;

  const playerBalance = parseFloat(Web3.utils.fromWei(player.balance, "ether"));

  console.log("playerBalance", playerBalance, totalBalance, parseFloat(Web3.utils.fromWei(String(gamePot), "ether")));

  return (
    <div>
      <h2>Payout</h2>
      <div className="payout-container">
        <button
          className="navigator"
          onClick={() =>
            setCurrentPlayerIndex(
              (currentPlayerIndex) =>
                (((currentPlayerIndex - 1) % players.length) + players.length) %
                players.length
            )
          }
        >
          &#123;
        </button>
        <div className="details">
          <div className="split">
            <div>Name</div> <div className="join-line"></div>
            <div>{getPlayerName(player.playerAddress)}</div>
          </div>
          <br></br>
          <div className="split">
            <div>Place</div> <div className="join-line"></div>
            <div>{getNumberWithOrdinal(place)}</div>
          </div>
          <br></br>
          <div className="split">
            <div>Score</div>
            <div className="join-line"></div>
            <div>
              {formatCurrency(Web3.utils.fromWei(player.balance, "ether"))}{" "}
              {gameConfig.gameCurrency}
            </div>
          </div>
          <div className="equals">=</div>
          <div className="split">
            <div>Pot Share</div>
            <div className="join-line"></div>
            <div>{`${((playerBalance / totalBalance) * 100).toPrecision(
              2
            )}%`}</div>
          </div>
          <div className="equals">=</div>
          {(playerIndex === currentPlayerIndex && (
            <div className="split payout-highlight">
              <div>Payout</div>
              <div className="join-line">
                <div className="join-line"></div>
              </div>
              <div>
                {formatCurrency(
                  (playerBalance / totalBalance) *
                  parseFloat(Web3.utils.fromWei(String(gamePot), "ether"))
                )}{" "}
                {cryptocurrency}
              </div>
            </div>
          )) || (
              <div className="split">
                <div>Payout</div>
                <div className="join-line">
                  <div className="join-line"></div>
                </div>
                <div>
                  {formatCurrency(
                    (playerBalance / totalBalance) *
                    parseFloat(Web3.utils.fromWei(String(gamePot), "ether"))
                  )}{" "}
                  {cryptocurrency}
                </div>
              </div>
            )}
        </div>
        <button
          className="navigator"
          onClick={() =>
            setCurrentPlayerIndex(
              (currentPlayerIndex) => (currentPlayerIndex + 1) % players.length
            )
          }
        >
          &#125;
        </button>
      </div>
    </div>
  );
};
