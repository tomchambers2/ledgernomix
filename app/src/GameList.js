import { OrnateBorder } from "./OrnateBorder";

export const GameList = ({ gamesList, newGameHandler }) => {
  return (
    <>
      <div className="welcome panel">
        <div className="background-pattern"></div>
        <OrnateBorder></OrnateBorder>
        <h1 className="logo">
          Ledgernomi<span style={{ fontVariant: "small-caps" }}>x</span>
        </h1>
        <h3>the game of the rules of the game</h3>
        <br></br>
        <div>
          Ledgernomix is a game of political economy, played on a blockchain,
          with real cryptocurrency.
        </div>
        <br></br>
        <div>
          Play with your friends in real time, like a board game, or over a
          longer time, like correspondence chess.
        </div>
        <br></br>
        <div>
          Each game of Ledgernomix is a distributed autonomous organisation, or
          DAO, governed by a contract that exists on the blockchain. You can
          also think of it as a self-contained model economy and model
          parliament, with you and your friends as the members.
        </div>
        <br></br>
      </div>
      <div className="game-icons-container">
        <div className="game-icon-panel">
          <div className="background-pattern"></div>
          <button className="game-button" onClick={newGameHandler}>
            <div>
              Create <br></br>$5.00<br></br> Game
            </div>
          </button>
        </div>
      </div>
      <div className="game-list panel">
        <div className="background-pattern"></div>
        <OrnateBorder></OrnateBorder>
        <h2>Most Recent Games</h2>
        {(!gamesList && "Awaiting Metamask...") || (
          <div className="list-of games">
            {gamesList
              .slice()
              .reverse()
              .map((game) => (
                <div className="game-list-item">
                  <a className="game-list-button" href={game}>
                    {game}
                  </a>
                </div>
              ))}
          </div>
        )}
      </div>
    </>
  );
};
