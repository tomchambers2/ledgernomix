import { useState, useEffect } from "react";

export const useGameActive = (proposals, maxProposals) => {
  const [gameActive, setGameActive] = useState(true);

  useEffect(() => {
    if (!maxProposals || !proposals) return;
    setGameActive(
      proposals.filter((proposal) => proposal.complete).length < maxProposals
    );
  }, [proposals, maxProposals]);

  return gameActive;
};
