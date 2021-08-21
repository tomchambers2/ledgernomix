import { ruleConfig } from "./ruleConfig";
import classNames from "classnames";
import "./Rules.css";
import ReactTooltip from "react-tooltip";

export const Rules = ({ rules }) => {
  return (
    <>
      <h2>Rules</h2>
      <ReactTooltip className="tooltip" effect="solid" />
      {rules
        .map((rule) => ({ rule, ruleConfig: ruleConfig[rule.name] }))
        .filter(
          ({ rule, ruleConfig }) => parseInt(rule.value) !== ruleConfig.inactive
        )
        .map(({ rule, ruleConfig }, i) => (
          <div
            key={i}
            className={classNames("item", rule.updated && "updated")}
          >
            <div className="rule-text" data-tip={ruleConfig.description}>
              {ruleConfig.name} is {ruleConfig.append}
              {rule.value}
              {ruleConfig.unit}
            </div>
          </div>
        ))}
    </>
  );
};
