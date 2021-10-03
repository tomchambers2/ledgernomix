import { OrnateBorder } from "./OrnateBorder";
import theGameOfImage from "./backgrounds/TheGameOfTheRulesOf-Coin05.svg";
export const About = () => {
  return (
    <div className="setup panel">
      <div className="background-pattern"></div>
      <OrnateBorder></OrnateBorder>
      <h2>About</h2>
      <div className="paragraph">
        Ledgernomix is a game of political economy, played on a blockchain, with
        real cryptocurrency.
      </div>
      <div className="paragraph">
        Play with your friends in real time, like a board game, or over a longer
        time, like correspondence chess.
      </div>
      <div className="paragraph">
        Each game of Ledgernomix is a distributed autonomous organisation, or
        DAO, governed by a contract that exists on the blockchain. You can also
        think of it as a self-contained model economy and model parliament, with
        you and your friends as the members.
      </div>
      <div className="paragraph">
        {" "}
        <img
          className="tag-circle"
          alt="the game of the rules of the game"
          src={theGameOfImage}
        ></img>
      </div>
      <div className="paragraph">
        You all buy in by staking some cryptocurrency when you join the game.
        This joining fee is added to the game's pot.
      </div>
      <div className="paragraph">
        Players take turns to propose changes to the game rules, and these
        proposals are voted on, according to those rules. During the game,
        points are issued to and deducted from the players, again, according to
        the rules they create. You can think of the points as your game's own
        currency.
      </div>
      <div className="paragraph">
        At the end of the game, the original pot of cryptocurrency is
        redistributed in proportion to the distribution of points in the game -
        so if one player has 100 points and the others all have zero, that
        player gets 100% of the pot.
      </div>
      <div className="paragraph">
        There is no "house" running this game, and the redistribution is done by
        a smart contract on a blockchain. Currently, that blockchain is just our
        test network, but the plan is to move to a chain where the currency has
        real value, but where energy consumption and transaction fees are low,
        eg. xDAI.
      </div>
      <div className="paragraph">
        As all games are recorded on the blockchain, they can be ranked on
        various subjective criteria for success, for example equality,
        participation, inflation, vetocracy.
      </div>
      <div className="paragraph">
        Ledgernomix is influenced by Peter Suber's game Nomic (1982) and Lizzie
        Magie's The Landlord's Game (AKA Monopoly). While it is intended to
        actually work as a game, it's also an art project about the potentials
        and pitfalls of decentralised systems.
      </div>
      <div className="paragraph">
        The game necessarily presents an extremely simple model of an economy.
        The aim isn't to say that this or that system or rule would be bad or
        good in the real world. Experimenting with the system is the point, to
        observe the changing relationships between rules and people, and to
        watch the gap between intent and effect.
      </div>
      <div className="paragraph">
        Contact the creators at{" "}
        <a href="mailto:ledgernomix@gmail.com">ledgernomix@gmail.com</a>
      </div>
      <div className="paragraph">
        All the code can be viewed at{" "}
        <a href="https://github.com/tomchambers2/ledgernomix">
          https://github.com/tomchambers2/ledgernomix
        </a>
      </div>
    </div>
  );
};
