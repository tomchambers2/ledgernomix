import { useState, useEffect } from "react";

export const useGameActive = (proposals, rules) => {
  const [gameActive, setGameActive] = useState(true);

  useEffect(() => {
    if (!rules || !proposals || !rules.length) return;
    const maxProposals = rules[3].value; // TODO: find a better way to identify correct rule
    setGameActive(
      proposals.filter((proposal) => proposal.complete).length < maxProposals
    );
  }, [proposals, rules]);

  return gameActive;
};
