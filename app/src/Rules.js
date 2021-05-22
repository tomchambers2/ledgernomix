import { ruleConfig } from "./ruleConfig";
import classNames from "classnames";

export const Rules = ({ rules }) => {
  console.log("Rules: ", rules);
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
            {rule.name} is {rule.value}
            {ruleConfig.unit}
          </div>
        ))}
    </>
  );
};
