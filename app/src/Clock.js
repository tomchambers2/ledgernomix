import { useState, useCallback } from "react";
import useInterval from "./useInterval";
import "./Clock.css";

const tick = 1000;

export const Clock = ({ blockInterval, timeoutCallback }) => {
  const [remainingTime, setRemainingTime] = useState(blockInterval);

  const advance = useCallback(() => {
    setRemainingTime((remainingTime) => {
      if (remainingTime > 0) {
        return remainingTime - tick;
      } else {
        timeoutCallback();
        return blockInterval;
      }
    });
  }, [setRemainingTime, blockInterval, timeoutCallback]);

  useInterval(advance, tick);

  const portionRemaining = remainingTime / blockInterval;

  return (
    <div className="clock">
      <div
        className="inner"
        style={{ width: `${portionRemaining * 100}%` }}
      ></div>
    </div>
  );
};
