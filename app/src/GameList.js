export const GameList = ({ gamesList, newGameHandler }) => {
  return (
    <>
      <div>
        <button onClick={newGameHandler}>New game</button>
      </div>
      {(!gamesList && "Loading...") || (
        <ol>
          {gamesList.map((game) => (
            <li>
              <a href={game}>{game}</a>
            </li>
          ))}
        </ol>
      )}
    </>
  );
};
