import { OrnateBorder } from "./OrnateBorder";
import metamaskMenuImage from "./backgrounds/metamaskMenuImage.jpg";
import networkSettingsImage from "./backgrounds/metamaskNetworkSettings.jpg";
import networksImage from "./backgrounds/metamaskNetworks.jpg";
import setup2 from "./videos/setup2.mp4";
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
              First install Metamask browser extension
            </a>
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
            <a
              className="button setup-button"
              target="_blank"
              rel="noreferrer"
              onClick={connect}
            >
              Connect Metamask to Gnosis
            </a>
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
