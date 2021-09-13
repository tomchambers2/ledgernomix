import { useState, useEffect, useCallback } from "react";
import "./eskapade-fraktur-wakamaifondue.css";
import { Game } from "./Game";
import { Setup } from "./Setup";
import { GameList } from "./GameList";
import { fireNotification } from "./fireNotification";
import { useContract } from "./useContract";
import { default as GameFactoryContract } from "./contracts/GameFactory.json";
import { config } from "./config";
import { useContractFn } from "./useContractFn";
import { OrnateBorder } from "./OrnateBorder";
import theGameOfImage from "./backgrounds/thegameoftherulesof-Magnuntia.svg";
import { ToastContainer } from "react-toastify";
import "./App.css";
import { About } from "./About";
import { HowToPlay } from "./HowToPlay";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
  Link,
} from "react-router-dom";
import "./Toast.css";
import "./playtest.css";

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

  const [setupStatus, setSetupStatus] = useState("setnetwork");

  useEffect(() => {
    const fn = async () => {
      if (!window.ethereum) return setSetupStatus("install");
      const web3 = new Web3(window.ethereum);
      try {
        const network = await web3.eth.net.getNetworkType();
        if (network !== "private") return setSetupStatus("setnetwork");
        setSetupStatus("complete");
        setWeb3(web3);
      } catch (e) {
        console.log(e);
      }
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
      console.log(gamesList);
      setGamesList(gamesList);
    };
    fn();
  }, [gameFactory, web3, getArray]);

  const newGame = useContractFn(gameFactory, "newGame", {
    from: account,
    value: Web3.utils.toWei("5"),
  });
  const newGameHandler = async () => {
    try {
      const result = await newGame();
      const newGameAddress = result.events.NewGame.returnValues.gameAddress;
      setNewGameAddress(newGameAddress);
    } catch (e) {
      console.log(e);
    }
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
    <Router>
      <ToastContainer />
      <div className="app">
        <div className="ink-col-effect"></div>
        <div className="background-gradient"></div>
        <div className="intro">
          <Link to="/">
            <h2 className="logo">
              Ledgernomi<span style={{ fontVariant: "small-caps" }}>x</span>
            </h2>
          </Link>
          <div className="links">
            <Link to="/how-to-play">
              <h3>How to Play</h3>
            </Link>
            <Link to="/about">
              <h3>About</h3>
            </Link>
          </div>
        </div>
        <div className="all-panels-container">
          <div className="background-spacer"></div>

          <Switch>
            <Route path="/about">
              <About></About>
            </Route>
            <Route path="/how-to-play">
              <HowToPlay></HowToPlay>
            </Route>
            <Route path="/games">
              {(setupStatus === "complete" && (
                <>
                  {newGameAddress && <Redirect to={`/${newGameAddress}`} />}
                  <GameList
                    gamesList={gamesList}
                    newGameHandler={newGameHandler}
                  ></GameList>
                </>
              )) || <Setup setupStatus={setupStatus}></Setup>}
            </Route>
            <Route path="/:gameAddress">
              <Setup setupStatus={setupStatus}></Setup>
              <Game web3={web3} account={account}></Game>
            </Route>
            <Route path="/">
              <div className="panel-container">
                <div className="welcome panel">
                  <div className="background-pattern"></div>
                  <OrnateBorder></OrnateBorder>
                  <h1 className="logo">
                    Ledgernomi
                    <span style={{ fontVariant: "small-caps" }}>x</span>
                  </h1>
                  <img
                    className="tag-circle"
                    alt="the game of the rules of the game"
                    src={theGameOfImage}
                  ></img>
                  <div className="paragraph">
                    Ledgernomix is a game of political economy, played on a
                    blockchain, with real cryptocurrency.
                  </div>
                  <div className="paragraph">
                    Play with your friends in real time, like a board game, or
                    over a longer time, like correspondence chess.
                  </div>
                  <div className="paragraph">
                    Each game of Ledgernomix is a distributed autonomous
                    organisation, or DAO, governed by a contract that exists on
                    the blockchain. You can also think of it as a self-contained
                    model economy and model parliament, with you and your
                    friends as the members.
                  </div>
                </div>
              </div>
              <div className="panel-container">
                <div className="setup panel">
                  <div className="background-pattern"></div>
                  <OrnateBorder></OrnateBorder>
                  <h1 className="logo">Playtest</h1>
                  Sign up below to become part of our exclusive group of
                  playtesters who will help test and shape the game
                  <div id="mc_embed_signup" className="">
                    <form
                      action="https://vercel.us5.list-manage.com/subscribe/post?u=eb3bf72ef330a9ffb75f7e687&amp;id=082ec84faf"
                      method="post"
                      id="mc-embedded-subscribe-form"
                      name="mc-embedded-subscribe-form"
                      class="validate"
                      target="_blank"
                      novalidate
                    >
                      <div id="mc_embed_signup_scroll">
                        <div className="mc-field-group playtest-inputs">
                          <label for="mce-EMAIL">Email Address </label>
                          <input
                            type="email"
                            name="EMAIL"
                            class="required email"
                            id="mce-EMAIL"
                          />
                        </div>
                        <div id="mce-responses" class="clear">
                          <div
                            class="response"
                            id="mce-error-response"
                            style={{ display: "none" }}
                          ></div>
                          <div
                            class="response"
                            id="mce-success-response"
                            style={{ display: "none" }}
                          ></div>
                        </div>
                        <div
                          style={{ position: "absolute", left: "-5000px" }}
                          aria-hidden="true"
                        >
                          <input
                            type="text"
                            name="b_eb3bf72ef330a9ffb75f7e687_082ec84faf"
                            tabindex="-1"
                          />
                        </div>
                        <div class="clear">
                          <button
                            type="submit"
                            value="Subscribe"
                            name="subscribe"
                            id="mc-embedded-subscribe"
                            className="button"
                          >
                            Subscribe
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>

              {/* <div className="panel-container">
                <div className="setup panel">
                  <div className="background-pattern"></div>
                  <OrnateBorder></OrnateBorder>
                  <Link className="button" to="/games">
                    <h3
                    // onClick={() => {
                    //   fireNotification(`Test Notification`);}}
                    >
                      Get started
                    </h3>
                  </Link>
                </div>
              </div> */}
            </Route>
          </Switch>
        </div>
      </div>
    </Router>
  );
}

export default App;
