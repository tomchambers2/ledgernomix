import { useState, useEffect, useCallback } from "react";
import Game from "./contracts/Game.json";
const Web3 = require("web3");

const useContractData = (contract, name) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!contract) return;
    console.log(contract);
    async function fetchData() {
      try {
        console.log("get name", name);
        // const result = contract.methods[name]().call();
        const result = await contract.methods.getNumPlayers().call();
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
      try {
        let elements = [];
        const length = await contract.methods[
          `get${name.slice(0, 1).toUpperCase()}${name.slice(1)}Length`
        ]().call();
        for (let index = 0; index < length; index++) {
          const element = await contract.methods.proposals(index).call();
          elements = [...elements, element];
        }
        setArray(elements);
      } catch (e) {
        console.log("num players error", e);
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
  const [proposedRewardValue, setProposedRewardValue] = useState(0);

  const [web3, setWeb3] = useState(null);
  useEffect(() => {
    // TODO: check if metamask installed
    const web3 = new Web3(window.ethereum);
    setWeb3(web3);
  }, []);

  const game = useContract(
    web3,
    Game.abi,
    "0x8A791620dd6260079BF849Dc5567aDC3F2FdC318"
  );
  const account = useAccount(web3);

  const numPlayers = useContractData(game, "numPlayers");
  const rewardValue = useContractData(game, "rewardValue");

  const proposals = useContractArray(game, "proposals");

  const joinGame = useContractFn(game, "joinGame", {
    from: account,
    value: 10000,
  });

  const createProposal = useCallback(async () => {
    try {
      await game.methods
        .createProposal(proposedRewardValue)
        .send({ from: account });
      setProposedRewardValue(17);
    } catch (e) {
      console.log(e);
    }
  }, [account, proposedRewardValue, game]);

  const voteOnProposal = (proposalIndex, vote) => async () => {
    try {
      console.log("ev", game);
      await game.methods
        .voteOnProposal(proposalIndex, vote)
        .send({ from: account });
    } catch (e) {
      // TODO: handle error properly
      console.error(e);
    }
  };

  const quorum = useContractData(game, "quorum");

  // TODO: wait for everything to be ready before loading the page

  return (
    <div className="App">
      <h1>Quorum: {quorum}</h1>
      <h1>Num players: {numPlayers}</h1>
      <h1>Current reward value: {rewardValue}</h1>
      <button onClick={joinGame}>Join game</button>
      <div>
        New reward: {proposedRewardValue}
        <input
          type="text"
          value={proposedRewardValue}
          onChange={({ target: { value } }) => setProposedRewardValue(value)}
        />
        <button onClick={createProposal}>Create proposal</button>
      </div>
      <div>
        <h1>Proposals</h1>
        {proposals.length}
        {JSON.stringify(proposals)}
        <ol>
          {proposals.map((proposal, i) => (
            <li key={proposal.quantity}>
              {proposal.proposer} proposes successful proposal reward should be{" "}
              {proposal.quantity}. Complete: {proposal.complete.toString()}.
              Success: {proposal.successful.toString()}
              <button onClick={voteOnProposal(i, true)}>Vote for</button>{" "}
              <button onClick={voteOnProposal(i, false)}>Vote against</button>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

export default App;
