import ReactTooltip from "react-tooltip";

import "./Helper.css";

export const Helper = ({ text }) => {
  return (
    <>
      <ReactTooltip
        className="tooltip"
        effect="solid"
        // place="right"
        // overridePosition={({ left }) => ({ left: "100%" })}
      />
      <span className="helper" data-tip={text}></span>
    </>
  );
};
