import { Tooltip } from "react-tooltip";

import "./Helper.css";

export const Helper = ({ text }) => {
  return (
    <>
      <Tooltip className="tooltip" />
      <span className="helper" data-tip={text}></span>
    </>
  );
};
