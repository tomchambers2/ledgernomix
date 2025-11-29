// SPDX-License-Identifier: MIT
pragma solidity 0.8.1;

// import "@openzeppelin/contracts/utils/EnumerableSet.sol";

contract Game {
    address owner;
    string public name = "blahdtown";
    mapping(address => uint256) public balances;
    uint256 public numPlayers; // use EnumerableMapping?

    uint8 public constant maxPlayers = 1;

    // initial rules
    uint256 public playDirection = 1;
    uint256 public quorum = maxPlayers / 2;
    mapping(address => uint256) public vote_share;
    uint256 public reward = 10;

    uint256 public constant entranceFee = 1000 wei;

    event NewPlayer(address player);
    event NewProposal(address proposer, uint256 quantity);

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

    Proposal[] public proposals;

    function getProposalsLength() external view returns (uint256) {
        return proposals.length;
    }

    constructor() {}

    function gameSetup(address _owner, string memory _name) public {
        owner = _owner;
        name = _name;
    }

    function joinGame() public payable {
        require(numPlayers < maxPlayers, "Game is full");
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
        // require that user is a member of this game
        emit NewProposal(msg.sender, quantity);
        Proposal storage nextProposal = proposals.push();
        nextProposal.proposer = msg.sender;
        nextProposal.quantity = quantity;
        // nextProposal.proposalType = proposalType;
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
        console.log(votesFor)
        // FIXME: quorum is total voters
        return votesFor >= quorum;
    }

    function voteOnProposal(uint256 proposalIndex, bool vote) public {
        require(proposals[proposalIndex].complete == false);
        // FIXME: prevent users voting twice
        // FIXME: prevent users from voting who are not in the game
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

    function withdraw() external {
        // allow withdraw if game hasn't started
        // return stake to user
        // remove from balances
        // set num players
    }

    function endTheGame() public {}
}
