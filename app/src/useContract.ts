import { useState, useEffect } from "react";

export const useContract = (web3, abi, address) => {
  const [contract, setContract] = useState(null);

  useEffect(() => {
    if (!web3) return;
    const result = new web3.eth.Contract(abi, address);
    setContract(result);
  }, [abi, address, web3]);

  return contract;
};
