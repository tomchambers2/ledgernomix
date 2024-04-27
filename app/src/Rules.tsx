import { ruleConfig } from "./ruleConfig";
import classNames from "classnames";
import "./Rules.css";
import { Tooltip } from "react-tooltip";

export const Rules = ({ rules }) => {
  return (
    <>
      <h2>Rules</h2>
      <Tooltip id="rulespanel-description-tip" className="tooltip" />
      {rules
        .map((rule) => ({ rule, ruleConfig: ruleConfig[rule.name] }))
        .filter(({ ruleConfig }) => !ruleConfig.hidden)
        .filter(
          ({ rule, ruleConfig }) => parseInt(rule.value) !== ruleConfig.inactive
        )
        .map(({ rule, ruleConfig }, i) => {
          return (
            <div
              key={i}
              className={classNames("item", rule.updated && "updated")}
            >
              <div
                className="rule-text"
                data-tooltip-id="rulespanel-description-tip"
                data-tooltip-content={ruleConfig.description}
              >
                {ruleConfig.name} is {ruleConfig.append}
                {parseInt(rule.value)}
                {ruleConfig.unit}
              </div>
            </div>
          );
        })}
    </>
  );
};
