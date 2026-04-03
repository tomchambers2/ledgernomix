import { useCallback } from "react";
import { fireNotification } from "./fireNotification";
import Web3, { Contract } from "web3";
import Game from "./contracts/Game.json";

const parseError = (error) => {
  const err = error.message.match(
    /VM Exception while processing transaction: revert ([\w ]+)/
  );
  if (err) return err[1];
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
  } catch (e) {
    console.error(e);
    const msg = parseError(e);
    fireNotification(`${msg}`, "error");
    return false;
  }
};
