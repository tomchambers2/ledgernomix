import "./eskapade-fraktur-wakamaifondue.css";
import { Game } from "./Game";
import { GameList } from "./GameList";
import { OrnateBorder } from "./OrnateBorder";
import theGameOfImage from "./backgrounds/TheGameOfTheRulesOf-Coin05.svg";
import { ToastContainer } from "react-toastify";
import "./App.css";
import { About } from "./About";
import { HowToPlay } from "./HowToPlay";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import "./Toast.css";
import "./playtest.css";
import { Web3Provider } from "./web3context";

function App() {
  return (
    <Router>
      <Web3Provider>
        <ToastContainer />
        <div className="app">
          <div className="ink-col-effect"></div>
          <div className="background-gradient"></div>
          <div className="intro">
            <Link to="/">
              <h2 className="logo">
                Ledgernomi<span style={{ fontVariant: "small-caps" }}>x</span>
              </h2>
            </Link>
            <div className="links">
              <Link to="/how-to-play">
                <h3>How to Play</h3>
              </Link>
              <Link to="/about">
                <h3>About</h3>
              </Link>
            </div>
          </div>
          <div className="all-panels-container">
            <div className="background-spacer"></div>

            <Switch>
              <Route path="/about">
                <About></About>
              </Route>
              <Route path="/how-to-play">
                <HowToPlay></HowToPlay>
              </Route>
              <Route path="/games">
                <GameList />
              </Route>
              <Route path="/:gameAddress">
                <Game />
              </Route>
              <Route path="/">
                <div className="panel-container">
                  <div className="welcome panel">
                    <div className="background-pattern"></div>
                    <OrnateBorder></OrnateBorder>
                    <h1 className="logo">
                      Ledgernomi
                      <span style={{ fontVariant: "small-caps" }}>x</span>
                    </h1>
                    <img
                      className="tag-circle"
                      alt="the game of the rules of the game"
                      src={theGameOfImage}
                    ></img>
                    <div className="paragraph">
                      Ledgernomix is a game of political economy, played on a
                      blockchain, with real cryptocurrency.
                    </div>
                    <div className="paragraph">
                      Play with your friends in real time, like a board game, or
                      over a longer time, like correspondence chess.
                    </div>
                    <div className="paragraph">
                      Each game of Ledgernomix is a distributed autonomous
                      organisation, or DAO, governed by a contract that exists
                      on the blockchain. You can also think of it as a
                      self-contained model economy and model parliament, with
                      you and your friends as the members.
                    </div>
                  </div>
                </div>

                <div className="panel-container">
                  <div className="setup panel">
                    <div className="background-pattern"></div>
                    <OrnateBorder></OrnateBorder>
                    <Link className="button" to="/games">
                      <h3>Go to Games</h3>
                    </Link>
                  </div>
                </div>

                <div className="panel-container">
                  <div className="setup panel">
                    <div className="background-pattern"></div>
                    <OrnateBorder></OrnateBorder>
                    <h1 className="logo">Playtest</h1>
                    <div className="paragraph">
                      Enter your email below to join the mailing list for our
                      playtest group who will help test and shape the game
                    </div>
                    <div id="mc_embed_signup" className="email-signup">
                      <form
                        action="https://vercel.us5.list-manage.com/subscribe/post?u=eb3bf72ef330a9ffb75f7e687&amp;id=082ec84faf"
                        method="post"
                        id="mc-embedded-subscribe-form"
                        name="mc-embedded-subscribe-form"
                        className="validate"
                        target="_blank"
                        noValidate
                      >
                        <div id="mc_embed_signup_scroll">
                          <label for="mce-EMAIL">Email Address: </label>
                          <div className="mc-field-group playtest-inputs">
                            <input
                              type="email"
                              name="EMAIL"
                              className="required email"
                              id="mce-EMAIL"
                            />
                          </div>
                          <div id="mce-responses" className="clear">
                            <div
                              className="response"
                              id="mce-error-response"
                              style={{ display: "none" }}
                            ></div>
                            <div
                              className="response"
                              id="mce-success-response"
                              style={{ display: "none" }}
                            ></div>
                          </div>

                          <div
                            style={{ position: "absolute", left: "-5000px" }}
                            aria-hidden="true"
                          >
                            <input
                              type="text"
                              name="b_eb3bf72ef330a9ffb75f7e687_082ec84faf"
                              tabIndex="-1"
                            />
                          </div>

                          <div className="clear">
                            <button
                              type="submit"
                              value="Subscribe"
                              name="subscribe"
                              id="mc-embedded-subscribe"
                              className="subscribe button"
                            >
                              Subscribe
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </Route>
            </Switch>
          </div>
        </div>
      </Web3Provider>
    </Router>
  );
}

export default App;
