import { useState, useEffect } from "react";
import Select from "react-select";
import classNames from "classnames";
import { ruleConfig } from "./ruleConfig";
import isEqual from "lodash.isequal";

export const Propose = ({
  rules,
  createProposal,
  isPlayer,
  isPendingPlayer,
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
  const [isSubmitting, setIsSubmitting] = useState(null);

  const ruleOptions = rules
    .map((rule, i) => ({ value: i, label: rule.name }))
    .filter(({ label }) => !ruleConfig[label].unproposable);
  const customStyles = {
    control: (provided) => ({
      ...provided,
      borderRadius: 0,
      borderWidth: 0,
      backgroundColor: "black",
      color: "white",
      boxShadow: "none",
    }),
    placeholder: (provided) => ({
      ...provided,
      backgroundColor: "black",
      color: "white",
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: "black",
      color: "white",
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused ? "white" : "black",
      color: state.isFocused ? "black" : "white",
    }),
    indicatorContainer: (provided) => ({
      ...provided,
      backgroundColor: "black",
      color: "white",
    }),
    indicatorsContainer: (provided) => ({
      ...provided,
      backgroundColor: "black",
      color: "white",
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      backgroundColor: "black",
      color: "white",
    }),
    singleValue: (provided) => ({
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
      proposedValue >=
        parseInt(rules[proposedRuleOption.value].lowerBound) &&
      proposedValue <=
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

  const createProposalHandler = async () => {
    setIsSubmitting(true);
    const result = await createProposal(
      proposedRuleOption.value,
      proposedValue
    );
    if (result) {
      setProposedValue(0);
      setProposedRuleOption(null);
    } else {
      console.log("transaction cancelled, end submitting");
      setIsSubmitting(false);
    }
  };

  const isPlayersTurn =
    players &&
    (proposals.length + players.length - 1) % players.length === playerIndex();

  useEffect(() => {
    if (!isPlayersTurn) {
      console.log("turn off submitting, not players tur");
      setIsSubmitting(false);
    }
  }, [proposals, isPlayersTurn]);

  if (!players || !proposals) return <div>Loading...</div>;

  if (proposals.filter(({ complete }) => complete).length !== proposals.length)
    return <>Waiting for a quorum of votes on the currrent proposal</>;

  if (isSubmitting) return <div>Submitting proposal...</div>;

  return (
    <>
      {!isPlayer && !isPendingPlayer && (
        <div className="disabled-panel">Join the game to make proposals</div>
      )}
      {!isPlayer && isPendingPlayer && (
        <div className="disabled-panel">Ask existing players to admit you</div>
      )}
      {isPlayer &&
        ((isPlayersTurn && (
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
                  onChange={({ target: { value } }) => setProposedValue(parseInt(value))}
                  type="text"
                  value={proposedValue}
                  disabled={!proposedRuleOption}
                ></input>
                {proposedRuleOption &&
                  ruleConfig[proposedRuleOption.label].unit}
              </div>
            </div>
            <p>
              {proposedRuleOption &&
                ruleConfig[proposedRuleOption.label].description}
            </p>
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
          <>
            Waiting for{" "}
            {getPlayerName(
              (proposals.length + players.length - 1) % players.length
            )}
          </>
        ))}
    </>
  );
};
