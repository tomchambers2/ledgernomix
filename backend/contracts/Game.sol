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

    struct GameParams {
            uint entryFee;
            uint startBalance;
            uint successfulProposalReward;
            uint majority;
            uint quorum;
            uint maxProposals;
            uint pollTax;
            uint wealthTax;
            uint wealthTaxThreshold;
            uint proposalFee;
            uint dividend;
    }
}

contract GameFactory {
    Game[] public games;

    event NewGame(uint256 gameIndex, address gameAddress);

    function getGamesLength() external view returns (uint256) {
        return games.length;
    }

    function newGame() public payable {
        Game g = new Game{value: msg.value}(
            msg.sender,
            Calculations.GameParams(msg.value, // entry fee
            1000, // start balance
            2000, //Successful Proposal reward
            50, //Majority
            65, //Quorum
            30, //Game length
            0, //Poll Tax
            0, //Wealth Tax
            0, // Wealth Tax Threshold
            0, //Proposal fee
            0 // dividend
            )
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
    Player[] public pendingPlayers;
    Player[] public players;

    function getPlayersLength() external view returns (uint256) {
        return players.length;
    }

    function getPendingPlayersLength() external view returns (uint256) {
        return pendingPlayers.length;
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
        //fee
        bool feePaid;
        // state
        bool complete;
        bool successful;
    }
    Proposal[] public proposals;

    function getProposalsLength() external view returns (uint256) {
        return proposals.length;
    }

    event LedgerEntry(
        address playerAddress,
        uint256 amount,
        bool isDeduction,
        uint256 balance,
        bool successfulProposal,
        uint256 ruleIndex
    );

    event CreatePlayer(address playerAddress, uint balance);

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
        ProposalFee,
        Dividend
    }

    constructor(
        address firstPlayer,
        Calculations.GameParams memory gameParams
    ) payable {
        require(
            msg.value > 0,
            "Must send an entry fee to create game"
        );
        require(
            msg.value < 100 * 1 ether,
            "Amount must be < 100"
        );
        rules.push(Rule("Entry fee", gameParams.entryFee, 0, 100 * 1 ether));
        rules.push(Rule("Start balance", gameParams.startBalance, 0, 1000));
        rules.push(Rule("Proposal reward", gameParams.successfulProposalReward, 0, 1000000000));
        rules.push(Rule("Majority", gameParams.majority, 0, 100));
        rules.push(Rule("Quorum", gameParams.quorum, 0, 100));
        rules.push(Rule("Game length", gameParams.maxProposals, 1, 100));
        rules.push(Rule("Poll tax", gameParams.pollTax, 1, 1000000000));
        rules.push(Rule("Wealth tax", gameParams.wealthTax, 1, 100));
        rules.push(
            Rule("Wealth tax threshold", gameParams.wealthTaxThreshold, 0, 1000000000)
        );
        rules.push(Rule("Proposal fee", gameParams.proposalFee, 0, 1000000000));
        rules.push(Rule("Dividend", gameParams.dividend, 0, 1000000000));
        Player storage p = players.push();
        p.playerAddress = firstPlayer;
        p.balance = rules[uint256(RuleIndices.StartBalance)].value * 1 ether;
    }

    modifier gameActive() {
        require(
            getCompletedProposals() < rules[uint256(RuleIndices.MaxProposals)].value,
            "Game has ended"
        );
        _;
    }

    function gameFee() private view {
        // is a function because the entry fee rule won't exist when this is called
        require(
            msg.value == rules[uint256(RuleIndices.EntryFee)].value,
            "Must send required entry fee to join the game"
        );
    }

    function joinGame() external payable gameActive {
        gameFee();
        for (uint256 index = 0; index < pendingPlayers.length; index++) {
            require(
                msg.sender != pendingPlayers[index].playerAddress,
                "Already proposed to join this game"
            );
        }        
        for (uint256 index = 0; index < players.length; index++) {
            require(
                msg.sender != players[index].playerAddress,
                "You have already joined this game"
            );
        }
        Player storage p = pendingPlayers.push();
        p.playerAddress = msg.sender;
        emit CreatePlayer(p.playerAddress, p.balance);
    }

    function admitPlayer(address playerAddress) external gameActive isPlayer {
        Player storage p = players.push();
        p.playerAddress = playerAddress;
        p.balance = rules[uint256(RuleIndices.StartBalance)].value * 1 ether;
        delete pendingPlayers[getPendingPlayer(playerAddress)];
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
        require(valid, "Must have joined the game to call this function");
        _;
    }

    function subtractProposalFee() private returns (bool) {
        uint256 proposalFee = Calculations.etherToWei(
            rules[uint256(RuleIndices.ProposalFee)].value
        );
        uint256 playerIndex = getPlayer(msg.sender);
        if (proposalFee > players[playerIndex].balance) {
            return false;
        } else {
            if (proposalFee > 0) {
                players[playerIndex].balance -= proposalFee;
                emit LedgerEntry(
                    msg.sender,
                    proposalFee,
                    true,
                    players[playerIndex].balance,
                    false,
                    uint256(RuleIndices.ProposalFee)
                );
            }
        }

        return true;
    }

    function getCompletedProposals() internal view returns (uint8) {
        uint8 count = 0;
        for (uint i = 0; i < proposals.length; i++) {
            if (proposals[i].complete) count++;
        }
        return count;
    }

    function createProposal(uint256 ruleIndex, uint256 value)
        external
        gameActive
        isPlayer
    {
        require(
            ruleIndex < rules.length,
            "Proposal must apply to existing rule"
        );
        require(
            value <= rules[ruleIndex].upperBound &&
                value >= rules[ruleIndex].lowerBound,
            "Proposal value must be within bounds"
        );
        uint256 playerIndex = getPlayer(msg.sender);
        uint8 completedProposals = getCompletedProposals();
        require(
            (completedProposals + players.length - 1) % players.length == playerIndex,
            "Not your turn"
        );
        require(completedProposals == proposals.length, "Outstanding incomplete proposal");

        Proposal storage p = proposals.push(); // TODO: does this need to be storage, or can it be memory?
        p.proposer = msg.sender;
        p.ruleIndex = ruleIndex;
        p.value = value;
        p.feePaid = true;
        if (!subtractProposalFee()) {
            p.feePaid = false;
            countVotes(proposals.length - 1);
        }
    }

    function getVotesLength(
        uint256 proposalIndex
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
            "Cannot vote on completed proposal"
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
            uint256 tax = Calculations.etherToWei(
                rules[uint256(RuleIndices.PollTax)].value
            );

            if (tax > 0) {
                if (tax > players[index].balance) {
                    players[index].balance = 0;
                } else {
                    players[index].balance -= tax;
                }

                emit LedgerEntry(
                    players[index].playerAddress,
                    tax,
                    true,
                    players[index].balance,
                    false,
                    uint256(RuleIndices.PollTax)
                );
            }
        }
    }

    function collectWealthTax() private {
        for (uint256 index = 0; index < players.length; index++) {
            uint256 threshold = Calculations.etherToWei(
                rules[uint256(RuleIndices.WealthTaxThreshold)].value
            );

            if (rules[uint256(RuleIndices.WealthTax)].value > 0) {
                if (threshold < players[index].balance) {
                    uint256 taxableAmount = players[index].balance - threshold;
                    uint256 wealthTaxAmount = ((taxableAmount *
                        rules[uint256(RuleIndices.WealthTax)].value) / 100);
                    players[index].balance =
                        players[index].balance -
                        wealthTaxAmount;
                    emit LedgerEntry(
                        players[index].playerAddress,
                        wealthTaxAmount,
                        true,
                        players[index].balance,
                        false,
                        uint256(RuleIndices.WealthTax)
                    );
                }
            }
        }
    }

    function payDividend() private {
        uint dividendAmount = Calculations.etherToWei(rules[uint256(RuleIndices.Dividend)].value);
        for (uint256 index = 0; index < players.length; index++) {
            players[index].balance += dividendAmount;
            if (dividendAmount > 0) {
                emit LedgerEntry(
                    players[index].playerAddress,
                    dividendAmount,
                    false,
                    players[index].balance,
                    false,
                    uint256(RuleIndices.Dividend)
                );
            }
        }
    }

    function countVotes(uint256 proposalIndex) private {
        uint256 quorum = Calculations.calculateQuorum(
            rules[uint256(RuleIndices.Quorum)].value,
            players.length
        );

        if (
            (proposals[proposalIndex].votes.length >= quorum) ||
            (proposals[proposalIndex].feePaid == false)
        ) {
            proposals[proposalIndex].complete = true;

            if (proposals[proposalIndex].feePaid == true) {
                uint256 yesVotes;
                for (
                    uint256 index = 0;
                    index < proposals[proposalIndex].votes.length;
                    index++
                ) {
                    if (proposals[proposalIndex].votes[index].vote) yesVotes++;
                }
                uint256 majority = Calculations.calculateMajority(
                    rules[uint256(RuleIndices.Majority)].value,
                    proposals[proposalIndex].votes.length
                );
                bool successful = yesVotes > majority;
                if (successful) {
                    enactProposal(proposalIndex);
                }
            }
            collectWealthTax();
            collectPollTax();
            payDividend();
            endGame();
        }
    }

    function getPendingPlayer(address playerAddress) private view returns (uint256) {
        bool foundPlayer = false;
        for (uint256 index = 0; index < pendingPlayers.length; index++) {
            if (pendingPlayers[index].playerAddress == playerAddress) {
                foundPlayer = true;
                return index;
            }
        }
        require(foundPlayer, "Operation requested for pending player with unknown address");
    }

    function getPlayer(address playerAddress) private view returns (uint256) {
        bool foundPlayer = false;
        for (uint256 index = 0; index < players.length; index++) {
            if (players[index].playerAddress == playerAddress) {
                foundPlayer = true;
                return index;
            }
        }
        require(foundPlayer, "Operation requested for player with unknown address");
    }

    function enactProposal(uint256 proposalIndex) private {
        proposals[proposalIndex].successful = true;
        Proposal memory p = proposals[proposalIndex]; // FIXME: does using memory here use up gas?
        rules[p.ruleIndex].value = p.value;
        uint256 playerIndex = getPlayer(p.proposer);
        uint256 reward = Calculations.etherToWei(
            rules[uint256(RuleIndices.Reward)].value
        );
        players[playerIndex].balance += reward; // FIXME: is there a better way
        emit LedgerEntry(
            p.proposer,
            reward,
            false,
            players[playerIndex].balance,
            true,
            p.ruleIndex
        );
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
                uint256 share = (playerBalancesCopy[index] *
                    thisGameContractBalance) / balancesSum;
                payable(players[index].playerAddress).transfer(share);
            }
        }
    }
}
