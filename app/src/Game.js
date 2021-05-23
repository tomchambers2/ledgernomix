import "./App.css";
import "./Game.css";
import "./eskapade-fraktur-wakamaifondue.css";
import { useContract } from "./useContract";
import { useContractFn } from "./useContractFn";
import { useState, useEffect, useCallback } from "react";
import { useGameActive } from "./useGameActive";
import { fireNotification } from "./fireNotification";
import { Scores } from "./Scores";
import { Rules } from "./Rules";
import { Proposals } from "./Proposals";
import { Loader } from "./Loader";
import { default as GameContract } from "./contracts/Game.json";
import Web3 from "web3";
import { useParams } from "react-router-dom";
import { useContractBalance } from "./useContractBalance";
import { weiToEth } from "./utils.js";
import { PlayerIcon } from "./PlayerIcon";
import { Clock } from "./Clock";
import { ProposalCounter } from "./ProposalCounter";
import { OrnateBorder } from "./OrnateBorder";
import { GameGrade } from "./GameGrade";
import { Payout } from "./Payout";
import { gameConfig } from "./gameConfig";
const { cryptocurrency } = gameConfig;
const FETCH_INTERVAL = 10 * 1000;

export const Game = ({ web3, account }) => {
  const { gameAddress } = useParams();
  const game = useContract(web3, GameContract.abi, gameAddress);
  const gameBalance = useContractBalance(web3, gameAddress);
  const [events, setEvents] = useState([]);
  const [rules, setRules] = useState(null);
  const [players, setPlayers] = useState(null);
  const [proposals, setProposals] = useState(null);
  const [isPlayer, setIsPlayer] = useState(null);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  const [gameEndTime, setGameEndTime] = useState(0);

  useEffect(() => {
    if (!account || !players) return;
    const result = players.some(
      ({ playerAddress }) => account === playerAddress
    );
    setIsPlayer(result);
  }, [account, players]);

  const getRuleValue = useCallback(
    (name) =>
      rules &&
      rules.find(({ name: ruleName }) => name === ruleName).value.toString(),
    [rules]
  );

  const joinGame = useContractFn(game, "joinGame", {
    from: account,
    value: rules && Web3.utils.toWei(getRuleValue("Entry fee")),
  });

  const joinGameHandler = () => {
    if (!account)
      return fireNotification("You need to install Metamask first!", "warning");
    joinGame();
  };

  const getPlayerName = useCallback(
    (identifier) => {
      if (!identifier || !players) return "Waiting For Player";
      const index =
        typeof identifier === "number"
          ? identifier
          : players.findIndex((p) => p.playerAddress === identifier);
      return (
        <>
          PLAYER{" "}
          <span className="playerLetter">
            {String.fromCharCode(index + "A".charCodeAt(0))}
          </span>
        </>
      );
    },
    [players]
  );

  const getPlayerIndex = useCallback(() => {
    if (!account || !players) return "Waiting For Player";
    return players.findIndex((p) => p.playerAddress === account);
  }, [players, account]);

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

  const getValue = useCallback(
    async (name) => {
      if (!game) return;
      try {
        const value = await game.methods[name].call().call();
        return value;
      } catch (e) {
        fireNotification(`Failed to get ${name}`);
        console.error(`Failed to get ${name}: ${e.message}`);
      }
    },
    [game]
  );

  const mapEvent = useCallback(
    (event) => {
      const data = event.returnValues;
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
          let msg;
          if (players[data.playerIndex]) {
            msg = (
              <span>
                {getPlayerName(data.playerAddress)} has new balance of{" "}
                {Web3.utils.fromWei(data.balance)}
              </span>
            );
          } else {
            msg = `New player joined: ${getPlayerName(data.playerAddress)} (${
              data.playerAddress
            })`;
          }
          return msg;
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
    [rules, getPlayerName, players]
  );

  const fetchVotes = useCallback(
    async (proposals) => {
      const updatedProposals = await Promise.all(
        proposals.slice().map(async (proposal, i) => {
          const votesLength = await game.methods.getVotesLength(i).call();
          proposal.votes = [];
          for (let voteIndex = 0; voteIndex < votesLength; voteIndex++) {
            const { playerAddress, vote } = await game.methods
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

  const fetchProposals = useCallback(async () => {
    const proposals = await getArray("proposals", setProposals);
    if (proposals) {
      const proposalsWithVotes = await fetchVotes(proposals);
      setProposals(proposalsWithVotes);
    }
  }, [getArray, fetchVotes]);

  const fetchPlayers = useCallback(async () => {
    const players = await getArray("players", setPlayers);
    setPlayers(players);
  }, [getArray]);

  const fetchEvents = useCallback(async () => {
    if (!game || !players || !proposals || !rules) return;
    const pastEvents = await game.getPastEvents("allEvents", {
      fromBlock: "earliest",
    });
    setEvents([...pastEvents.map(mapEvent)]);
  }, [game, mapEvent, players, proposals, rules]);

  const fetchGameEndTime = useCallback(async () => {
    const gameEndTime = await getValue("gameEndTime");
    setGameEndTime(gameEndTime);
  }, [getValue]);

  const fetchData = useCallback(async () => {
    await fetchRules();
    await fetchProposals();
    await fetchPlayers();
    await fetchEvents();
    await fetchGameEndTime();
  }, [fetchRules, fetchProposals, fetchPlayers, fetchEvents, fetchGameEndTime]);

  useEffect(() => {
    if (!game) return;
    if (initialDataLoaded) return;
    fetchData();
    setInitialDataLoaded(true);
  }, [fetchData, initialDataLoaded, game]);

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

  const gameActive = useGameActive(proposals, getRuleValue("Max proposals"));

  return (
    <>
      <div className="intro">
        <div>
          <h1>
            Ledgernomi<span style={{ fontVariant: "small-caps" }}>x</span>
          </h1>
        </div>

        <div className="links">
          <h3>How to play</h3>
          <h3>About</h3>
        </div>
      </div>

      <div className="all-panels-container">
        <div className="background-pattern"></div>
        <div className="header-container">
          <div className="game-details-panel panel">
            <OrnateBorder></OrnateBorder>
            <div className="game-timers-container">
              <Clock
                blockInterval={FETCH_INTERVAL}
                timeoutCallback={fetchData}
              />
              <ProposalCounter
                completeProposals={proposals}
                maxProposals={getRuleValue("Max proposals")}
              />
            </div>
            <div className="game-name">
              {(!gameActive && "This game has ended") ||
                (isPlayer && (
                  <h2>
                    Game{" "}
                    <span className="game-address">
                      {gameAddress.substr(
                        gameAddress.length - 5,
                        gameAddress.length
                      )}
                    </span>
                  </h2>
                ))}
              {gameActive && !isPlayer && (
                <button onClick={joinGameHandler}>Join game</button>
              )}
            </div>
            <div className="game-metadata">
              Players: {(players && players.length) || 0}
              <br></br>
              Pot: {weiToEth(gameBalance) || 0} {cryptocurrency}
            </div>
          </div>
          <div className="player-details-panel panel">
            <OrnateBorder></OrnateBorder>
            <PlayerIcon address={account}></PlayerIcon>
            <div className="PlayerID">{getPlayerName(account)}</div>
          </div>
        </div>
        <div className="vertical-panels-container">
          <div className="column">
            <div className="game-grade panel">
              <OrnateBorder></OrnateBorder>
              <GameGrade players={players} proposals={proposals}></GameGrade>
            </div>
            <div className="rules panel">
              <OrnateBorder></OrnateBorder>
              <div className="subpanel rules">
                {(rules && <Rules rules={rules}></Rules>) || <Loader></Loader>}
              </div>
            </div>
          </div>
          <div className="column">
            <div className="payout panel">
              <OrnateBorder></OrnateBorder>
              <Payout players={players} playerAddress={account}></Payout>
            </div>
            <div className="proposals panel">
              <OrnateBorder></OrnateBorder>
              {(rules && proposals && (
                <Proposals
                  proposals={proposals}
                  rules={rules}
                  getPlayerName={getPlayerName}
                  voteOnProposal={voteOnProposalHandler}
                  isPlayer={isPlayer}
                  gameActive={gameActive}
                  playerAddress={account}
                  web3={web3}
                  account={account}
                  players={players}
                  playerIndex={getPlayerIndex}
                ></Proposals>
              )) || <Loader></Loader>}
            </div>
          </div>
          <div className="column">
            <div className="ledger panel">
              <OrnateBorder></OrnateBorder>
              {(players && (
                <Scores
                  players={players}
                  getPlayerName={getPlayerName}
                ></Scores>
              )) || <Loader></Loader>}

              {events
                .slice()
                .reverse()
                .map((event) => (
                  <div className="item">{event}</div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
