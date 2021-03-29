import { useState, useEffect } from "react";

export const useContractBalance = (web3, contractAddress) => {
  const [balance, setBalance] = useState(0);
  useEffect(async () => {
    if (!web3) return;
    const newBalance = await web3.eth.getBalance(contractAddress);
    setBalance(newBalance);
  }, [contractAddress, web3]);

  return balance;
};
