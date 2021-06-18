import { useState, useEffect, useCallback } from "react";
import "./App.css";
import "./eskapade-fraktur-wakamaifondue.css";
import "noty/lib/noty.css";
import "noty/lib/themes/mint.css";
import { Game } from "./Game";
import { Setup } from "./Setup";
import { GameList } from "./GameList";
import { fireNotification } from "./fireNotification";
import { useContract } from "./useContract";
import { default as GameFactoryContract } from "./contracts/GameFactory.json";
import { config } from "./config";
import { useContractFn } from "./useContractFn";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";

const Web3 = require("web3");

const useAccount = (web3) => {
  const [account, setAccount] = useState(null);

  useEffect(() => {
    if (!web3) return;
    async function fetchAccounts() {
      try {
        const accounts = await web3.eth.requestAccounts();
        setAccount(accounts[0]);
      } catch (e) {
        console.error(`Failed getting accounts`);
      }
    }
    fetchAccounts();
  }, [web3]);
  return account;
};

function App() {
  const [web3, setWeb3] = useState(null);
  const account = useAccount(web3);
  const gameFactory = useContract(
    web3,
    GameFactoryContract.abi,
    config.gameFactoryContract.address
  );

  const [setupStatus, setSetupStatus] = useState({
    metamask: false,
    network: false,
  });

  useEffect(() => {
    const fn = async () => {
      console.log("check setup");
      if (!window.ethereum)
        return setSetupStatus({ metamask: false, network: false });
      const web3 = new Web3(window.ethereum);
      const network = await web3.eth.net.getNetworkType();
      if (network !== "private")
        return setSetupStatus({ metamask: true, network: false });
      setSetupStatus({ metamask: true, network: true });
      setWeb3(web3);
    };
    fn();
  }, []);

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

  const [gamesList, setGamesList] = useState(null);
  const [newGameAddress, setNewGameAddress] = useState(false);

  useEffect(() => {
    const fn = async () => {
      if (!gameFactory) return;
      const gamesList = await getArray("games");
      setGamesList(gamesList);
    };
    fn();
  }, [gameFactory, web3, getArray]);

  const newGame = useContractFn(gameFactory, "newGame", {
    from: account,
    value: Web3.utils.toWei("10"),
  });
  const newGameHandler = async () => {
    const newGameAddress = await newGame();
    setNewGameAddress(newGameAddress);
  };

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

  return (
    <div className="app">
      <div className="background-gradient"></div>
      <div className="intro">
        <div>
          <h1>
            Ledgernomi<span style={{ fontVariant: "small-caps" }}>x</span>
          </h1>
        </div>
        <div className="links">
          <h3>How to Play</h3>
          <h3>About</h3>
        </div>
      </div>
      <div className="all-panels-container">
        <div className="background-spacer"></div>
        <Router>
          <Setup setupStatus={setupStatus}></Setup>
          <Switch>
            <Route path="/:gameAddress">
              <Game web3={web3} account={account}></Game>
            </Route>
            <Route path="/">
              {newGameAddress && <Redirect to="/" />}
              <GameList
                gamesList={gamesList}
                newGameHandler={newGameHandler}
              ></GameList>
            </Route>
          </Switch>
        </Router>
      </div>
    </div>
  );
}

export default App;
