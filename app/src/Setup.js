import { OrnateBorder } from "./OrnateBorder";
import networkImage from "./backgrounds/paper2.jpg";

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
          <div>Next connect to our test network</div>
          <img alt="network" src={networkImage}></img>
          {/* image
        ask for private key to import */}
        </div>
      )}
    </>
  );
};
