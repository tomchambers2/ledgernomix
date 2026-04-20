import { useCallback } from "react";
import { fireNotification } from "./fireNotification";
import Web3, { Contract } from "web3";
import Game from "./contracts/Game.json";

const revertMessages: Record<string, string> = {
  // Shown when a player's vote transaction is submitted but another player's
  // vote already reached quorum and completed the proposal first.
  "Cannot vote on completed proposal": "Your vote was too late, another player's vote completed the proposal",
};

const parseError = (error) => {
  // Hardhat local network format
  const hardhatMatch = error.message?.match(
    /VM Exception while processing transaction: revert ([\w ]+)/
  );
  if (hardhatMatch) {
    const contractMessage = hardhatMatch[1];
    return revertMessages[contractMessage] ?? contractMessage;
  }

  // Mainnet format: revert reason is ABI-encoded in error.data.data
  // 0x08c379a0 is the selector for Error(string)
  const abiEncodedReason = error.data?.data;
  if (abiEncodedReason?.startsWith("0x08c379a0")) {
    try {
      const contractMessage = Web3.utils.hexToUtf8(
        "0x" + abiEncodedReason.slice(138)
      ).replace(/\0/g, "").trim();
      return revertMessages[contractMessage] ?? contractMessage;
    } catch {}
  }

  return "You cancelled the transaction";
};

export const useContractFn = (contract: Contract<typeof Game.abi>, name, options) => {
  const fn = useCallback(
    async (...args) => {
      return await contractFn(contract, name, options, ...args);
    },
    [contract, name, options]
  );

  return fn;
};

export const contractFn = async (contract, name, options, ...args) => {
  try {
    const gasEstimate = await contract.methods[name](...args).estimateGas(options);
    // add a buffer to gas limit to ensure that the transaction goes through
    const gasLimit = Math.max(parseInt(gasEstimate) * 2, 1000000);
    const gasLimitBigInt = BigInt(gasLimit);
    console.log("gasEstimate", gasEstimate, "gasLimit", gasLimitBigInt.toString());
    const result = await contract.methods[name](...args).send({
      ...options,
      gas: gasLimitBigInt.toString(),
      gasPrice: Web3.utils.toWei(15, 'gwei')
    });
    return result;
  } catch (e: any) {
    console.error(e);
    // On mainnet the reverted receipt contains no reason string. Re-simulate
    // with eth_call to get the ABI-encoded revert reason from the RPC.
    if (e.message?.includes("Transaction has been reverted by the EVM")) {
      try {
        await contract.methods[name](...args).call(options);
      } catch (callError) {
        fireNotification(parseError(callError), "error");
        return false;
      }
    }
    fireNotification(parseError(e), "error");
    return false;
  }
};
