import { OrnateBorder } from "./OrnateBorder";
import metamaskMenuImage from "./backgrounds/metamaskMenuImage.jpg";
import networkSettingsImage from "./backgrounds/metamaskNetworkSettings.jpg";
import networksImage from "./backgrounds/metamaskNetworks.jpg";

export const Setup = ({ setupStatus }) => {
  return (
    <>
      {" "}
      {!setupStatus.metamask && (
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
      )}
      {setupStatus.metamask && !setupStatus.network && (
        <div className="setup panel">
          <div className="background-pattern"></div>
          <OrnateBorder></OrnateBorder>
          <div>Before you can play you need to connect to our test network</div>
          <br></br>
          <div>
            Click on Metamask, the fox icon to the top right of your browser
          </div>
          <br></br>
          <div>By default, Metamask is set up for Ethereum</div>
          <br></br>
          <div>Click on "Ethereum Mainnet" to change networks</div>
          <br></br>
          <img alt="network" src={metamaskMenuImage} width="359"></img>
          <br></br>
          <div>Select "Custom RPC" from the list of networks</div>
          <br></br>
          <img alt="network" src={networksImage} width="308"></img>
          <br></br>
          <div>Enter our network settings as below</div>
          <br></br>
          <div>Network Name: ngrok</div>
          <br></br>
          <div>New RPC URL: https://ledgerblockchain.ngrok.io</div>
          <br></br>
          <div>Chain ID: 1337</div>
          <img alt="network" src={networkSettingsImage} width="352"></img>
          <br></br>
          <div>Save and close the network settings</div>
          <br></br>
          <div>These instructions should disappear</div>
          <br></br>
          <div>
            <div>Try refreshing the page (Control or Command + R)</div>
          </div>
          <br></br>
        </div>
      )}
    </>
  );
};
