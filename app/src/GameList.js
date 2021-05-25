import { OrnateBorder } from "./OrnateBorder";

export const GameList = ({ gamesList, newGameHandler }) => {
  return (
    <>
      <div className="game-icons-container">
        <div className="game-icon-panel">
          <button className="game-button" onClick={newGameHandler}>
            <div>Create Game</div>
          </button>
        </div>
      </div>
      <div className="game-list panel">
        <OrnateBorder></OrnateBorder>
        <h2>Games</h2>
        {(!gamesList && "Loading...") || (
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
