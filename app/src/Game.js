import "./App.css";
import { useContract } from "./useContract";
import { useContractFn } from "./useContractFn";
import { useState, useEffect, useCallback } from "react";
import { useGameActive } from "./useGameActive";
import { fireNotification } from "./fireNotification";
import useInterval from "./useInterval";
import { Scores } from "./Scores";
import { Rules } from "./Rules";
import { Proposals } from "./Proposals";
import { Propose } from "./Propose";
import { Loader } from "./Loader";
import { default as GameContract } from "./contracts/Game.json";
import Web3 from "web3";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  useParams,
} from "react-router-dom";

export const Game = ({ web3, account }) => {
  const { gameAddress } = useParams();
  console.log("params", useParams());
  console.log(gameAddress);
  const game = useContract(web3, GameContract.abi, gameAddress);
  const [events, setEvents] = useState([]);
  const [rules, setRules] = useState(null);
  const [players, setPlayers] = useState(null);
  const [proposals, setProposals] = useState(null);
  const [receivedPastEvents, setReceivedPastEvents] = useState(false);
  const [isPlayer, setIsPlayer] = useState(null);

  useEffect(() => {
    if (!account || !players) return;
    const result = players.some(
      ({ playerAddress }) => account === playerAddress
    );
    setIsPlayer(result);
  }, [account, players]);

  const joinGame = useContractFn(game, "joinGame", {
    from: account,
    value: Web3.utils.toWei("5"),
  });

  const joinGameHandler = () => {
    if (!account)
      return fireNotification("You need to install Metamask first!", "warning");
    joinGame();
  };

  const getArray = useCallback(
    async (name) => {
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
        fireNotification(`Failed to get ${name}`);
      }
      try {
        for (let index = 0; index < length; index++) {
          const element = await game.methods[name](index).call();
          elements = [...elements, element];
        }
        return elements;
      } catch (e) {
        fireNotification(`Failed to get ${name}`);
        console.error(`Failed to get ${name}: ${e.message}`);
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
      return updatedProposals;
    },
    [game]
  );

  const fetchRules = useCallback(async () => {
    const rules = await getArray("rules", setRules);
    setRules(rules);
  }, [getArray]);
  useInterval(fetchRules, 10000);

  const fetchProposals = useCallback(async () => {
    const proposals = await getArray("proposals", setProposals);
    if (proposals) {
      const proposalsWithVotes = await fetchVotes(proposals);
      setProposals(proposalsWithVotes);
    }
  }, [getArray, fetchVotes]);
  useInterval(fetchProposals, 10000);

  const fetchPlayers = useCallback(async () => {
    const players = await getArray("players", setPlayers);
    setPlayers(players);
  }, [getArray]);
  useInterval(fetchPlayers, 10000);

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

  const eventNotification = useCallback(
    (event) => {
      const data = event.returnValues;
      switch (event.event) {
        case "ProposalUpdate":
          return updateProposal(data);
        case "PlayerUpdate":
          return updatePlayer(data);
        case "VoteUpdate":
          return updateVote(data);
        case "RuleUpdate":
          return updateRule(data);
        default:
          return "UNKNOWN EVENT";
      }
    },
    [updateRule, updateProposal, updatePlayer, updateVote]
  );

  // FIXME: put somewhere else not in fn
  const mapEvent = useCallback(
    (event) => {
      switch (event.event) {
        case "ProposalUpdate":
          return (
            <>
              <strong>{event.event}</strong> -{" "}
              {getPlayerName(event.returnValues.proposer)} proposed to change{" "}
              {rules[event.returnValues.ruleIndex].name} to{" "}
              {event.returnValues.value}
            </>
          );
        case "PlayerUpdate":
          return (
            <>
              <strong>{event.event}</strong> -{" "}
              <strong>{getPlayerName(event.returnValues.playerAddress)}</strong>{" "}
              joined the game with balance{" "}
              {Web3.utils.fromWei(event.returnValues.balance)}
            </>
          );
        case "VoteUpdate":
          return (
            <>
              <strong>{event.event}</strong> -{" "}
              <strong>{getPlayerName(event.returnValues.playerAddress)}</strong>{" "}
              joined the game with balance{" "}
              {Web3.utils.fromWei(event.returnValues.balance)}
            </>
          );
        case "RuleUpdate":
          return (
            <>
              <strong>{event.event}</strong> - Rule change
            </>
          );
        default:
          return "UNKNOWN EVENT";
      }
    },
    [rules, getPlayerName]
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
      eventNotification(data);
      setEvents([...events, mapEvent(data)]);
    });

    return () =>
      subscription.unsubscribe((err) => {
        if (err) console.error(err);
      });
  }, [game, players, proposals, rules, events, mapEvent, eventNotification]);

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
    <>
      {/* {(!gameActive && "This game has ended") ||
        (isPlayer &&
          `You are playing
      this game`) || (
          <div>
            <button onClick={joinGameHandler}>Join game</button>
          </div>
        )} */}

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
    </>
  );
};
