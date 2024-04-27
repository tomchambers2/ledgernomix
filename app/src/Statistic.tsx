import "./Statistic.css";
import { Tooltip } from "react-tooltip";

export const Statistic = ({ title, number, description }) => {
  return (
    <>
      <Tooltip className="tooltip" />
      <div className="statistic" data-tip={description}>
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
