import { useState, useEffect } from "react";
import Select from "react-select";
import classNames from "classnames";
import { ruleConfig } from "./ruleConfig";
import isEqual from "lodash.isequal";

export const Propose = ({ rules, createProposal, isPlayer, gameActive }) => {
  const [prevRules, setPrevRules] = useState([]);
  const [proposedRuleOption, setProposedRuleOption] = useState(null);
  const [proposedValue, setProposedValue] = useState(0);
  const [proposedValueValid, setProposedValueValid] = useState(true);
  const [proposedValueError, setProposedValueError] = useState(null);

  const ruleOptions = rules.map((rule, i) => ({ value: i, label: rule.name }));

  useEffect(() => {
    if (!proposedRuleOption) return setProposedValueValid(true);
    if (rules[proposedRuleOption.value].value === proposedValue) {
      setProposedValueError(
        "Proposed value must be different to current value"
      );
    } else {
      setProposedValueError(null);
    }
    if (
      parseInt(proposedValue) >=
        parseInt(rules[proposedRuleOption.value].lowerBound) &&
      parseInt(proposedValue) <=
        parseInt(rules[proposedRuleOption.value].upperBound)
    ) {
      return setProposedValueValid(true);
    }
    return setProposedValueValid(false);
  }, [rules, proposedValue, proposedRuleOption]);

  useEffect(() => {
    if (!proposedRuleOption) return;
    if (isEqual(prevRules, rules)) return;
    console.log("CHECK");
    setPrevRules(rules);
    setProposedValue(rules[proposedRuleOption.value].value);
  }, [proposedRuleOption, rules, prevRules]);

  const createProposalHandler = () => {
    const result = createProposal(proposedRuleOption.value, proposedValue);
    if (result) {
      setProposedValue(0);
      setProposedRuleOption(null);
    }
  };

  return (
    <>
      {(!gameActive && <div className="disabled-panel">Game over</div>) ||
        (!isPlayer && (
          <div className="disabled-panel">Join the game to make proposals</div>
        ))}
      <h2>Propose rule change</h2>
      <div className="proposal-form">
        I propose that{" "}
        <Select
          className="select-box"
          options={ruleOptions}
          value={proposedRuleOption}
          onChange={(option) => setProposedRuleOption(option)}
        ></Select>{" "}
        be changed to{" "}
        <input
          onChange={({ target: { value } }) => setProposedValue(value)}
          type="text"
          value={proposedValue}
          disabled={!proposedRuleOption}
        ></input>
        {proposedRuleOption && ruleConfig[proposedRuleOption.label].unit}
      </div>
      <div>
        <button
          onClick={createProposalHandler}
          disabled={
            !proposedValueValid || !proposedRuleOption || proposedValueError
          }
        >
          Create proposal
        </button>
      </div>
      <p>{proposedValueError}</p>
      <p className={classNames("input-helper", !proposedValueValid && "error")}>
        {proposedRuleOption &&
          `${rules[proposedRuleOption.value].name} must be between ${
            rules[proposedRuleOption.value].lowerBound
          } and ${rules[proposedRuleOption.value].upperBound}`}
      </p>
    </>
  );
};
