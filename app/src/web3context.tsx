import { createContext, useState, useEffect } from "react";
import { gameConfig } from "./gameConfig";

import { Web3 } from 'web3';
import { RegisteredSubscription } from "web3/lib/commonjs/eth.exports";

export const Web3Context = createContext<{
  web3: Web3<RegisteredSubscription>;
  setupStatus: string;
  connect: () => Promise<void>;
}>(null);

const network = gameConfig.networks.gnosis;

async function connectToNetwork(web3) {
  const params = network.params;

  const accounts = await web3.eth.requestAccounts();
  await window.ethereum
    .request({
      method: "wallet_addEthereumChain",
      params: [params, accounts[0]],
    });

}

export const Web3Provider = ({ children }) => {
  const [setupStatus, setSetupStatus] = useState("install");
  const [web3, setWeb3] = useState(null);

  const connect = () => connectToNetwork(web3);

  useEffect(() => {
    const fn = async () => {
      if (!window.ethereum) {
        return setSetupStatus("install");
      }
      const web3 = new Web3(window.ethereum);
      setWeb3(web3);

      try {
        const networkId = (await web3.eth.net.getId()).toString();

        if (networkId !== network.networkId.toString()) {
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
