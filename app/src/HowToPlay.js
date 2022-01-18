import { OrnateBorder } from "./OrnateBorder";
export const HowToPlay = () => {
  return (
    <div className="setup panel">
      <div className="background-pattern"></div>
      <OrnateBorder></OrnateBorder>
      <h2>How to Play</h2>
      <div className="paragraph">
        The first thing you'll need to do is follow our setup instructions for
        Metamask. Follow the instructions from the games page. If you can see
        the list of games, you're ready!
      </div>
      <div className="paragraph">
        Next, you'll need some xDAI cryptocurrency. But first, a warning: As
        this is a game where the players can change the rules, it is very likely
        that you can find ways to break the game and make your cryptocurrency
        unrecoverable, or at least unrecoverable without the cooperation of a
        particular player. If your money gets stuck in the game, it's just gone,
        and nobody else has it. If you tell us about it, maybe we can close the
        loophole for the next set of players, but we can't get you your money
        back. Only play with amounts where you'd all be content to laugh off
        such a loss.
      </div>
      <div className="paragraph">
        To get some xDAI, you could copy your address, which can be found under
        the account name near the top of the Metamask window, and send it to
        someone who already has some xDAI, who can make a transfer to you.
        Alternatively, you can buy xDAI using Ramp or Mt Pellerin. xDAI is
        stablised to the dollar, so $1.00 = 1.00xDAI. We'd recommend a balance
        of around 6.00xDAI to play - 5 for the game pot and 1 more to be sure of
        covering all the transaction fees you're likely to incur as you play.
      </div>
      <div className="paragraph">
        One player needs to create the game. This will generate a game name and
        a URL. You can invite other players by sending them the URL or having
        them click on the game name in the list of games accessible from the
        games page. Players join by clicking the round Join Game button at the
        top of the game page. To keep out any uninvited guests, prospective
        players have to be admitted by the existing players, who can do this by
        clicking on the Admit buttons in the proposals panel, which show each
        prospective player's address. Players should confirm their addresses.
        Check that you have the number of players you expect before you start
        making proposals.
      </div>
      <div className="paragraph">
        You may find that you need to refresh a few times, close and re-open
        Metamask, or even sign in to Metamask again to get it to work. That's
        normal. Don't expect the game to be instantly responsive. Things will
        take a few seconds to go through to the blockchain, and a little longer
        to show up again in your browser. The page is set to refresh every 5
        seconds. Sometimes, the voting on a proposal might have finished on the
        blockchain, while you're still trying to send your vote in your browser.
        In that case, the transaction will be rejected - that's normal too.
      </div>
      <div className="paragraph">
        Your player name (eg. Player A, B, C) is displayed in the panel on the
        top right. The Proposals panel in the lower centre will show whose turn
        it is to start or, if it's you, you'll have an input panel allowing you
        to select different rules to propose changes to. Note: you can vote on
        your own proposals.
      </div>
      <div className="paragraph">
        Most of the panels you see in the game have extra information available
        on mouseover, so moving your mouse around is probably the best way to
        figure out what's going on in the game.
      </div>
      <div className="paragraph">
        The game length is measured in proposals, and that length is one of the
        rules that players can change, within limits. For that reason, it's hard
        to define how long a game might last. If you opt to play with your
        friends in real time, like a board game, either over video chat or in
        person, then it might take a couple of hours. You can also choose to
        play over over a longer time, treating it like correspondence chess, and
        exchanging messages to discuss proposals.
      </div>
      <div className="paragraph">
        After the final proposal, one last round of payments and deductions
        happens, and if the final proposal was successful, that rule change will
        be in effect.
      </div>
      <div className="paragraph">
        At the end of the game, a Payout panel will appear, showing what you've
        won as an individual, and the game's pot will be distributed out back
        into player's accounts - Metamask won't notify you of this, but if you
        open it, you'll see your new balance. The end of the game also brings up
        the Game Grade panel, which ranks your game collectively, according to
        various criteria.
      </div>
    </div>
  );
};
