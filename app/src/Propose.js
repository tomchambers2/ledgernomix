import { useState, useEffect } from "react";
import Select from "react-select";
import classNames from "classnames";
import { ruleConfig } from "./ruleConfig";
import isEqual from "lodash.isequal";

export const Propose = ({
  rules,
  createProposal,
  isPlayer,
  gameActive,
  proposals,
  players,
  playerIndex,
  getPlayerName,
}) => {
  const [prevRules, setPrevRules] = useState([]);
  const [proposedRuleOption, setProposedRuleOption] = useState(null);
  const [prevProposedRuleOption, setPrevProposedRuleOption] = useState(null);
  const [proposedValue, setProposedValue] = useState(0);
  const [proposedValueValid, setProposedValueValid] = useState(true);
  const [proposedValueError, setProposedValueError] = useState(null);

  const ruleOptions = rules
    // .filter(({ name }) => !ruleConfig[name].unproposable)
    .map((rule, i) => ({ value: i, label: rule.name }));
  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      borderRadius: 0,
      borderWidth: 0,
      backgroundColor: "black",
      color: "white",
      boxShadow: "none",
    }),
    placeholder: (provided, state) => ({
      ...provided,
      backgroundColor: "black",
      color: "white",
    }),
    menu: (provided, state) => ({
      ...provided,
      backgroundColor: "black",
      color: "white",
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused ? "white" : "black",
      color: state.isFocused ? "black" : "white",
    }),
    indicatorContainer: (provided, state) => ({
      ...provided,
      backgroundColor: "black",
      color: "white",
    }),
    indicatorsContainer: (provided, state) => ({
      ...provided,
      backgroundColor: "black",
      color: "white",
    }),
    dropdownIndicator: (provided, state) => ({
      ...provided,
      backgroundColor: "black",
      color: "white",
    }),
    singleValue: (provided, state) => ({
      ...provided,
      backgroundColor: "black",
      color: "white",
    }),
  };

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
    if (
      isEqual(prevRules, rules) &&
      isEqual(prevProposedRuleOption, proposedRuleOption)
    )
      return;
    setPrevRules(rules);
    setPrevProposedRuleOption(proposedRuleOption);
    setProposedValue(rules[proposedRuleOption.value].value);
  }, [proposedRuleOption, rules, prevRules, prevProposedRuleOption]);

  const createProposalHandler = () => {
    const result = createProposal(proposedRuleOption.value, proposedValue);
    if (result) {
      setProposedValue(0);
      setProposedRuleOption(null);
    }
  };

  if (!players || !proposals) return <div>LOADING...</div>;

  if (proposals.filter(({ complete }) => complete).length !== proposals.length)
    return <>Waiting for current proposal to complete</>;

  return (
    <>
      {!isPlayer && (
        <div className="disabled-panel">Join the game to make proposals</div>
      )}
      {/* proposal {proposals.length}
      <br />
      players {players.length}
      <br />
      index {playerIndex()}
      <br />
      yes {proposals.length % players.length === playerIndex()} */}
      {isPlayer &&
        ((proposals.length % players.length === playerIndex() && (
          <>
            <div className="proposal-form">
              I propose that{" "}
              <Select
                className="select-box"
                styles={customStyles}
                options={ruleOptions}
                value={proposedRuleOption}
                onChange={(option) => setProposedRuleOption(option)}
              ></Select>{" "}
              be changed to{" "}
              <div className="input-container">
                <input
                  onChange={({ target: { value } }) => setProposedValue(value)}
                  type="text"
                  value={proposedValue}
                  disabled={!proposedRuleOption}
                ></input>
                {proposedRuleOption &&
                  ruleConfig[proposedRuleOption.label].unit}
              </div>
            </div>
            <br></br>
            <div>
              <button
                className="create-proposal"
                onClick={createProposalHandler}
                disabled={
                  !proposedValueValid ||
                  !proposedRuleOption ||
                  proposedValueError
                }
              >
                Create proposal
              </button>
            </div>
            <p>{proposedValueError}</p>
            <p
              className={classNames(
                "input-helper",
                !proposedValueValid && "error"
              )}
            >
              {!proposedValueValid &&
                proposedRuleOption &&
                `${rules[proposedRuleOption.value].name} must be between ${
                  rules[proposedRuleOption.value].lowerBound
                } and ${rules[proposedRuleOption.value].upperBound}`}
            </p>
          </>
        )) || (
          <>Waiting for {getPlayerName(proposals.length % players.length)}</>
        ))}
    </>
  );
};
