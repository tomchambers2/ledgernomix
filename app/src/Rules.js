import { ruleConfig } from "./ruleConfig";
import classNames from "classnames";
import { Helper } from "./Helper";

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
            {ruleConfig.name} is {ruleConfig.append}
            {rule.value}
            {ruleConfig.unit}
            <Helper text={ruleConfig.description}></Helper>
          </div>
        ))}
    </>
  );
};
