import Web3 from "web3";
import { gameConfig } from "./gameConfig";
import "./Payout.css";
const { cryptoEntryFee, cryptocurrency } = gameConfig;

export const Payout = ({ players, playerAddress }) => {
  if (!players) return <div>LOADING...</div>;

  const player = players.find(
    ({ playerAddress: otherPlayerAddress }) =>
      otherPlayerAddress === playerAddress
  );

  if (!players) return <div>LOADING...</div>;

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
          otherPlayerAddress === playerAddress
      ) + 1;

  const totalCryptoPot = cryptoEntryFee * players.length;

  if (!player) return <div></div>;

  const playerBalance = Web3.utils.fromWei(player.balance);

  return (
    <div>
      <h2>Payout</h2>
      <div className="box">Place: {place}</div>
      <div className="box">
        In Game Tokens: {Web3.utils.fromWei(player.balance)}
      </div>
      <div className="box">
        Pot Share: {`${((playerBalance / totalBalance) * 100).toFixed(2)}%`}
      </div>
      <div className="box">
        Payout:{" "}
        {(Web3.utils.fromWei(player.balance) / totalBalance) * totalCryptoPot}{" "}
        {cryptocurrency}
      </div>
    </div>
  );
};
