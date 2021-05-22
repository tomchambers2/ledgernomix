import networkImage from "./backgrounds/paper2.jpg";

export const Setup = ({ setupStatus }) => {
  return (
    <>
      {" "}
      {!setupStatus.metamask && (
        <div>
          <a
            className="button"
            target="_blank"
            href="https://metamask.io/download.html"
            rel="noreferrer"
          >
            First Install Metamask Browser Extension
          </a>
        </div>
      )}
      {setupStatus.metamask && !setupStatus.network && (
        <>
          <div>Next connect to our test network</div>
          <img src={networkImage}></img>
          {/* image
        ask for private key to import */}
        </>
      )}
    </>
  );
};
