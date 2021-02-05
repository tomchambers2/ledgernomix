// SPDX-License-Identifier: MIT
pragma solidity 0.8.1;

contract Game {
    address owner;
    string public name;
    mapping(address => uint256) balances;
    uint256 numPlayers; // use EnumerableMapping?

    uint8 constant maxPlayers = 8;

    // initial rules
    uint256 playDirection = 1;
    uint256 quorum = maxPlayers / 2;
    mapping(address => uint256) vote_share;
    uint256 reward = 1;

    uint256 constant entranceFee = 1000 wei;

    event NewPlayer(address player);

    struct Proposal {
        address proposer;
        uint256 proposalType;
        uint256 quantity;
        bool complete;
        bool successful;
        Vote[] votes;
    }

    struct Vote {
        address voter;
        bool vote;
    }

    // enum ProposalTypes {Quorum, PlayDirection, VoteShare}

    Proposal[] proposals;

    constructor() {}

    function gameSetup(address _owner, string memory _name) public {
        owner = _owner;
        name = _name;
    }

    function joinGame() public payable {
        require(numPlayers < maxPlayers);
        require(msg.value > entranceFee, "The stake is 1000 wei");
        numPlayers++;
        balances[msg.sender] = 100;
        emit NewPlayer(msg.sender);
    }

    function getNumPlayers() external view returns (uint256) {
        return numPlayers;
    }

    function createProposal(uint256 quantity) public {
        require(numPlayers == maxPlayers, "Not enough people in game yet");

        Proposal storage nextProposal = proposals.push();
        nextProposal.proposer = msg.sender;
        // nextProposal.proposalType = proposalType;
        nextProposal.quantity = quantity;
    }

    function countVotes(uint256 proposalIndex) internal view returns (bool) {
        uint256 votesFor;
        for (
            uint256 index = 0;
            index < proposals[proposalIndex].votes.length;
            index++
        ) {
            if (proposals[proposalIndex].votes[index].vote) {
                votesFor++;
            }
        }
        return votesFor >= quorum;
    }

    function voteOnProposal(uint256 proposalIndex, bool vote) public {
        require(proposals[proposalIndex].complete == false);
        Vote memory v = Vote({voter: msg.sender, vote: vote});
        proposals[proposalIndex].votes.push(v);

        if (proposals[proposalIndex].votes.length >= quorum) {
            proposals[proposalIndex].complete = true;
            bool successful = countVotes(proposalIndex);
            // emit ProposalComplete(proposalIndex, successful);
            // proposals[proposalIndex].successful = countVotes();
            if (successful) {
                rewardPlayer(proposals[proposalIndex].proposer);
                reward = proposals[proposalIndex].quantity;
            }
        }
    }

    function rewardPlayer(address player) private {
        balances[player] += reward;
    }

    function enactProposal(uint256 proposalIndex) private {
        // if (proposals[proposalIndex].proposalType == ProposalTypes.Quorum) {
        //     quorum = proposals[proposalIndex].quantity;
        // } else if (
        //     proposals[proposalIndex].proposalType == ProposalTypes.PlayDirection
        // ) {
        //     playDirection = proposals[proposalIndex].quantity;
        // } else if (
        //     proposals[proposalIndex].proposalType == ProposalTypes.VoteShare
        // ) {
        //     // needs extra data to assign vote share to specific users
        // }
    }

    function endGame() public {}
}
