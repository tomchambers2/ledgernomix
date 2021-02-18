import { useState, useEffect, useCallback } from "react";
import Game from "./contracts/Game.json";
import { config } from "./config";
import "./App.css";
import { Scores } from "./Scores";
import { Rules } from "./Rules";
import { Proposals } from "./Proposals";
import { Propose } from "./Propose";
import { Loader } from "./Loader";
import Noty from "noty";
import "noty/lib/noty.css";
import "noty/lib/themes/mint.css";
const Web3 = require("web3");

const useContractArray = (contract, name) => {
  const [array, setArray] = useState(null);

  useEffect(() => {
    if (!contract) return;
    const getArray = async () => {
      let elements = [];
      let length = 0;
      try {
        length = await contract.methods[
          `get${name.slice(0, 1).toUpperCase()}${name.slice(1)}Length`
        ]().call();
        console.log("length array ", length);
      } catch (e) {
        console.log(`contract array ${name} error 1`, e);
      }
      try {
        for (let index = 0; index < length; index++) {
          const element = await contract.methods[name](index).call();
          elements = [...elements, element];
        }
        setArray(elements);
      } catch (e) {
        console.log(
          `contract array ${`get${name.slice(0, 1).toUpperCase()}${name.slice(
            1
          )}`} error 2`,
          e
        );
      }
    };
    getArray();
  }, [name, contract]);

  return array;
};

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

const useContract = (web3, abi, address) => {
  const [contract, setContract] = useState(null);

  useEffect(() => {
    if (!web3) return;
    const result = new web3.eth.Contract(Game.abi, address);
    setContract(result);
  }, [abi, address, web3]);

  return contract;
};

const useContractFn = (contract, name, options) => {
  const fn = useCallback(
    async (...args) => {
      console.log("call with", contract, name, options);
      try {
        await contract.methods[name](...args).send(options);
        console.log(`Executed ${name} successfully`);
      } catch (e) {
        // TODO: show err to user in useful way
        console.log(`Error when sending ${name}: ${e.message}`);
      }
    },
    [contract, name, options]
  );

  return fn;
};

const fireNotification = function (text, type) {
  new Noty({
    text,
    type,
  }).show();
};

function App() {
  const [web3, setWeb3] = useState(null);
  const [isPlayer, setIsPlayer] = useState(null);
  const game = useContract(web3, Game.abi, config.gameContract.address);
  const account = useAccount(web3);
  const proposals = useContractArray(game, "proposals");
  const players = useContractArray(game, "players");
  const rules = useContractArray(game, "rules");

  useEffect(() => {
    if (!account || !players) return;
    const result = players.some(
      ({ playerAddress }) => account === playerAddress
    );
    setIsPlayer(result);
  }, [account, players]);

  useEffect(() => {
    // TODO: check if metamask installed
    const web3 = new Web3(window.ethereum);
    setWeb3(web3);
  }, []);

  const joinGame = useContractFn(game, "joinGame", {
    from: account,
    value: Web3.utils.toWei("5"),
  });

  const joinGameHandler = () => {
    if (!account)
      return fireNotification("You need to install Metamask first!", "warning");
    joinGame();
  };

  const voteOnProposal = useContractFn(game, "voteOnProposal", {
    from: account,
  });
  const createProposal = useContractFn(game, "createProposal", {
    from: account,
  });

  const getPlayerName = (address) => {
    const index = players.findIndex((p) => p.playerAddress === address);
    return `PLAYER ${String.fromCharCode(index + "A".charCodeAt(0))}`;
  };

  // TODO: wait for everything to be ready before loading the page

  return (
    <div className="App">
      <h1>LEDGER</h1>
      <div className="panel join">
        <h2>
          blah blah blah what the game is, how you play it. how to install
          metamask guide
        </h2>
        {(isPlayer && "You are playing this game") || (
          <button onClick={joinGameHandler}>Join game</button>
        )}
      </div>
      <div className="container">
        <div className="leftPanel panel">
          {(players && (
            <Scores players={players} getPlayerName={getPlayerName}></Scores>
          )) || <Loader></Loader>}
        </div>

        <div className="rightPanel">
          <div className="rules panel">
            <div className="subpanel">
              {(rules && <Rules rules={rules}></Rules>) || <Loader></Loader>}
            </div>
          </div>
          <div className="propose panel">
            {(rules && (
              <Propose
                rules={rules}
                createProposal={createProposal}
                enabled={isPlayer}
              ></Propose>
            )) || <Loader></Loader>}
          </div>
          <div className="proposals panel">
            {(rules && proposals && (
              <Proposals
                proposals={proposals}
                rules={rules}
                getPlayerName={getPlayerName}
                voteOnProposal={voteOnProposal}
              ></Proposals>
            )) || <Loader></Loader>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
