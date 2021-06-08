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
import { weiToEth, getNumberWithOrdinal } from "./utils.js";
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
      return fireNotification(
        "You need to install Metamask first and connect to the correct network",
        "warning"
      );
    joinGame();
  };

  const getPlayerName = useCallback(
    (identifier) => {
      if (!players) return "SPECTATOR";
      const index =
        typeof identifier === "number"
          ? identifier
          : players.findIndex((p) => p.playerAddress === identifier);
      if (index < 0) return <span>SPECTATOR</span>;
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
              {event.event} - {getPlayerName(event.returnValues.proposer)}{" "}
              proposed to change {rules[event.returnValues.ruleIndex].name} to{" "}
              {event.returnValues.value}{" "}
              {(event.returnValues.complete && "Complete") || "pending"}{" "}
              {(event.returnValues.successful && "success") || "failed"}
            </>
          );
        case "PlayerUpdate":
          let msg;
          // if (players[data.playerIndex]) {
          msg = (
            <span>
              {getPlayerName(data.playerAddress)} has new balance of{" "}
              {Web3.utils.fromWei(data.balance)}
            </span>
          );
          // } else {
          //   msg = `New player joined: ${getPlayerName(data.playerAddress)} (${
          //     data.playerAddress
          //   })`;
          // }
          return msg;
        case "VoteUpdate":
          console.log("event: ", event);
          return (
            <>
              {event.event} - {getPlayerName(event.returnValues.playerAddress)}{" "}
              joined the game with balance{" "}
              {Web3.utils.fromWei(event.returnValues.balance)}
            </>
          );
        case "RuleUpdate":
          return <>{event.event} - Rule change</>;
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
    const gameEndTimestamp = await getValue("gameEndTime");
    // Create a new JavaScript Date object based on the timestamp
    // multiplied by 1000 so that the argument is in milliseconds, not seconds.
    var date = new Date(gameEndTimestamp * 1000);

    const numericDate = date.getDate();

    const formattedDate = getNumberWithOrdinal(numericDate);

    var formattedMonth = date.toLocaleDateString("en-UK", {
      timeZone: "UTC",
      month: "short",
      year: "numeric",
    });

    var formattedTime = date.toLocaleString([], {
      timeZone: "UTC",
      timeStyle: "short",
    });

    //console.log(formattedTime);
    setGameEndTime(
      <>
        <div>
          {formattedDate} {formattedMonth}
        </div>
        <div>at</div>
        <div>{formattedTime} UTC</div>
      </>
    );
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
      {gameActive && !isPlayer && (
        <div className="game-icons-container">
          <div className="game-icon-panel">
            <div className="background-pattern"></div>
            <button className="game-button" onClick={joinGameHandler}>
              <div>
                Join <br></br> Game
              </div>
            </button>
          </div>
        </div>
      )}
      <div className="header-container">
        <div className="game-details-panel panel">
          <div className="background-pattern"></div>
          <OrnateBorder></OrnateBorder>

          {(!gameActive && (
            <div className="game-ended-container">
              Game Finished
              <div>{gameEndTime}</div>
            </div>
          )) || (
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
          )}
          <div className="game-name">
            {game && (
              <h2>
                Game{" "}
                <span className="game-address">
                  {gameAddress.substr(
                    gameAddress.length - 6,
                    gameAddress.length
                  )}
                </span>
              </h2>
            )}
          </div>
          <div className="game-metadata">
            <div className="game-metadata-item">
              <div>Players</div>
              <div className="join-line"></div>
              <div>{(players && players.length) || 0}</div>
            </div>
            <div className="game-metadata-item">
              <div>Pot</div>
              <div className="join-line"></div>
              <div>
                {weiToEth(gameBalance).toFixed(2) || 0} {cryptocurrency}
              </div>
            </div>
          </div>
        </div>
        <div className="player-details-panel panel">
          <div className="background-pattern"></div>
          <OrnateBorder></OrnateBorder>
          <PlayerIcon address={account}></PlayerIcon>
          <div className="PlayerID">{getPlayerName(account)}</div>
        </div>
      </div>
      <div className="vertical-panels-container">
        <div className="column">
          {!gameActive && (
            <div className="game-grade panel">
              <div className="background-pattern"></div>
              <OrnateBorder></OrnateBorder>
              <GameGrade players={players} proposals={proposals}></GameGrade>
            </div>
          )}
          <div className="rules panel">
            <div className="background-pattern"></div>
            <OrnateBorder></OrnateBorder>
            <div className="subpanel rules">
              {(rules && <Rules rules={rules}></Rules>) || <Loader></Loader>}
            </div>
          </div>
        </div>
        <div className="column">
          {!gameActive && isPlayer && (
            <div className="payout panel">
              <div className="background-pattern"></div>
              <OrnateBorder></OrnateBorder>
              <Payout players={players} playerAddress={account}></Payout>
            </div>
          )}
          <div className="proposals panel">
            <div className="background-pattern"></div>
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
            <div className="background-pattern"></div>
            <OrnateBorder></OrnateBorder>
            {(players && (
              <Scores players={players} getPlayerName={getPlayerName}></Scores>
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
    </>
  );
};
