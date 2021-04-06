import Identicon from "identicon.js";
import "./PlayerIcon.css";

export function PlayerIcon({ address }) {
  if (!address) return <img></img>;

  console.log("address is ", address);

  var options = {
    background: [0, 0, 0, 255], // rgba black
    foreground: [255, 255, 255, 255], // rgba white
    margin: 0.2, // 20% margin
    // size: 420, // 420px square
    format: "svg", // use SVG instead of PNG
  };

  // create a base64 encoded SVG
  var data = new Identicon(address, options).toString();

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
