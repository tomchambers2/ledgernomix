import { OrnateBorder } from "./OrnateBorder";

export const GameList = ({ gamesList, newGameHandler }) => {
  return (
    <>
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
        <h2>Games</h2>
        {(!gamesList && "Awaiting Metamask...") || (
          <div className="list-of games">
            {gamesList.map((game) => (
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
