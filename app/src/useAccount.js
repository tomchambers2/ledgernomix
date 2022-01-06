import { useState, useEffect } from "react";

export const useAccount = (web3) => {
  const [account, setAccount] = useState(null);

  useEffect(() => {
    if (!web3) return;
    async function fetchAccounts() {
      try {
        const accounts = await web3.eth.requestAccounts();
        setAccount(accounts[0]);
      } catch (e) {
        console.error(`Failed getting accounts`);
      }
    }
    fetchAccounts();
  }, [web3]);
  return account;
};
