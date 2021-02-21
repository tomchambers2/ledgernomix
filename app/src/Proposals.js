export const Proposals = ({
  rules,
  proposals,
  voteOnProposal,
  getPlayerName,
  playerAddress,
  gameActive,
}) => (
  <>
    <h2>Proposals</h2>
    {(!rules.length && "LOADING...") ||
      (!proposals.length &&
        "No rule changes have been proposed so far. Use the 'Propose rule change' form to start the game")}
    <ol>
      {proposals
        .map((proposal, index) => ({ ...proposal, index }))
        .slice()
        .reverse()
        .map((proposal, i) => (
          <li key={i}>
            {proposal.votes &&
              proposal.votes.filter(({ vote }) => vote).map(() => "👍🏻")}
            {proposal.votes &&
              proposal.votes.filter(({ vote }) => !vote).map(() => "👎")}
            {getPlayerName(proposal.proposer)} proposes{" "}
            {rules[proposal.ruleIndex].name} should be {proposal.value}.
            Complete: {proposal.complete.toString()}. Success:{" "}
            {proposal.successful.toString()}
            {proposal.pending && "PENDING"}
            {gameActive &&
              !proposal.votes.some(
                ({ playerAddress: voter }) => voter === playerAddress
              ) &&
              !proposal.complete &&
              !proposal.pending && (
                <>
                  <button onClick={() => voteOnProposal(proposal.index, true)}>
                    Vote for
                  </button>
                  <button onClick={() => voteOnProposal(proposal.index, false)}>
                    Vote against
                  </button>
                </>
              )}
          </li>
        ))}
    </ol>
  </>
);
