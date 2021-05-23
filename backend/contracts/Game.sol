// SPDX-License-Identifier: MIT
pragma solidity 0.8.1;

import "hardhat/console.sol";

library Calculations {
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

    function etherToWei(uint256 etherAmount) public pure returns (uint256) {
        return etherAmount * 10**18;
    }
}

contract GameFactory {
    Game[] public games;

    event NewGame(uint256 gameIndex, address gameAddress);

    function getGamesLength() external view returns (uint256) {
        return games.length;
    }

    function newGame() public payable {
        require(
            msg.value == Calculations.etherToWei(10),
            "You must send the entry fee (10) to create a game"
        );
        Game g =
            new Game{value: msg.value}(
                msg.sender,
                10, // entry fee
                1000, // start balance
                10,
                50,
                50,
                30,
                1,
                10,
                3,
                1 //proposal fee
            );
        games.push(g);
        emit NewGame(games.length - 1, address(g));
    }
}

contract Game {
    uint256 public gameEndTime;

    struct Player {
        address playerAddress;
        uint256 balance;
    }
    Player[] public players;

    function getPlayersLength() external view returns (uint256) {
        return players.length;
    }

    struct Rule {
        string name;
        uint256 value;
        uint256 lowerBound;
        uint256 upperBound;
    }
    Rule[] public rules;

    function getRulesLength() external view returns (uint256) {
        return rules.length;
    }

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

    function getProposalsLength() external view returns (uint256) {
        return proposals.length;
    }

    event PlayerUpdate(
        uint256 playerIndex,
        address playerAddress,
        uint256 balance
    );
    event ProposalUpdate(
        uint256 proposalIndex,
        address proposer,
        uint256 ruleIndex,
        uint256 value,
        bool complete,
        bool successful
    );
    event RuleUpdate(uint256 ruleIndex, uint256 value);
    event VoteUpdate(
        uint256 proposalIndex,
        uint256 voteIndex,
        address player,
        uint256 vote
    );

    struct Vote {
        address player;
        bool vote;
    }

    enum RuleIndices {
        EntryFee,
        StartBalance,
        Reward,
        Majority,
        Quorum,
        MaxProposals,
        PollTax,
        WealthTax,
        WealthTaxThreshold,
        ProposalCost
    }

    constructor(
        address firstPlayer,
        uint256 entryFee,
        uint256 startBalance,
        uint256 rewardValue,
        uint256 majorityValue,
        uint256 quorumValue,
        uint256 maxProposalsValue,
        uint256 pollTaxValue,
        uint256 wealthTaxValue,
        uint256 wealthTaxThreshold,
        uint256 proposalCost
    ) payable {
        rules.push(Rule("Entry fee", entryFee, 0, 1000));
        rules.push(Rule("Start balance", startBalance, 0, 1000));
        rules.push(Rule("Proposal reward", rewardValue, 0, 1000));
        rules.push(Rule("Majority", majorityValue, 0, 100));
        rules.push(Rule("Quorum", quorumValue, 0, 100));
        rules.push(Rule("Max proposals", maxProposalsValue, 1, 100));
        rules.push(Rule("Poll tax", pollTaxValue, 1, 1000));
        rules.push(Rule("Wealth tax", wealthTaxValue, 1, 100));
        rules.push(Rule("Wealth tax threshold", wealthTaxThreshold, 0, 1000));
        rules.push(Rule("Proposal fee", proposalCost, 0, 1000));
        gameFee();
        createPlayer(firstPlayer);
    }

    modifier gameActive() {
        uint8 completedProposals;
        for (uint256 index = 0; index < proposals.length; index++) {
            if (proposals[index].complete) completedProposals++;
        }
        require(
            completedProposals < rules[uint256(RuleIndices.MaxProposals)].value,
            "You cannot interact with this game because it has ended"
        );
        _;
    }

    function gameFee() private view {
        // is a function because the entry fee rule won't exist when this is called
        uint256 eth = 1 ether;
        require(
            msg.value == rules[uint256(RuleIndices.EntryFee)].value * eth,
            "You must send required entry fee to join the game"
        );
    }

    function joinGame() external payable gameActive {
        gameFee();
        for (uint256 index = 0; index < players.length; index++) {
            require(
                msg.sender != players[index].playerAddress,
                "You have already joined this game"
            );
        }
        createPlayer(msg.sender);
    }

    function createPlayer(address playerAddress) private {
        uint256 eth = 1 ether;
        Player storage p = players.push();
        p.playerAddress = playerAddress;
        p.balance = rules[uint256(RuleIndices.StartBalance)].value * eth;
        emit PlayerUpdate(players.length - 1, p.playerAddress, p.balance);
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

    function subtractProposalFee() private {
        uint256 proposalFee =
            Calculations.etherToWei(
                rules[uint256(RuleIndices.ProposalCost)].value
            );
        uint256 playerIndex = getPlayer(msg.sender);
        require(
            players[playerIndex].balance >= proposalFee,
            "You do not have enough game funds to pay the proposal cost"
        );

        if (proposalFee > players[playerIndex].balance) {
            players[playerIndex].balance = 0;
        } else {
            players[playerIndex].balance -= proposalFee;
        }
    }

    function createProposal(uint256 ruleIndex, uint256 value)
        external
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
        subtractProposalFee();

        Proposal storage p = proposals.push(); // TODO: does this need to be storage, or can it be memory?
        p.proposer = msg.sender;
        p.ruleIndex = ruleIndex;
        p.value = value;

        emit ProposalUpdate(
            proposals.length - 1,
            p.proposer,
            p.ruleIndex,
            p.value,
            false,
            false
        );
    }

    function getVotesLength(
        uint256 proposalIndex // TODO: test
    ) external view returns (uint256) {
        return proposals[proposalIndex].votes.length;
    }

    function getVote(uint256 proposalIndex, uint256 voteIndex)
        external
        view
        returns (address playerAddress, bool vote)
    {
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
        external
        isPlayer
        gameActive
    {
        require(
            proposalIndex < proposals.length,
            "Voted on non-existent proposal"
        );
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

    function collectPollTax() private {
        for (uint256 index = 0; index < players.length; index++) {
            uint256 tax =
                Calculations.etherToWei(
                    rules[uint256(RuleIndices.PollTax)].value
                );
            if (tax > players[index].balance) {
                players[index].balance = 0;
            } else {
                players[index].balance -= tax;
            }
        }
    }

    function collectWealthTax() private {
        for (uint256 index = 0; index < players.length; index++) {
            uint256 threshold =
                Calculations.etherToWei(
                    rules[uint256(RuleIndices.WealthTaxThreshold)].value
                );

            if (threshold < players[index].balance) {
                uint256 taxableAmount = players[index].balance - threshold;
                players[index].balance =
                    players[index].balance -
                    ((taxableAmount *
                        rules[uint256(RuleIndices.WealthTax)].value) / 100);
            }
        }
    }

    function countVotes(uint256 proposalIndex) private {
        uint256 quorum =
            Calculations.calculateQuorum(
                rules[uint256(RuleIndices.Quorum)].value,
                players.length
            );

        if (proposals[proposalIndex].votes.length >= quorum) {
            proposals[proposalIndex].complete = true;

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
                    rules[uint256(RuleIndices.Majority)].value,
                    proposals[proposalIndex].votes.length
                );
            bool successful = yesVotes > majority;
            if (successful) {
                enactProposal(proposalIndex);
            }
            collectPollTax();
            collectWealthTax();
            emit ProposalUpdate(
                proposalIndex,
                proposals[proposalIndex].proposer,
                proposals[proposalIndex].ruleIndex,
                proposals[proposalIndex].value,
                true,
                successful
            );

            endGame();
        }
    }

    function getPlayer(address playerAddress) private view returns (uint256) {
        for (uint256 index = 0; index < players.length; index++) {
            if (players[index].playerAddress == playerAddress) return index;
        }
    }

    function enactProposal(uint256 proposalIndex) private {
        proposals[proposalIndex].successful = true;
        Proposal memory p = proposals[proposalIndex]; // FIXME: does using memory here use up gas?
        uint256 playerIndex = getPlayer(p.proposer);
        uint256 reward =
            Calculations.etherToWei(rules[uint256(RuleIndices.Reward)].value);
        players[playerIndex].balance += reward; // FIXME: is there a better way
        rules[p.ruleIndex].value = p.value;
        emit PlayerUpdate(
            playerIndex,
            p.proposer,
            players[playerIndex].balance
        );
        emit RuleUpdate(p.ruleIndex, p.value);
    }

    function endGame() private {
        if (
            proposals.length >= rules[uint256(RuleIndices.MaxProposals)].value
        ) {
            gameEndTime = block.timestamp;

            uint256 balancesSum;
            uint256 thisGameContractBalance = address(this).balance;
            uint256[] memory playerBalancesCopy = new uint256[](players.length);

            for (uint256 index = 0; index < players.length; index++) {
                playerBalancesCopy[index] = players[index].balance;
                balancesSum += playerBalancesCopy[index];
            }
            if (balancesSum == 0) {
                for (uint256 index = 0; index < players.length; index++) {
                    playerBalancesCopy[index] += 1; // if all balances are zero, divide pot equally
                    balancesSum += playerBalancesCopy[index];
                }
            }
            for (uint256 index = 0; index < players.length; index++) {
                if (playerBalancesCopy[index] == 0) continue; // skip players if they have no share
                uint256 share =
                    (playerBalancesCopy[index] * thisGameContractBalance) /
                        balancesSum;
                payable(players[index].playerAddress).transfer(share);
            }
        }
    }
}
