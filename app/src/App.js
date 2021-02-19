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

const useContractArray = (contract, name, setArray) => {
  useEffect(() => {
    if (!contract) return;
    const getArray = async () => {
      let elements = [];
      let length = 0;
      try {
        length = await contract.methods[
          `get${name.slice(0, 1).toUpperCase()}${name.slice(1)}Length`
        ]().call();
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
  }, [name, contract, setArray]);
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

const parseError = (error) => {
  return error.message.match(
    /VM Exception while processing transaction: revert ([\w ]+)/
  )[1];
};

const useContractFn = (contract, name, options) => {
  const fn = useCallback(
    async (...args) => {
      try {
        const result = await contract.methods[name](...args).send(options);
        fireNotification(`${name} request sent`, "warning");
      } catch (e) {
        // TODO: show err to user in useful way
        console.log(e);
        const msg = parseError(e);
        fireNotification(
          `${msg}<br><br><em>The blockchain takes a few seconds to update, so your screen may have been out of date</em>`,
          "error"
        );
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

const useGameActive = (proposals, rules) => {
  const [gameActive, setGameActive] = useState(true);

  useEffect(() => {
    if (!rules || !proposals || !rules.length) return;
    const maxProposals = rules[3].value; // TODO: find a better way to identify correct rule
    setGameActive(
      proposals.filter((proposal) => proposal.complete).length < maxProposals
    );
  }, [proposals, rules]);

  return gameActive;
};

function App() {
  const [web3, setWeb3] = useState(null);
  const [isPlayer, setIsPlayer] = useState(null);
  const game = useContract(web3, Game.abi, config.gameContract.address);
  const account = useAccount(web3);
  const [events, setEvents] = useState([]);
  const [rules, setRules] = useState(null);
  const [players, setPlayers] = useState(null);
  const [proposals, setProposals] = useState(null);
  useContractArray(game, "proposals", setProposals);
  useContractArray(game, "players", setPlayers);
  useContractArray(game, "rules", setRules);
  const [receivedPastEvents, setReceivedPastEvents] = useState(false);
  const [setupStatus, setSetupStatus] = useState({
    metamask: false,
    network: false,
  });

  useEffect(() => {
    if (!account || !players) return;
    const result = players.some(
      ({ playerAddress }) => account === playerAddress
    );
    setIsPlayer(result);
  }, [account, players]);

  useEffect(() => {
    // TODO: check if metamask installed
    if (!window.ethereum) return;
    const web3 = new Web3(window.ethereum);
    setWeb3(web3);
  }, []);

  // useEffect(() => {
  //   if (!game) return;
  //   const subscription = game.events
  //     .NewPlayer()
  //     .on("data", ({ returnValues: { balance, playerAddress } }) => {
  //       const newPlayer = { playerAddress, balance: balance.toString() };
  //       const newPlayers = (players && [...players, newPlayer]) || [newPlayer];
  //       setPlayers(newPlayers);
  //     });

  //   // TODO: remove event listener
  //   // TODO: error handler
  //   return () =>
  //     subscription.unsubscribe((err) => {
  //       if (err) console.log(err);
  //     }); // FIXME: handle error better
  // }, [game, players]);

  const newProposalCallback = useCallback(
    (data) => {
      console.log("NEW PROPOSAL CREATED EVENT", data);
      const {
        returnValues: { proposer, ruleIndex, value },
      } = data;
      const newProposal = {
        proposer,
        ruleIndex,
        value,
        complete: false,
        successful: false,
      };
      const newProposals = (proposals && [...proposals, newProposal]) || [
        newProposal,
      ];
      setProposals(newProposals);
    },
    [proposals]
  );

  useEffect(() => {
    if (!game) return;
    console.log("SUB CREATED +++");
    const subscription = game.events
      .NewProposal()
      .on("data", newProposalCallback);

    return () => {
      console.log("SUB REMOVED ---");
      subscription.unsubscribe((err) => {
        if (err) console.error(err);
      });
    };
  }, [game, newProposalCallback]);

  // useEffect(() => {
  //   if (!game || !proposals) return;
  //   const subscription = game.events
  //     .NewVote()
  //     .on(
  //       "data",
  //       ({
  //         returnValues: { proposalIndex: proposalIndexString, voter, vote },
  //       }) => {
  //         const proposalIndex = parseInt(proposalIndexString);
  //         const newVote = { voter, vote };
  //         const newProposals = proposals.slice();
  //         newProposals[proposalIndex].votes.push(newVote);
  //         setProposals(newProposals);
  //       }
  //     );

  //   return () =>
  //     subscription.unsubscribe((err) => {
  //       if (err) console.error(err);
  //     });
  // }, [game, proposals]);

  // useEffect(() => {
  //   if (!game || !proposals || !rules || !players) return;
  //   const subscription = game.events
  //     .ProposalComplete()
  //     .on("data", ({ returnValues: { proposalIndex, successful } }) => {
  //       const newProposals = proposals.slice();
  //       newProposals[proposalIndex].complete = true;
  //       newProposals[proposalIndex].successful = successful;
  //       setProposals(newProposals);
  //       if (successful) {
  //         const newPlayers = players.slice();
  //         const winningPlayer = players.findIndex(
  //           ({ playerAddress }) =>
  //             proposals[proposalIndex].proposer === playerAddress
  //         );
  //         const newBalance =
  //           BigInt(newPlayers[winningPlayer].balance) +
  //           BigInt(rules[proposals[proposalIndex].ruleIndex].value);
  //         newPlayers[winningPlayer].balance = newBalance.toString();
  //         setPlayers(newPlayers);
  //       }
  //       // rule applied after reward is granted using old reward value
  //       const newRules = rules.slice();
  //       newRules[proposals[proposalIndex].ruleIndex].value =
  //         proposals[proposalIndex].value;
  //     });

  //   return () =>
  //     subscription.unsubscribe((err) => {
  //       if (err) console.error(err);
  //     });
  // }, [game, rules, proposals, players]);

  // FIXME: put somewhere else not in fn
  const mapEvent = (event) => {
    switch (event.event) {
      case "NewProposal":
        return (
          <>
            <strong>{event.event}</strong> -{" "}
            {getPlayerName(event.returnValues.proposer)} proposed to change{" "}
            {rules[event.returnValues.ruleIndex].name} to{" "}
            {event.returnValues.value}
          </>
        );
      case "ProposalComplete":
        return (
          <>
            <strong>{event.event}</strong> - Proposal{" "}
            {event.returnValues.proposalIndex} to change{" "}
            {event.returnValues.ruleIndex}
            {rules[proposals[event.returnValues.proposalIndex].ruleIndex].name}
            {(event.returnValues.successful && " was successful") || " failed"}
          </>
        );
      case "NewPlayer":
        return (
          <>
            <strong>{event.event}</strong> -{" "}
            <strong>{getPlayerName(event.returnValues.playerAddress)}</strong>{" "}
            joined the game with balance{" "}
            {Web3.utils.fromWei(event.returnValues.balance)}
          </>
        );
      default:
        return "UNKNOWN EVENT";
    }

    // return (
    //   <>
    //     {/* {JSON.stringify(event)} */}
    //     <strong>{event.event}</strong> - {JSON.stringify(event.returnValues)}
    //   </>
    // );
  };

  // useEffect(async () => {
  //   if (receivedPastEvents) return;
  //   if (!game || !rules || !players || !proposals) return;
  //   setReceivedPastEvents(true);
  //   const pastEvents = await game.getPastEvents("allEvents", {
  //     fromBlock: "earliest",
  //   });
  //   console.log({ pastEvents });
  //   setEvents([...pastEvents.reverse().map(mapEvent), ...events]);
  // }, [game, rules, players, proposals]);

  // useEffect(() => {
  //   if (!game || !rules || !players || !proposals) return;
  //   const subscription = game.events.allEvents().on("data", (data) => {
  //     console.log({ data });
  //     setEvents([...events, mapEvent(data)]);
  //   });

  //   return () =>
  //     subscription.unsubscribe((err) => {
  //       if (err) console.error(err);
  //     });
  // }, [game, players, proposals, rules]);

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

  const gameActive = useGameActive(proposals, rules);

  return (
    <div className="App">
      <h1>LEDGER</h1>
      <div className="panel join">
        <h2>
          blah blah blah what the game is, how you play it. how to install
          metamask guide
        </h2>
        {(!gameActive && "This game has ended") ||
          (isPlayer && "You are playing this game") || (
            <button onClick={joinGameHandler}>Join game</button>
          )}
      </div>
      <div className="container">
        <div className="leftPanel">
          <div className="panel">
            {(players && (
              <Scores players={players} getPlayerName={getPlayerName}></Scores>
            )) || <Loader></Loader>}
          </div>
          <div className="panel">
            <ul>
              {events.map((event) => (
                <li>{event}</li>
              ))}
            </ul>
          </div>
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
                isPlayer={isPlayer}
                gameActive={gameActive}
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
