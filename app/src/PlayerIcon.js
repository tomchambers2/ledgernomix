import Identicon from "identicon.js";
import "./PlayerIcon.css";

export function PlayerIcon({ address }) {
  var options = {
    background: [0, 0, 0, 255], // rgba black
    foreground: [255, 255, 255, 255], // rgba white
    margin: 0.2, // 20% margin
    // size: 420, // 420px square
    format: "svg", // use SVG instead of PNG
  };

  var data = new Identicon(address || "000000000000000", options).toString();

  // if (!address) return <img alt="No player"></img>;

  // create a base64 encoded SVG

  // write to a data URI
  //   document.write(
  //     '<img width=420 height=420 src="data:image/svg+xml;base64,' + data + '">'
  //   );

  return (
    <img
      className="player-icon"
      src={`data:image/svg+xml;base64,${data}`}
      alt="Player Icon"
    ></img>
  );
}
