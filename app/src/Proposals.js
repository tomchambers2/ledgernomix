export const Proposals = ({
  rules,
  proposals,
  voteOnProposal,
  getPlayerName,
}) => (
  <>
    {(!rules.length && "LOADING...") || (
      <ol>
        {!proposals.length &&
          "No rule changes have been proposed so far. Use the 'Create Proposal' form to start the game"}
        {proposals
          .map((proposal, index) => ({ ...proposal, index }))
          .slice()
          .reverse()
          .map((proposal, i) => (
            <li key={i}>
              {getPlayerName(proposal.proposer)} proposes{" "}
              {rules[proposal.ruleIndex].name} should be {proposal.value}.
              Complete: {proposal.complete.toString()}. Success:{" "}
              {proposal.successful.toString()}
              {!proposal.complete && (
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
    )}
  </>
);
