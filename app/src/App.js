import { useState, useEffect, useCallback } from "react";
import Game from "./contracts/Game.json";
import { config } from "./config";
import "./App.css";
import { ruleConfig } from "./ruleConfig";
import Select from "react-select";
const Web3 = require("web3");

const useContractData = (contract, name) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!contract) return;
    console.log(contract);
    async function fetchData() {
      try {
        const result = await contract.methods[name]().call();
        setData(result);
      } catch (e) {
        console.error(`Failed retrieving ${name} data: ${e}`);
      }
    }
    fetchData();
  }, [contract, name]);

  // setup subscriber to listen for new data

  return data;
};

const useContractArray = (contract, name) => {
  const [array, setArray] = useState([]);

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
          // const element = await contract.methods[
          //   `get${name.slice(0, 1).toUpperCase()}${name.slice(1)}`
          // ](index).call();
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

  // TODO: setup subscriber to listen for new data

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
  const fn = useCallback(async () => {
    console.log("call with", contract, name, options);
    try {
      await contract.methods[name]().send(options);
      console.log(`Executed ${name} successfully`);
    } catch (e) {
      // TODO: show err to user in useful way
      console.log(`Error when sending ${name}: ${e.message}`);
    }
  }, [contract, name, options]);

  return fn;
};

function App() {
  const [proposedValue, setProposedValue] = useState(0);
  const [balances, setBalances] = useState([]);

  const [web3, setWeb3] = useState(null);
  useEffect(() => {
    // TODO: check if metamask installed
    const web3 = new Web3(window.ethereum);
    setWeb3(web3);
  }, []);

  const game = useContract(web3, Game.abi, config.gameContract.address);
  const account = useAccount(web3);

  const proposals = useContractArray(game, "proposals");
  const players = useContractArray(game, "players");
  const rules = useContractArray(game, "rules");

  // useEffect(() => {
  //   if (!players) return;

  //   const getData = async () => {
  //     const balancesResult = await Promise.all(
  //       players.map(async (player) => {
  //         try {
  //           const balance = await game.methods.balances(player).call();
  //           return Promise.resolve({ player, balance });
  //         } catch (e) {
  //           // FIXME: handle err better
  //           console.log(e);
  //         }
  //       })
  //     );
  //     setBalances(balancesResult);
  //   };
  //   getData();
  // }, [players, game]);

  const joinGame = useContractFn(game, "joinGame", {
    from: account,
    value: Web3.utils.toWei("5"),
  });

  const voteOnProposal = useContractFn(game, "voteOnProposal", {
    from: account,
  });

  const createProposal = useCallback(async () => {
    try {
      await game.methods.createProposal(proposedValue).send({ from: account });
      setProposedValue(17);
    } catch (e) {
      console.log(e);
    }
  }, [account, proposedValue, game]);

  // TODO: wait for everything to be ready before loading the page

  return (
    <div className="App">
      <h1>LEDGER</h1>
      <div className="panel join">
        <button onClick={joinGame}>Join game</button>
      </div>
      <div className="container">
        <div className="leftPanel panel">
          <h2>Scores</h2>
          <ol>
            {players.map((player, i) => (
              <li>
                <span>
                  PLAYER {String.fromCharCode(i + "A".charCodeAt(0))} -{" "}
                  {Web3.utils.fromWei(player[1])} LED
                </span>
                <br></br>
                <span>
                  <small>{player[0]}</small>
                </span>
              </li>
            ))}
          </ol>
        </div>

        <div className="rightPanel">
          <div className="rules panel">
            <div>
              <h2>Immutable rules</h2>
              <ul>
                {rules.length}
                {rules
                  .map((rule) => ({ rule, ruleConfig: ruleConfig[rule[0]] }))
                  .map(({ rule, ruleConfig }) => (
                    <li>
                      <strong>{rule.name}</strong> {ruleConfig.description} -{" "}
                      {rule.value}
                      {ruleConfig.unit}
                    </li>
                  ))}
              </ul>
            </div>
            <div>
              <h2>Mutable rules</h2>
              tbd
            </div>
          </div>
          <div className="propose panel">
            <h2>Propose</h2>I propose that <Select></Select> be changed to{" "}
            <input
              onChange={({ target: { value } }) => setProposedValue(value)}
              type="text"
              value={proposedValue}
            ></input>
            <button onClick={createProposal}>Create proposal</button>
          </div>
          <div className="proposals panel">
            <h2>Proposals</h2>
            <ol>
              {!proposals.length &&
                "No rule changes have been proposed so far. Use the 'Create Proposal' form to start the game"}
              {proposals.map((proposal, i) => (
                <li key={i}>
                  {proposal.proposer} proposes {rules[proposal.ruleIndex].name}{" "}
                  should be {proposal.value}. Complete:{" "}
                  {proposal.complete.toString()}. Success:{" "}
                  {proposal.successful.toString()}
                  <button onClick={voteOnProposal(i, true)}>
                    Vote for
                  </button>{" "}
                  <button onClick={voteOnProposal(i, false)}>
                    Vote against
                  </button>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
