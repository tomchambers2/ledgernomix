import { OrnateBorder } from "./OrnateBorder";
import { useContext } from "react";
import { Web3Context } from "./web3context";

export const Setup = () => {
  const { setupStatus, connect } = useContext(Web3Context);

  return (
    <>
      {setupStatus === "install" && (
        <div className="panel-container">
          <div className="setup panel">
            <div className="background-pattern"></div>
            <OrnateBorder></OrnateBorder>
            <a
              className="button"
              target="_blank"
              href="https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn"
              rel="noreferrer"
            >
              Install Metamask browser extension
            </a>

            <div className="paragraph">
              Once you have Metamask installed, this panel should disappear. You
              might need to refresh this page (Control or Command + R)
            </div>
          </div>
        </div>
      )}
      {setupStatus === "setnetwork" && (
        <div className="panel-container">
          <div className="setup panel">
            <div className="background-pattern"></div>
            <OrnateBorder></OrnateBorder>
            <div className="paragraph">
              Before you can view or play games you need to connect Metamask to
              Gnosis network
            </div>
            <div className="paragraph"></div>
            <button
              className="button setup-button"
              rel="noreferrer"
              onClick={connect}
            >
              Connect Metamask to Gnosis
            </button>
            <div className="paragraph"></div>
            <div className="paragraph">
              Once you have connected, refresh the page (Control or Command + R)
              to see the list of games
            </div>
          </div>
        </div>
      )}
    </>
  );
};
