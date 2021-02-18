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
          .slice()
          .reverse()
          .map((proposal, i) => (
            <li key={Math.random()}>
              {getPlayerName(proposal.proposer)} proposes{" "}
              {rules[proposal.ruleIndex].name} should be {proposal.value}.
              Complete: {proposal.complete.toString()}. Success:{" "}
              {proposal.successful.toString()}
              {!proposal.complete && (
                <>
                  <button onClick={() => voteOnProposal(i, true)}>
                    Vote for
                  </button>
                  <button onClick={() => voteOnProposal(i, false)}>
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
