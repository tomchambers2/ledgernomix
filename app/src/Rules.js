import { ruleConfig } from "./ruleConfig";
import "./Rule.css";

export const Rules = ({ rules }) => {
  return (
    <>
      <h2>Rules</h2>

      {rules
        .map((rule) => ({ rule, ruleConfig: ruleConfig[rule.name] }))
        .map(({ rule, ruleConfig }, i) => (
          <div key={i} className="rule">
            <div className="rule-title">
              <div>
                <strong>{rule.name}</strong>
              </div>
              <div className="rule-description">{ruleConfig.description}</div>
            </div>
            <div className="rule-value">
              {rule.value}
              {ruleConfig.unit}
            </div>
          </div>
        ))}
    </>
  );
};
