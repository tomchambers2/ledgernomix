import { useState, useEffect, useCallback } from "react";
import Game from "./contracts/Game.json";
const Web3 = require("web3");

const web3 = new Web3(window.ethereum);

function App() {
  const [game, setGame] = useState(null);
  const [playerAccount, setPlayerAccount] = useState(null);
  const [numPlayers, setNumPlayers] = useState(-1);

  useEffect(() => {
    const game = new web3.eth.Contract(
      Game.abi,
      "0x3D7e9e25449CCC13AbcaDD2CC1A4B986C8f88578"
    );

    setGame(game);

    const getAccounts = async () => {
      let accounts;
      try {
        accounts = await web3.eth.requestAccounts();
      } catch (e) {
        console.log(e);
        // handle user rejecting accounts
      }

      console.log(accounts);
      setPlayerAccount(accounts[0]);
    };
    getAccounts();

    game.methods.getNumPlayers().call().then(setNumPlayers);
  }, [setNumPlayers]);

  const joinGame = useCallback(() => {
    try {
      game.methods.joinGame().send({ from: playerAccount, value: 1000 });
    } catch (e) {
      console.log(e);
    }
  });

  return (
    <div className="App">
      <h1>Num players: {numPlayers}</h1>
      <button onClick={joinGame}>Join game</button>
    </div>
  );
}

export default App;
