import { useState, useEffect } from "react";
import type { Web3 } from "web3";

export const useAccount = (web3: Web3) => {
  const [account, setAccount] = useState<string | null>(null);

  useEffect(() => {
    if (!web3) return;
    async function fetchAccounts() {
      try {
        const accounts = await web3.eth.requestAccounts();
        // The address should be returned with a mixed case checksum, but it isn't so we do this manually here
        const checksumAddress = web3.utils.toChecksumAddress(accounts[0]);
        setAccount(checksumAddress);
      } catch (e) {
        console.error(`Failed getting accounts`);
      }
    }
    fetchAccounts();
  }, [web3]);
  return account;
};
