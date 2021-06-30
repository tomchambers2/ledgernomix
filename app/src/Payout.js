import Web3 from "web3";
import { gameConfig } from "./gameConfig";
import { getNumberWithOrdinal } from "./utils";
import "./Payout.css";
import { useState } from "react";
const { cryptoEntryFee, cryptocurrency } = gameConfig;

export const Payout = ({ players, userPlayerAddress, getPlayerName }) => {
  const playerIndex = players.findIndex(
    ({ playerAddress: otherPlayerAddress }) =>
      otherPlayerAddress === userPlayerAddress
  );

  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(playerIndex);

  const player = players[currentPlayerIndex];
  console.log({ playerIndex, currentPlayerIndex, players, player });

  if (!players || !player) return <div>LOADING...</div>;

  const totalBalance = players.reduce(
    (acc, { balance }) => acc + parseInt(Web3.utils.fromWei(balance)),
    0
  );

  const place =
    players
      .slice()
      .sort((p1, p2) => p2.balance - p1.balance)
      .findIndex(
        ({ playerAddress: otherPlayerAddress }) =>
          otherPlayerAddress === player.playerAddress
      ) + 1;

  const totalCryptoPot = cryptoEntryFee * players.length;

  if (!player) return <div></div>;

  const playerBalance = Web3.utils.fromWei(player.balance);

  return (
    <div>
      <h2>Payout</h2>
      <div className="payout-container">
        <button
          onClick={() =>
            setCurrentPlayerIndex(
              (currentPlayerIndex) =>
                (((currentPlayerIndex - 1) % players.length) + players.length) %
                players.length
            )
          }
        >
          &lt;
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
              {Web3.utils.fromWei(player.balance)} {gameConfig.gameCurrency}
            </div>
          </div>
          <div className="equals">=</div>
          <div className="split">
            <div>Pot Share</div>
            <div className="join-line"></div>
            <div>{`${((playerBalance / totalBalance) * 100).toFixed(2)}%`}</div>
          </div>
          <div className="equals">=</div>
          <div className="split">
            <div>Payout</div>
            <div className="join-line payout-highlight">
              <div className="join-line payout-dash"></div>
            </div>
            <div>
              {(
                (Web3.utils.fromWei(player.balance) / totalBalance) *
                totalCryptoPot
              ).toFixed(2)}{" "}
              {cryptocurrency}
            </div>
          </div>
        </div>
        <button
          onClick={() =>
            setCurrentPlayerIndex(
              (currentPlayerIndex) => (currentPlayerIndex + 1) % players.length
            )
          }
        >
          &gt;
        </button>
      </div>
    </div>
  );
};
