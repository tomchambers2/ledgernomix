import { OrnateBorder } from "./OrnateBorder";
import metamaskMenuImage from "./backgrounds/metamaskMenuImage.jpg";
import networkSettingsImage from "./backgrounds/metamaskNetworkSettings.jpg";
import networksImage from "./backgrounds/metamaskNetworks.jpg";
import { useTimeout } from "./useTimeout";

export const Setup = ({ setupStatus }) => {
  console.log(setupStatus);
  useTimeout(5000, () => {
    console.log(setupStatus, !setupStatus.metamask && !setupStatus.network);
    if (!setupStatus.metamask && !setupStatus.network) {
      console.log("run");
      // window.location.reload();
    }
  });

  return (
    <>
      {" "}
      {!setupStatus.metamask && (
        <div className="panel-container">
          <div className="setup panel">
            <div className="background-pattern"></div>
            <OrnateBorder></OrnateBorder>
            <a
              className="button"
              target="_blank"
              href="https://metamask.io/download.html"
              rel="noreferrer"
            >
              <h3>First install Metamask browser extension</h3>
            </a>
          </div>
        </div>
      )}
      {setupStatus.metamask && !setupStatus.network && (
        <div className="panel-container">
          <div className="setup panel">
            <div className="background-pattern"></div>
            <OrnateBorder></OrnateBorder>
            <div className="paragraph">
              Before you can play you need to connect Metamask to our test
              network
            </div>

            <div className="paragraph">
              Your browser extensions can be found to the top right of your
              browser. Metamask has a fox icon. You may need to click on the
              puzzle piece first to reveal it
            </div>

            <div className="paragraph">
              Click on the fox icon to bring up Metamask, which should appear in
              the corner of this window
            </div>

            <div className="paragraph">
              By default, Metamask is set up for Ethereum
            </div>

            <div className="paragraph">
              Click on "Ethereum Mainnet" to change networks
            </div>

            <img alt="network" src={metamaskMenuImage} width="359"></img>

            <div className="paragraph">
              Select "Custom RPC" from the list of networks
            </div>

            <img alt="network" src={networksImage} width="308"></img>

            <div className="paragraph">Enter our network settings as below</div>

            <div className="paragraph">Network Name: ngrok</div>

            <div className="paragraph">
              New RPC URL: https://ledgerblockchain.ngrok.io
            </div>

            <div className="paragraph">Chain ID: 1337</div>
            <img alt="network" src={networkSettingsImage} width="352"></img>

            <div className="paragraph">Save and close the network settings</div>

            <div className="paragraph">These instructions should disappear</div>

            <div className="paragraph">
              Try refreshing the page (Control or Command + R)
            </div>
          </div>
        </div>
      )}
    </>
  );
};
