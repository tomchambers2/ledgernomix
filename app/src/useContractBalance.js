import { useState, useEffect } from "react";

export const useContractBalance = (web3, contractAddress) => {
  const [balance, setBalance] = useState(0);
  useEffect(() => {
    const getBalance = async () => {
      if (!web3) return;
      const newBalance = await web3.eth.getBalance(contractAddress);
      setBalance(newBalance);
    };
    getBalance();
  }, [contractAddress, web3]);

  return balance;
};
