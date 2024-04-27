import { useState, useCallback } from "react";
import useInterval from "./useInterval";
import "./Clock.css";
import { Tooltip } from "react-tooltip";

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
  const stringRemaining = String(
    (portionRemaining * blockInterval) / 1000
  ).padStart(2, "0");

  return (
    <div
      className="clock-container"
      data-tooltip-content={
        "This page will check the chain for a new block every 5 seconds"
      }
      data-tooltip-id="clock"
    >
      <Tooltip id="clock" className="tooltip" />
      <div className="clock-caption-container">
        <div className="clock-caption">New Block in:</div>
        <div className="clock-number">{stringRemaining}</div>
      </div>
      <div className="clock">
        <div
          className="inner"
          style={{ width: `${portionRemaining * 100}%` }}
        ></div>
      </div>
    </div>
  );
};
