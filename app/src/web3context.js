import { createContext, useState, useEffect } from "react";

const Web3 = require("web3");

export const Web3Context = createContext();

function connectToNetwork(web3) {
  const params = {
    chainId: "0x64", // A 0x-prefixed hexadecimal string
    chainName: "Gnosis Chain",
    nativeCurrency: {
      name: "xDai",
      symbol: "xDai", // 2-6 characters long
      decimals: 18,
    },
    rpcUrls: ["https://rpc.xdaichain.com/"],
    blockExplorerUrls: ["https://blockscout.com/xdai/mainnet/"],
  };

  console.log(web3);

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

      console.log("Gas");
      web3.eth.getGasPrice().then(console.log);

      try {
        const networkId = await web3.eth.net.getId();

        // 100 is gnosis chain/xDai
        if (networkId !== 100) {
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
