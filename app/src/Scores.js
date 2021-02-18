import Web3 from "web3";

export const Scores = ({ players, getPlayerName }) => {
  return (
    <>
      <h2>Scores</h2>
      <ol>
        {players.map((player, i) => (
          <li key={i}>
            <span>
              {getPlayerName(player.playerAddress)} -{" "}
              {Web3.utils.fromWei(player[1])} LED
            </span>
            <br></br>
            <span>
              <small>{player[0]}</small>
            </span>
          </li>
        ))}
      </ol>
    </>
  );
};
