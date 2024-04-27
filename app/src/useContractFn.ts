import { useCallback } from "react";
import { fireNotification } from "./fireNotification";
import { Contract } from "web3";
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
      try {
        const gasEstimate = await contract.methods[name](...args).estimateGas(options);
        // add a buffer to gas limit to ensure that the transaction goes through
        const gasLimit = gasEstimate * 4n;
        options.gas = gasLimit.toString();
        console.log("gasEstimate", gasEstimate, "gasLimit", options.gas);
        const result = await contract.methods[name](...args).send(options);
        return result;
      } catch (e) {
        console.error(e);
        const msg = parseError(e);
        fireNotification(`${msg}`, "error");
        return false;
      }
    },
    [contract, name, options]
  );

  return fn;
};

export const contractFn = async (contract, name, options, ...args) => {
  try {
    const result = await contract.methods[name](...args).send(options);
    return result;
  } catch (e) {
    console.error(e);
    const msg = parseError(e);
    fireNotification(`${msg}`, "error");
    return false;
  }
};
