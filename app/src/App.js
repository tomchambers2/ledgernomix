import { useState, useEffect, useCallback } from "react";
import Game from "./contracts/Game.json";
import { config } from "./config";
import "./App.css";
import { ruleConfig } from "./ruleConfig";
import Select from "react-select";
import { Scores } from "./Scores";
import { Rules } from "./Rules";
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

function App() {
  const [proposedRuleOption, setProposedRuleOption] = useState(null);
  const [proposedValue, setProposedValue] = useState(0);
  const [proposedValueValid, setProposedValueValid] = useState(true);

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

  const joinGame = useContractFn(game, "joinGame", {
    from: account,
    value: Web3.utils.toWei("5"),
  });

  const voteOnProposal = useContractFn(game, "voteOnProposal", {
    from: account,
  });
  //const createProposal = useContractFn(game, "createProposal");

  const getPlayerName = (address) => {
    const index = players.findIndex((p) => p.playerAddress === address);
    return `PLAYER ${String.fromCharCode(index + "A".charCodeAt(0))}`;
  };

  const createProposal = useCallback(async () => {
    try {
      await game.methods
        .createProposal(proposedRuleOption.value, proposedValue)
        .send({ from: account });
      setProposedValue(0);
      setProposedRuleOption(null);
    } catch (e) {
      // FIXME: HANDLE ERROR BETTER: NOTY?
      console.log(e);
    }
  }, [account, proposedValue, proposedRuleOption, game]);

  const ruleOptions = rules.map((rule, i) => ({ value: i, label: rule.name }));

  useEffect(() => {
    if (!proposedRuleOption) return setProposedValueValid(true);
    console.log(rules, rules[proposedRuleOption.value]);
    if (
      parseInt(proposedValue) >=
        parseInt(rules[proposedRuleOption.value].lowerBound) &&
      parseInt(proposedValue) <=
        parseInt(rules[proposedRuleOption.value].upperBound)
    ) {
      console.log(proposedValue);
      return setProposedValueValid(true);
    }
    return setProposedValueValid(false);
  }, [rules, proposedValue, proposedRuleOption]);

  // TODO: wait for everything to be ready before loading the page

  return (
    <div className="App">
      <h1>LEDGER</h1>
      <div className="panel join">
        <button onClick={joinGame}>Join game</button>
      </div>
      <div className="container">
        <div className="leftPanel panel">
          <Scores players={players} getPlayerName={getPlayerName}></Scores>
        </div>

        <div className="rightPanel">
          <div className="rules panel">
            <div className="subpanel">
              <Rules rules={rules}></Rules>
            </div>
          </div>
          <div className="propose panel">
            <h2>Propose</h2>I propose that{" "}
            <Select
              options={ruleOptions}
              value={proposedRuleOption}
              onChange={(option) => setProposedRuleOption(option)}
            ></Select>{" "}
            be changed to{" "}
            <input
              onChange={({ target: { value } }) => setProposedValue(value)}
              type="text"
              value={proposedValue}
            ></input>
            <button
              onClick={createProposal}
              disabled={!proposedValueValid || !proposedRuleOption}
            >
              Create proposal
            </button>
            {!proposedValueValid &&
              `${rules[proposedRuleOption.value].name} must be between ${
                rules[proposedRuleOption.value].lowerBound
              } and ${rules[proposedRuleOption.value].upperBound}`}
          </div>
          <div className="proposals panel">
            <h2>Proposals</h2>
            {(!rules.length && "LOADING...") || (
              <ol>
                {!proposals.length &&
                  "No rule changes have been proposed so far. Use the 'Create Proposal' form to start the game"}
                {proposals.map((proposal, i) => (
                  <li key={i}>
                    {getPlayerName(proposal.proposer)} proposes{" "}
                    {rules[proposal.ruleIndex].name} should be {proposal.value}.
                    Complete: {proposal.complete.toString()}. Success:{" "}
                    {proposal.successful.toString()}
                    <button onClick={() => voteOnProposal(i, true)}>
                      Vote for
                    </button>{" "}
                    <button onClick={() => voteOnProposal(i, false)}>
                      Vote against
                    </button>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
