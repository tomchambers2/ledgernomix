import { useState, useEffect } from "react";
import Select from "react-select";
import classNames from "classnames";

export const Propose = ({ rules, createProposal, isPlayer, gameActive }) => {
  const [proposedRuleOption, setProposedRuleOption] = useState(null);
  const [proposedValue, setProposedValue] = useState(0);
  const [proposedValueValid, setProposedValueValid] = useState(true);
  const [proposedValueError, setProposedValueError] = useState(null);

  const ruleOptions = rules.map((rule, i) => ({ value: i, label: rule.name }));

  useEffect(() => {
    if (!proposedRuleOption) return setProposedValueValid(true);
    if (rules[proposedRuleOption.value].value == proposedValue) {
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
    setProposedValue(rules[proposedRuleOption.value].value);
  }, [proposedRuleOption]);

  const createProposalHandler = () => {
    setProposedValue(0);
    setProposedRuleOption(null);
    createProposal(proposedRuleOption.value, proposedValue);
  };

  return (
    <>
      {(!gameActive && <div className="disabled-panel">Game over</div>) ||
        (!isPlayer && (
          <div className="disabled-panel">Join the game to make proposals</div>
        ))}
      <h2>Propose</h2>I propose that{" "}
      <Select
        options={ruleOptions}
        value={proposedRuleOption}
        onChange={(option) => setProposedRuleOption(option)}
      ></Select>{" "}
      be changed to{" "}
      <input
        onChange={({ target: { value } }) => setProposedValue(value)}
        type="text"
        value={proposedValue}
      ></input>
      <button
        onClick={createProposalHandler}
        disabled={
          !proposedValueValid || !proposedRuleOption || proposedValueError
        }
      >
        Create proposal
      </button>
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
