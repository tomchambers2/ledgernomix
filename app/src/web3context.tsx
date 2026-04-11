import { createContext, useState, useEffect } from "react";
import { gameConfig } from "./gameConfig";

import { Web3 } from 'web3';
import { RegisteredSubscription } from "web3/lib/commonjs/eth.exports";

export const Web3Context = createContext<{
  web3: Web3<RegisteredSubscription>;
  setupStatus: string;
  connect: () => Promise<void>;
}>(null);

const network = process.env.REACT_APP_NETWORK === "local"
  ? gameConfig.networks.local
  : gameConfig.networks.gnosis;

async function connectToNetwork(web3) {
  await web3.eth.requestAccounts();
  try {
    // Prefer wallet_switchEthereumChain over wallet_addEthereumChain for networks
    // MetaMask already knows about. wallet_addEthereumChain fails if the user has
    // the network stored with different params (e.g. a different nativeCurrency
    // symbol from a previous version of the app or a MetaMask built-in entry).
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: network.params.chainId }],
    });
  } catch (e: any) {
    // Error 4902 means the chain isn't in MetaMask yet — add it.
    if (e.code === 4902) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [network.params],
      });
    } else {
      throw e;
    }
  }
}

export const Web3Provider = ({ children }) => {
  const [setupStatus, setSetupStatus] = useState("install");
  const [web3, setWeb3] = useState(null);

  const connect = () => connectToNetwork(web3);

  useEffect(() => {
    const fn = async () => {
      if (!window.ethereum) {
        console.error("Browser does not have window.ethereum")
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
