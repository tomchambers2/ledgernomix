import { useState, useCallback } from "react";
import useInterval from "./useInterval";
import "./Clock.css";

const tick = 1000;

export const Clock = ({ blockInterval, timeoutCallback }) => {
  const [remainingTime, setRemainingTime] = useState(blockInterval);

  const advance = useCallback(() => {
    if (remainingTime <= 0) {
      setRemainingTime(blockInterval);
    } else {
      setRemainingTime(remainingTime - tick);
    }
  }, [setRemainingTime, remainingTime]);

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
