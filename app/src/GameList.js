import { OrnateBorder } from "./OrnateBorder";
import Wordhash from "wordhash";

const wordhash = Wordhash({ length: 3 });

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
        <h2>Most Recent Games</h2>
        {(!gamesList && "Awaiting Metamask...") || (
          <div className="list-of games">
            {gamesList
              .slice()
              .reverse()
              .map((game) => (
                <div key={game} className="game-list-item">
                  <a className="game-list-button" href={game}>
                    {wordhash.hash(game)} {game}
                  </a>
                </div>
              ))}
          </div>
        )}
      </div>
      <div className="background-spacer"></div>
    </>
  );
};
