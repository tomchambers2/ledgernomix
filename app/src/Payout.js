import Web3 from "web3";
import { gameConfig } from "./gameConfig";
import "./Payout.css";
const { cryptoEntryFee } = gameConfig;

export const Payout = ({ players, playerAddress }) => {
  if (!players) return <div>LOADING...</div>;

  const player = players.find(
    ({ playerAddress: otherPlayerAddress }) =>
      otherPlayerAddress === playerAddress
  );

  if (!players) return <div>LOADING...</div>;

  const totalBalance = Web3.utils.fromWei(
    players.reduce((acc, { balance }) => acc + balance, 0)
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

  return (
    <div>
      <h2>Payout</h2>
      <div className="box">Place: {place}</div>
      <div className="box">
        In game tokens: {Web3.utils.fromWei(player.balance)}
      </div>
      <div className="box">
        Pot share:{" "}
        {`${(Web3.utils.fromWei(player.balance) / totalBalance) * 100}%`}
      </div>
      <div className="box">
        Payout:{" "}
        {(Web3.utils.fromWei(player.balance) / totalBalance) * totalCryptoPot}
      </div>
    </div>
  );
};
