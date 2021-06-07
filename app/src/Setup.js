import { OrnateBorder } from "./OrnateBorder";
import networkImage from "./backgrounds/metamaskSettings.jpg";

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
          <div>
            Before you can play you need to connect to our test network.
          </div>
          <br></br>
          <div>
            Click on Metamask, the fox icon to the top right of your browser.
          </div>
          <br></br>
          <img alt="network" src={networkImage} width="352"></img>
          {/* image
        ask for private key to import */}
        </div>
      )}
    </>
  );
};
