import { useState, useEffect } from "react";
import Select from "react-select";

export const Propose = ({ rules, createProposal, enabled }) => {
  const [proposedRuleOption, setProposedRuleOption] = useState(null);
  const [proposedValue, setProposedValue] = useState(0);
  const [proposedValueValid, setProposedValueValid] = useState(true);

  const ruleOptions = rules.map((rule, i) => ({ value: i, label: rule.name }));

  useEffect(() => {
    if (!proposedRuleOption) return setProposedValueValid(true);
    console.log(rules, rules[proposedRuleOption.value]);
    if (
      parseInt(proposedValue) >=
        parseInt(rules[proposedRuleOption.value].lowerBound) &&
      parseInt(proposedValue) <=
        parseInt(rules[proposedRuleOption.value].upperBound)
    ) {
      console.log(proposedValue);
      return setProposedValueValid(true);
    }
    return setProposedValueValid(false);
  }, [rules, proposedValue, proposedRuleOption]);

  const createProposalHandler = () => {
    setProposedValue(0);
    setProposedRuleOption(null);
    createProposal(proposedRuleOption.value, proposedValue);
  };

  return (
    <>
      {!enabled && (
        <div className="disabled-panel">Join the game to make proposals</div>
      )}
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
        disabled={!proposedValueValid || !proposedRuleOption}
      >
        Create proposal
      </button>
      {!proposedValueValid &&
        `${rules[proposedRuleOption.value].name} must be between ${
          rules[proposedRuleOption.value].lowerBound
        } and ${rules[proposedRuleOption.value].upperBound}`}
    </>
  );
};
