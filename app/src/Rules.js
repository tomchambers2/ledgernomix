import { ruleConfig } from "./ruleConfig";

export const Rules = ({ rules }) => {
  return (
    <>
      <h2>Rules</h2>
      <ul>
        {rules
          .map((rule) => ({ rule, ruleConfig: ruleConfig[rule[0]] }))
          .map(({ rule, ruleConfig }, i) => (
            <li key={i}>
              <strong>{rule.name}</strong> {ruleConfig.description} -{" "}
              {rule.value}
              {ruleConfig.unit}
            </li>
          ))}
      </ul>
    </>
  );
};
