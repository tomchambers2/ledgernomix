import { OrnateBorder } from "./OrnateBorder";
import networkImage from "./backgrounds/paper2.jpg";

export const Setup = ({ setupStatus }) => {
  return (
    <>
      {" "}
      {!setupStatus.metamask && (
        <div className="setup panel">
          <OrnateBorder></OrnateBorder>
          <a
            className="button"
            target="_blank"
            href="https://metamask.io/download.html"
            rel="noreferrer"
          >
            First install Metamask browser extension
          </a>
        </div>
      )}
      {setupStatus.metamask && !setupStatus.network && (
        <div className="setup panel">
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
