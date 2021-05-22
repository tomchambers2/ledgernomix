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
            Install Metamask browser extension
          </a>
        </div>
      )}
      {setupStatus.metamask && !setupStatus.network && (
        <div>You need to connect to the correct network</div>
      )}
    </>
  );
};
