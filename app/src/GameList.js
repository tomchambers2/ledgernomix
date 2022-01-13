import { OrnateBorder } from "./OrnateBorder";
import { useContract } from "./useContract";
import { Web3Context } from "./web3context";
import { useState, useEffect, useContext, useCallback } from "react";
import { default as GameFactoryContract } from "./contracts/GameFactory.json";
import { config } from "./config";
import { contractFn } from "./useContractFn";
import { fireNotification } from "./fireNotification";
import { useAccount } from "./useAccount";
import { Redirect } from "react-router-dom";
import { Setup } from "./Setup";
import { gameConfig } from "./gameConfig";
import { formatCurrency } from "./utils.js";
const { cryptoEntryFee } = gameConfig;

const Web3 = require("web3");

export const GameList = () => {
  const { web3, setupStatus } = useContext(Web3Context);
  const account = useAccount(web3);
  const [gamesList, setGamesList] = useState(null);
  const [newGameAddress, setNewGameAddress] = useState(false);

  const gameFactory = useContract(
    web3,
    GameFactoryContract.abi,
    config.gameFactoryContract.address
  );

  const getArray = useCallback(
    async (name) => {
      if (!gameFactory) {
        return;
      }
      let elements = [];
      let length = 0;
      try {
        length = await gameFactory.methods.getGamesLength().call();
      } catch (e) {
        fireNotification(`Failed to get ${name}`);
        console.error(`Failed to get ${name} 1: ${e.message}`);
      }
      try {
        for (let index = 0; index < length; index++) {
          const element = await gameFactory.methods.games(index).call();
          elements = [...elements, element];
        }
        return elements;
      } catch (e) {
        fireNotification(`Failed to get ${name}`);
        console.error(`Failed to get ${name} 2: ${e.message}`);
      }
    },
    [gameFactory]
  );

  useEffect(() => {
    const fn = async () => {
      if (setupStatus !== "complete") return;
      if (!gameFactory) return;
      const gamesList = await getArray("games");
      console.log(gamesList);
      setGamesList(gamesList);
    };
    fn();
  }, [gameFactory, web3, getArray, setupStatus]);

  useEffect(() => {
    if (!gameFactory) return;
    const subscription = gameFactory.events.NewGame().on("data", (data) => {
      fireNotification("New game created", "success");
      const updatedGamesList = gamesList.slice();
      updatedGamesList[data.returnValues.gameIndex] =
        data.returnValues.gameAddress;
      setGamesList(updatedGamesList);
    });

    return () =>
      subscription.unsubscribe((err) => {
        if (err) console.error(err);
      });
  }, [gameFactory, gamesList]);

  const newGameHandler = (gameFee) => async () => {
    try {
      console.log("val", Web3.utils.toWei(gameFee));
      const result = await contractFn(gameFactory, "newGame", {
        from: account,
        value: Web3.utils.toWei(gameFee),
      });

      const newGameAddress = result.events.NewGame.returnValues.gameAddress;
      setNewGameAddress(newGameAddress);
    } catch (e) {
      console.log(e);
    }
  };

  if (setupStatus !== "complete") return <Setup />;

  return (
    <>
      {newGameAddress && <Redirect to={`/${newGameAddress}`} />}
      <div className="game-icons-container">
        <div className="game-icon-panel">
          <div className="background-pattern"></div>
          <button
            className="game-button"
            onClick={newGameHandler(String(cryptoEntryFee))}
          >
            <div>
              Create
              <div>${formatCurrency(cryptoEntryFee)}</div>
              Game
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
            {!gamesList.length && "No recent games"}
            {gamesList
              .slice()
              .reverse()
              .map((game) => (
                <div key={game} className="game-list-item">
                  <a className="game-list-button" href={game}>
                    Game '{game.slice(game.length - 6)}
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
