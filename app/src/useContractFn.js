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
        fireNotification(`${name} request sent`, "warning");
        return result;
      } catch (e) {
        console.error(e);
        const msg = parseError(e);
        fireNotification(
          `${msg}<br><br><em>The blockchain takes a few seconds to update, so your screen may be out of date</em>`,
          "error"
        );
        return false;
      }
    },
    [contract, name, options]
  );

  return fn;
};
