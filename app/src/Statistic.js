import "./Statistic.css";

export const Statistic = ({ title, number }) => {
  return (
    <div className="statistic">
      <div className="data">
        <div>{title}</div>
        <div>{number}</div>
      </div>
      <div className="chart"></div>
    </div>
  );
};
