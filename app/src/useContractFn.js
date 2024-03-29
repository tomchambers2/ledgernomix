import { useCallback } from "react";
import { fireNotification } from "./fireNotification";

const parseError = (error) => {
  const err = error.message.match(
    /VM Exception while processing transaction: revert ([\w ]+)/
  );
  if (err) return err[1];
  return "You cancelled the transaction";
};

export const useContractFn = (contract, name, options) => {
  const fn = useCallback(
    async (...args) => {
      try {
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
