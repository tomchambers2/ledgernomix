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
import useInterval from "./useInterval";
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
  const err = error.message.match(
    /VM Exception while processing transaction: revert ([\w ]+)/
  );
  if (err) return err[1];
  return "You cancelled the transaction";
};

const useContractFn = (contract, name, options) => {
  const fn = useCallback(
    async (...args) => {
      try {
        const result = await contract.methods[name](...args).send(options);
        fireNotification(`${name} request sent`, "warning");
        return result;
      } catch (e) {
        // TODO: show err to user in useful way
        const msg = parseError(e);
        fireNotification(
          `${msg}<br><br><em>The blockchain takes a few seconds to update, so your screen may be out of date</em>`,
          "error"
        );
        return false;
      }
    },
    [contract, name, options]
  );

  return fn;
};

const fireNotification = function (text, type) {
  new Noty({
    text,
    type: type || "info",
    timeout: 10000,
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
  const [receivedPastEvents, setReceivedPastEvents] = useState(false);
  const [setupStatus, setSetupStatus] = useState({
    metamask: false,
    network: false,
  });

  const getArray = useCallback(
    async (name, setArray) => {
      if (!game) {
        return;
      }
      let elements = [];
      let length = 0;
      try {
        length = await game.methods[
          `get${name.slice(0, 1).toUpperCase()}${name.slice(1)}Length`
        ]().call();
      } catch (e) {
        fireNotification(`Failed to get ${name}s`);
      }
      try {
        for (let index = 0; index < length; index++) {
          const element = await game.methods[name](index).call();
          elements = [...elements, element];
        }
        setArray(elements);
        return elements;
      } catch (e) {
        fireNotification(`Failed to get ${name}s`);
        console.log(`Failed to get ${name}: ${e.message}`);
      }
    },
    [game]
  );

  const fetchVotes = useCallback(
    async (proposals) => {
      const updatedProposals = await Promise.all(
        proposals.slice().map(async (proposal, i) => {
          const votesLength = await game.methods.getVotesLength(i).call();
          console.log(votesLength);
          proposal.votes = [];
          for (let voteIndex = 0; voteIndex < votesLength; voteIndex++) {
            const { playerAddress, vote } = game.methods
              .getVote(i, voteIndex)
              .call();
            proposal.votes.push({ playerAddress, vote });
          }
          return proposal;
        })
      );
      console.log(updatedProposals);
      setProposals(updatedProposals);
    },
    [game]
  );

  const fetchRules = useCallback(() => {
    getArray("rules", setRules);
  }, [getArray]);
  useInterval(fetchRules, 10000);

  const fetchProposals = useCallback(async () => {
    const proposals = await getArray("proposals", setProposals);
    if (proposals) fetchVotes(proposals);
  }, [getArray, fetchVotes]);
  useInterval(fetchProposals, 10000);

  const fetchPlayers = useCallback(() => {
    getArray("players", setPlayers);
  }, [getArray]);
  useInterval(fetchPlayers, 10000);

  useEffect(() => {
    if (!account || !players) return;
    const result = players.some(
      ({ playerAddress }) => account === playerAddress
    );
    setIsPlayer(result);
  }, [account, players]);

  useEffect(() => {
    const fn = async () => {
      // TODO: check if metamask installed
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

  const getPlayerName = useCallback(
    (address) => {
      const index = players.findIndex((p) => p.playerAddress === address);
      return `PLAYER ${String.fromCharCode(index + "A".charCodeAt(0))}`;
    },
    [players]
  );

  const updateVote = useCallback(
    (vote) => {
      const newProposals = proposals.slice();
      newProposals[vote.proposalIndex].votes[vote.voteIndex] = vote;
      setProposals(newProposals);

      fireNotification(
        `${getPlayerName(vote.playerAddress)} voted ${
          vote ? "yes" : "no"
        } on proposal ${vote.proposalIndex}`,
        "success"
      );
    },
    [proposals, getPlayerName]
  );

  const updateProposal = useCallback(
    (proposal) => {
      fireNotification(
        `New proposal created by ${getPlayerName(
          proposals.proposer
        )}: change <strong>${
          rules[proposal.ruleIndex].name
        }</strong> to <strong>${proposal.value}</strong>`,
        "success"
      );
      const newProposals = proposals.slice();
      newProposals[proposal.proposalIndex] = proposal;
      setProposals(newProposals);
    },
    [proposals, rules, getPlayerName]
  );

  const updatePlayer = useCallback(
    (player) => {
      const newPlayers = players.slice();
      newPlayers[player.playerIndex] = {
        playerAddress: player.playerAddress,
        balance: player.balance.toString(),
      };
      setPlayers(newPlayers);

      fireNotification(
        `New player joined: ${getPlayerName(player.playerAddress)} (${
          player.playerAddress
        })`,
        "success"
      );
    },
    [players, getPlayerName]
  );

  const updateRule = useCallback(
    (rule) => {
      const newRules = rules.slice();
      newRules[rule.ruleIndex].value = rule.value;
      setRules(newRules);

      fireNotification(
        `Rule updated: ${rules[rule.ruleIndex].name} is now ${rule.value}`,
        "success"
      );
    },
    [rules]
  );

  // FIXME: put somewhere else not in fn
  const mapEvent = useCallback(
    (event) => {
      const data = event.returnValues;
      switch (event.event) {
        case "ProposalUpdate":
          updateProposal(data);
          console.log("prop", data);
          return (
            <>
              <strong>{event.event}</strong> -{" "}
              {getPlayerName(event.returnValues.proposer)} proposed to change{" "}
              {rules[event.returnValues.ruleIndex].name} to{" "}
              {event.returnValues.value}
            </>
          );
        case "PlayerUpdate":
          console.log("PLAYER EVENT", event);
          updatePlayer(data);
          return (
            <>
              <strong>{event.event}</strong> -{" "}
              <strong>{getPlayerName(event.returnValues.playerAddress)}</strong>{" "}
              joined the game with balance{" "}
              {Web3.utils.fromWei(event.returnValues.balance)}
            </>
          );
        case "VoteUpdate":
          updateVote(data);
          return (
            <>
              <strong>{event.event}</strong> -{" "}
              <strong>{getPlayerName(event.returnValues.playerAddress)}</strong>{" "}
              joined the game with balance{" "}
              {Web3.utils.fromWei(event.returnValues.balance)}
            </>
          );
        case "RuleUpdate":
          updateRule(data);
          return (
            <>
              <strong>{event.event}</strong> - Rule change
            </>
          );
        default:
          return "UNKNOWN EVENT";
      }
    },
    [rules, updateRule, updateProposal, updatePlayer, updateVote, getPlayerName]
  );

  useEffect(() => {
    const fn = async () => {
      if (receivedPastEvents) return;
      if (!game || !rules || !players || !proposals) return;
      setReceivedPastEvents(true);
      const pastEvents = await game.getPastEvents("allEvents", {
        fromBlock: "earliest",
      });
      setEvents([...pastEvents.reverse().map(mapEvent), ...events]);
    };
    fn();
  }, [game, rules, players, proposals, events, mapEvent, receivedPastEvents]);

  useEffect(() => {
    if (!game || !rules || !players || !proposals) return;
    const subscription = game.events.allEvents().on("data", (data) => {
      setEvents([...events, mapEvent(data)]);
    });

    return () =>
      subscription.unsubscribe((err) => {
        if (err) console.error(err);
      });
  }, [game, players, proposals, rules, events, mapEvent]);

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
  const voteOnProposalHandler = async (proposalIndex, vote) => {
    const result = await voteOnProposal(proposalIndex, vote);
    if (result) {
      const updatedProposals = proposals.slice();
      updatedProposals[proposalIndex].pending = true;
      setProposals(updatedProposals);
    }
  };

  const createProposal = useContractFn(game, "createProposal", {
    from: account,
  });

  const gameActive = useGameActive(proposals, rules);

  return (
    <div className="App">
      <div className="panel intro">
        <h1>Ledgernomix</h1>
        <h2>The game where you make the rules</h2>
        <div className="buttons">
          <div>About</div>
          <div>GAME NAME</div>
          <div>How to play</div>
        </div>
        {!setupStatus.metamask && (
          <div>
            <a
              className="button"
              target="_blank"
              href="https://metamask.io/download.html"
              rel="noreferrer"
            >
              Install Metamask browser extension
            </a>
          </div>
        )}
        {(!setupStatus.network && "Wrong network") ||
          (!gameActive && "This game has ended") ||
          (isPlayer && "You are playing this game") || (
            <div>
              <button
                onClick={joinGameHandler}
                disabled={!setupStatus.metamask || !setupStatus.network}
              >
                Join game
              </button>
            </div>
          )}
      </div>
      <div className="container">
        <div className="rules panel">
          <div className="subpanel rules">
            {(rules && <Rules rules={rules}></Rules>) || <Loader></Loader>}
          </div>
        </div>

        <div className="proposals panel">
          {(rules && proposals && (
            <Proposals
              proposals={proposals}
              rules={rules}
              getPlayerName={getPlayerName}
              voteOnProposal={voteOnProposalHandler}
              gameActive={gameActive}
            ></Proposals>
          )) || <Loader></Loader>}
        </div>

        <div className="panel scores">
          {(players && (
            <Scores players={players} getPlayerName={getPlayerName}></Scores>
          )) || <Loader></Loader>}
          <h2>Event log</h2>
          <ul>
            {events.map((event) => (
              <li>{event}</li>
            ))}
          </ul>
        </div>
      </div>
      <div>
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
      </div>
    </div>
  );
}

export default App;
