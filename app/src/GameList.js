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
        {(!gamesList && "Loading...") || (
          <ol>
            {gamesList.map((game) => (
              <li>
                <a href={game}>{game}</a>
              </li>
            ))}
          </ol>
        )}
      </div>
    </>
  );
};
