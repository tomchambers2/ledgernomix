import { ruleConfig } from "./ruleConfig";
import classNames from "classnames";
import { Helper } from "./Helper";
import ReactTooltip from "react-tooltip";
import "./Rules.css";

export const Rules = ({ rules }) => {
  return (
    <>
      <h2>Rules</h2>

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
            <ReactTooltip
              className="tooltip"
              effect="solid"
              // place="right"
              // overridePosition={({ left }) => ({ left: "100%" })}
            />
            <div className="rule-text" data-tip={ruleConfig.description}>
              {ruleConfig.name} is {ruleConfig.append}
              {rule.value}
              {ruleConfig.unit}
            </div>
            <div className="rule-helper">
              <Helper text={ruleConfig.description}></Helper>
            </div>
          </div>
        ))}
    </>
  );
};
