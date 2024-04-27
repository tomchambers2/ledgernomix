import "./Statistic.css";
import { Tooltip } from "react-tooltip";

export const Statistic = ({ title, number, description }) => {
  return (
    <>
      <Tooltip id="statistic-tip" className="tooltip" />
      <div className="statistic" data-tooltip-content={description} data-tooltip-id="statistic-tip">
        <div className="data">
          <div>{title}</div>
          <div>{number}</div>
        </div>
        <div className="chart">
          <div className="position" style={{ left: `${number - 3}%` }}>
            X
          </div>
        </div>
      </div>
    </>
  );
};
