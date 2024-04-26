import { useState, useEffect } from "react";
import { Contract, Web3 } from "web3";

export const useContract = (web3: Web3, abi, address) => {
  const [contract, setContract] = useState<Contract<typeof abi> | null>(null);

  useEffect(() => {
    if (!web3) return;
    const result = new web3.eth.Contract(abi, address);
    setContract(result);
  }, [abi, address, web3]);

  return contract;
};
