import Web3 from "web3";

export const Scores = ({ players, getPlayerName }) => {
  return (
    <>
      <h2>Scores</h2>
      <ol>
        {players
          .map((p) => {
            console.log(p);
            return p;
          })
          .sort((p1, p2) => p2.balance - p1.balance)
          .map((player, i) => (
            <li key={i}>
              <span>
                {getPlayerName(player.playerAddress)} -{" "}
                {Web3.utils.fromWei(player.balance)} LED
              </span>
              <br></br>
              <span>
                <small>{player.playerAddress}</small>
              </span>
            </li>
          ))}
      </ol>
    </>
  );
};
