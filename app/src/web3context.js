import { createContext, useState, useEffect } from "react";
import { gameConfig } from "./gameConfig";

const Web3 = require("web3");

export const Web3Context = createContext();

const network = gameConfig.networks.gnosis;

function connectToNetwork(web3) {
  const params = network.params;

  web3.eth.requestAccounts((error, accounts) => {
    window.ethereum
      .request({
        method: "wallet_addEthereumChain",
        params: [params, accounts[0]],
      })
      .then((result) => {
        console.log(result);
      })
      .catch((error) => {
        console.log(error);
      });
  });
}

export const Web3Provider = ({ children }) => {
  const [setupStatus, setSetupStatus] = useState("install");
  const [web3, setWeb3] = useState(null);

  const connect = () => connectToNetwork(web3);

  useEffect(() => {
    const fn = async () => {
      if (!window.ethereum) return setSetupStatus("install");
      const web3 = new Web3(window.ethereum);
      setWeb3(web3);

      try {
        const networkId = await web3.eth.net.getId();

        if (networkId !== network.networkId) {
          console.log("wrong network");
          return setSetupStatus("setnetwork");
        }

        setSetupStatus("complete");
      } catch (e) {
        console.log(e);
      }
    };
    fn();
  }, []);

  return (
    <Web3Context.Provider value={{ setupStatus, web3, connect }}>
      {children}
    </Web3Context.Provider>
  );
};
