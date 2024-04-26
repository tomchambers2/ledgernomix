import ReactTooltip from "react-tooltip";

import "./Helper.css";

export const Helper = ({ text }) => {
  return (
    <>
      <ReactTooltip className="tooltip" effect="solid" />
      <span className="helper" data-tip={text}></span>
    </>
  );
};
