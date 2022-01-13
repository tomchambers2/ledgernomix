import { useState, useEffect } from "react";

export const useContractBalance = (web3, contractAddress) => {
  const [balance, setBalance] = useState(0);
  useEffect(() => {
    const getBalance = async () => {
      if (!web3) return;
      const newBalance = getContractBalance(web3, contractAddress);
      setBalance(newBalance);
    };
    getBalance();
  }, [contractAddress, web3]);

  return balance;
};

export const getContractBalance = async (web3, contractAddress) => {
  if (!web3) {
    console.log("no web3");
    return 0;
  }
  return await web3.eth.getBalance(contractAddress);
};
