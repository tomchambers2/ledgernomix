import "./Statistic.css";
import ReactTooltip from "react-tooltip";

export const Statistic = ({ title, number, description }) => {
  return (
    <>
      <ReactTooltip className="tooltip" effect="solid" html={true} />
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
