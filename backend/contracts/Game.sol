// SPDX-License-Identifier: MIT
pragma solidity 0.8.1;

import "hardhat/console.sol";

contract Game {
    uint256 constant entryFee = 5 ether;
    uint256 constant maxProposals = 30;
    uint256 constant startingBalance = 100;

    struct Player {
        address playerAddress;
        uint256 balance;
    }
    Player[] public players;

    struct Rule {
        string name;
        uint256 value;
        uint256 lowerBound;
        uint256 upperBound;
    }
    Rule[] public rules;

    struct Proposal {
        address proposer;
        uint256 value;
        uint256 ruleIndex;
        Vote[] votes;
        // mutability
        bool mutabilityChange;
        bool proposedMutability;
        // state
        bool complete;
        bool successful;
    }
    Proposal[] public proposals;

    struct Vote {
        // uint256 voterIndex;
        address player;
        bool vote; // TODO: add abstentions
    }

    constructor() {
        rules.push(Rule("Proposal reward", 10, 0, 1000)); // FIXME: is there a better way to add rules initially?
        rules.push(Rule("Majority", 50, 0, 100));
        rules.push(Rule("Quorum", 50, 0, 100));
    }

    modifier gameActive() {
        require(
            proposals.length < maxProposals,
            "You cannot join this game because it has ended"
        );
        _;
    }

    function joinGame() public payable gameActive {
        require(msg.value == entryFee, "You must send 5 xDai to join the game");
        Player storage p = players.push();
        p.playerAddress = msg.sender;
        p.balance = startingBalance;
    }

    modifier isPlayer() {
        bool valid;
        for (uint256 index = 0; index < players.length; index++) {
            // FIXME: should we pass in index to avoid O(n) time
            if (msg.sender == players[index].playerAddress) {
                valid = true;
                break;
            }
        }
        require(valid, "You must have joined the game to call this function");
        _;
    }

    function createProposal(uint256 ruleIndex, uint256 value)
        public
        gameActive
        isPlayer
    {
        require(
            ruleIndex < rules.length,
            "Proposal must apply to an existing rule"
        );
        require(
            value <= rules[ruleIndex].upperBound &&
                value >= rules[ruleIndex].lowerBound,
            "Proposal value must be within rule bounds"
        );

        Proposal storage p = proposals.push(); // TODO: does this need to be storage, or can it be memory?
        p.proposer = msg.sender;
        p.ruleIndex = ruleIndex;
        p.value = value;
    }

    function getVote(uint256 proposalIndex, uint256 voteIndex)
        public
        view
        returns (address, bool)
    {
        require(
            proposalIndex < proposals.length,
            "Proposal index must be in range"
        );
        require(
            voteIndex < proposals[proposalIndex].votes.length,
            "Vote index must be in range"
        );
        // FIXME: feels wrong - why expose this just for tests
        return (
            proposals[proposalIndex].votes[voteIndex].player,
            proposals[proposalIndex].votes[voteIndex].vote
        );
    }

    // endgame

    function calculateQuorum(uint256 quorum, uint256 numPlayers)
        public
        returns (uint256)
    {
        return (quorum * numPlayers) / 100;
    }

    // function calculateQuorum() public returns (uint256) {
    //     return rules[2].value * players.length / 100;
    // }

    function voteOnProposal(uint256 proposalIndex, bool vote) public isPlayer {
        for (
            uint256 index = 0;
            index < proposals[proposalIndex].votes.length;
            index++
        ) {
            require(
                proposals[proposalIndex].votes[index].player != msg.sender,
                "You have already voted on this proposal"
            );
        }
        proposals[proposalIndex].votes.push(Vote(msg.sender, vote));

        // if (proposals[proposalIndex].votes.length >= )
        // if (voteShare > majority) {
        //     enactProposal();
        // }
    }

    // enactproposal
}
