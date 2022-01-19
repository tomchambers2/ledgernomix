import "./App.css";
import "./Game.css";
import "./eskapade-fraktur-wakamaifondue.css";
import { useContract } from "./useContract";
import { useContractFn } from "./useContractFn";
import { useState, useEffect, useCallback, useContext } from "react";
import { useGameActive } from "./useGameActive";
import { fireNotification } from "./fireNotification";
import { Scores } from "./Scores";
import { Rules } from "./Rules";
import { Proposals } from "./Proposals";
import { Loader } from "./Loader";
import { default as GameContract } from "./contracts/Game.json";
import { useParams } from "react-router-dom";
import { weiToEth, getNumberWithOrdinal, formatCurrency } from "./utils.js";
import { PlayerIcon } from "./PlayerIcon";
import { Clock } from "./Clock";
import { ProposalCounter } from "./ProposalCounter";
import { OrnateBorder } from "./OrnateBorder";
import { GameGrade } from "./GameGrade";
import { Payout } from "./Payout";
import { gameConfig } from "./gameConfig";
import ReactTooltip from "react-tooltip";
import { Web3Context } from "./web3context";
import { useAccount } from "./useAccount";
import { Setup } from "./Setup";

const { cryptocurrency } = gameConfig;
const FETCH_INTERVAL = 5 * 1000;

export const Game = () => {
  const { gameAddress } = useParams();
  const { web3, setupStatus } = useContext(Web3Context);
  const account = useAccount(web3);
  const game = useContract(web3, GameContract.abi, gameAddress);
  const [events, setEvents] = useState([]);
  const [rules, setRules] = useState(null);
  const [players, setPlayers] = useState(null);
  const [pendingPlayers, setPendingPlayers] = useState(null);
  const [proposals, setProposals] = useState(null);
  const [isPlayer, setIsPlayer] = useState(null);
  const [isPendingPlayer, setIsPendingPlayer] = useState(null);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  const [gameEndTime, setGameEndTime] = useState(0);

  useEffect(() => {
    if (!account || !players) return;
    const result = players.some(
      ({ playerAddress }) => account === playerAddress
    );
    setIsPlayer(result);
  }, [account, players]);

  useEffect(() => {
    if (!account || !pendingPlayers) return;
    const result = pendingPlayers.some(
      ({ playerAddress }) => account === playerAddress
    );
    setIsPendingPlayer(result);
  }, [account, pendingPlayers]);

  const getRuleValue = useCallback(
    (name) => {
      if (!rules) return;
      const rule = rules.find(({ name: ruleName }) => name === ruleName);
      if (rule) return rule.value.toString();
    },
    [rules]
  );

  const joinGame = useContractFn(game, "joinGame", {
    from: account,
    value: rules && getRuleValue("Entry fee"),
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
      if (index < 0) {
        if (isPendingPlayer)
          return (
            <div>
              <div>
                {account.substring(0, 5)}...
                {account.substring(38, 42)}
              </div>
              WAITING
            </div>
          );
        else return <span>SPECTATOR</span>;
      }
      return (
        <>
          PLAYER{" "}
          <span className="playerLetter">
            {String.fromCharCode(index + "A".charCodeAt(0))}
          </span>
        </>
      );
    },
    [players, isPendingPlayer, account]
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
        case "LedgerEntry":
          return (
            <>
              {getPlayerName(data.playerAddress)}{" "}
              {`was ${data.isDeduction ? "deducted" : "awarded"} `}
              {formatCurrency(weiToEth(data.amount))}
              {` ${gameConfig.gameCurrency} for
              ${data.successfulProposal ? "successful proposal on" : ""} ${
                rules[data.ruleIndex].name
              }`}
            </>
          );
        case "CreatePlayer":
          return (
            <>
              {getPlayerName(data.playerAddress)} entered game with{" "}
              {formatCurrency(weiToEth(data.balance))} pts
            </>
          );
        default:
          return "UNKNOWN EVENT";
      }
    },
    [rules, getPlayerName]
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

  const fetchPendingPlayers = useCallback(async () => {
    const pendingPlayers = await getArray("pendingPlayers", setPendingPlayers);
    setPendingPlayers(pendingPlayers);
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
    // if (setupStatus !== "complete") return;
    await fetchRules();
    await fetchProposals();
    await fetchPlayers();
    await fetchPendingPlayers();
    await fetchGameEndTime();
  }, [
    // setupStatus,
    fetchRules,
    fetchProposals,
    fetchPlayers,
    fetchPendingPlayers,
    fetchGameEndTime,
  ]);

  useEffect(() => {
    const fetch = async () => {
      await fetchEvents();
    };
    fetch();
  }, [fetchEvents]);

  useEffect(() => {
    if (!game) return;
    if (initialDataLoaded) return;
    fetchData();
    setInitialDataLoaded(true);
  }, [fetchData, initialDataLoaded, game]);

  const voteOnProposal = useContractFn(game, "voteOnProposal", {
    from: account,
  });

  const gameActive = useGameActive(proposals, getRuleValue("Game length"));

  const gamePot =
    (pendingPlayers &&
      (pendingPlayers.length + 1) * getRuleValue("Entry fee")) ||
    0;

  if (setupStatus !== "complete") return <Setup />;

  return (
    <>
      <ReactTooltip className="tooltip" effect="solid" />
      {gameActive && !isPlayer && !isPendingPlayer && rules && (
        <div className="game-icons-container">
          <div className="game-icon-panel">
            <div className="background-pattern"></div>
            <button
              className="game-button"
              onClick={joinGameHandler}
              data-tip={"WARNING: Only join a game with players you trust"}
            >
              <div>
                Join{" "}
                <div>
                  ${formatCurrency(weiToEth(getRuleValue("Entry fee")))}
                </div>
                Game
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
                maxProposals={getRuleValue("Game length")}
              />
            </div>
          )}
          <div className="game-name">
            {game && (
              <h2>
                <span
                  className="game-address"
                  data-tip={"Contract Address: " + gameAddress}
                >
                  Game '
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
                {formatCurrency(weiToEth(gamePot).toFixed(2) || 0)}{" "}
                {cryptocurrency}
              </div>
            </div>
          </div>
        </div>
        <div className="player-details-panel panel">
          <div className="background-pattern"></div>
          <OrnateBorder></OrnateBorder>
          <div data-tip={"Your address: " + account}>
            <PlayerIcon address={account}></PlayerIcon>
          </div>
          <div className="PlayerID" data-tip={"Your address: " + account}>
            {getPlayerName(account)}{" "}
          </div>
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
              <Payout
                players={players}
                userPlayerAddress={account}
                getPlayerName={getPlayerName}
                gamePot={gamePot}
              ></Payout>
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
                voteOnProposal={voteOnProposal}
                isPlayer={isPlayer}
                isPendingPlayer={isPendingPlayer}
                gameActive={gameActive}
                playerAddress={account}
                web3={web3}
                account={account}
                players={players}
                pendingPlayers={pendingPlayers}
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
