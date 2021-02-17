// SPDX-License-Identifier: MIT
pragma solidity 0.8.1;

import "hardhat/console.sol";

library Calculations {
    // FIXME: should be a library but ethers doesn't like that
    function calculateQuorum(uint256 quorum, uint256 numPlayers)
        public
        pure
        returns (uint256)
    {
        uint8 remainder = uint8((quorum * numPlayers) % 100);

        if (remainder == 0) return (quorum * numPlayers) / 100;
        else return ((quorum * numPlayers) / 100) + 1;
    }

    function calculateMajority(uint256 majority, uint256 numVotes)
        public
        pure
        returns (uint256)
    {
        if (majority == 100) majority = 99;
        return (majority * numVotes) / 100;
    }
}

contract Game {
    uint256 constant entryFee = 5 ether;

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
        // TODO: use an enum to add/reference rules instead of indices
        rules.push(Rule("Proposal reward", 10, 0, 1000)); // FIXME: is there a better way to add rules initially?
        rules.push(Rule("Majority", 50, 0, 100));
        rules.push(Rule("Quorum", 50, 0, 100));
        rules.push(Rule("Max proposals", 3, 1, 100));
    }

    modifier gameActive() {
        uint8 completedProposals;
        for (uint256 index = 0; index < proposals.length; index++) {
            if (proposals[index].complete) completedProposals++;
        }
        require(
            completedProposals < rules[3].value,
            "You cannot interact with this game because it has ended"
        );
        _;
    }

    function joinGame() public payable gameActive {
        require(msg.value == entryFee, "You must send 5 xDai to join the game");
        for (uint256 index = 0; index < players.length; index++) {
            require(
                msg.sender != players[index].playerAddress,
                "You have already joined this game"
            );
        }
        Player storage p = players.push();
        p.playerAddress = msg.sender;
        p.balance = entryFee;
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
        // FIXME: feels wrong - why expose this just for tests
        require(
            proposalIndex < proposals.length,
            "Proposal index must be in range"
        );
        require(
            voteIndex < proposals[proposalIndex].votes.length,
            "Vote index must be in range"
        );
        return (
            proposals[proposalIndex].votes[voteIndex].player,
            proposals[proposalIndex].votes[voteIndex].vote
        );
    }

    function voteOnProposal(uint256 proposalIndex, bool vote)
        public
        isPlayer
        gameActive
    {
        require(
            !proposals[proposalIndex].complete,
            "You may not vote on completed proposal"
        );
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
        countVotes(proposalIndex);
    }

    function countVotes(uint256 proposalIndex) private {
        uint256 quorum =
            Calculations.calculateQuorum(rules[2].value, players.length);

        if (proposals[proposalIndex].votes.length >= quorum) {
            proposals[proposalIndex].complete = true;
            endGame();
            uint256 yesVotes;
            for (
                uint256 index = 0;
                index < proposals[proposalIndex].votes.length;
                index++
            ) {
                if (proposals[proposalIndex].votes[index].vote) yesVotes++;
            }
            uint256 majority =
                Calculations.calculateMajority(
                    rules[1].value,
                    proposals[proposalIndex].votes.length
                );
            if (yesVotes > majority) {
                enactProposal(proposalIndex);
            }
        }
    }

    function getPlayer(address playerAddress) private returns (uint256) {
        for (uint256 index = 0; index < players.length; index++) {
            if (players[index].playerAddress == playerAddress) return index;
        }
    }

    function enactProposal(uint256 proposalIndex) private {
        proposals[proposalIndex].successful = true;
        Proposal memory p = proposals[proposalIndex]; // FIXME: does using memory here use up gas?
        rules[p.ruleIndex].value = p.value;
        players[getPlayer(p.proposer)].balance += rules[0].value; // FIXME: is there a better way to retrieve players other than looping?
    }

    function endGame() private {
        if (proposals.length >= rules[3].value) {
            uint256 balancesSum;
            for (uint256 index = 0; index < players.length; index++) {
                balancesSum += players[index].balance;
            }
            for (uint256 index = 0; index < players.length; index++) {
                uint256 share =
                    (players[index].balance / balancesSum) *
                        (entryFee * players.length);
                // players[index].playerAddress.send(share);
            }
        }
    }
}
