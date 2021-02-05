import logo from "./logo.svg";
import "./App.css";
import { useState, useEffect } from "react";
import Game from "./contracts/Game.json";
const Web3 = require("web3");

function App() {
  const [numPlayers, setNumPlayers] = useState();

  useEffect(() => {
    const web3 = new Web3(
      new Web3.providers.HttpProvider("http://localhost:7545")
    );

    const game = new web3.eth.Contract(
      Game.abi,
      "0x3D7e9e25449CCC13AbcaDD2CC1A4B986C8f88578"
    );

    game.methods
      .getNumPlayers()
      .call({ from: "0x2a0Bd73D9489b7b90209AaC5cE6783E5Eb4681cc" })
      .then(console.log);

    web3.eth.getBlock("latest").then(console.log);
  });

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
