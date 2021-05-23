import "./Statistic.css";

export const Statistic = ({ title, number, avg }) => {
  return (
    <div className="statistic">
      <div className="data">
        <div>{title}</div>
        <div>{number}</div>
      </div>
      <div className="chart">
        {/* <div className="average" style={{ left: `${avg - 3}%` }}>
          |
          <br />
          <div className="text">Avg.</div>
        </div> */}
        <div className="position" style={{ left: `${number - 3}%` }}>
          X
        </div>
      </div>
    </div>
  );
};
