// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Vote {

    // Structs
    struct Voter {
        string name;
        uint age;
        uint voterId;
        Gender gender;
        uint voterCandidateId;
        address voterAddress;
    }

    struct Candidate {
        string name;
        string party;
        uint age;
        Gender gender;
        uint candidateId;
        address candidateAddress; 
        uint votes; 
    }

    // Enums
    enum VotingStatus { NotStarted, InProgress, Ended }
    enum Gender { NotSpecified, Male, Female, Other }

    // State variables
    address public electionComission;
    address[] public admins;
    uint public startTime;
    uint public endTime;
    bool public stopVoting;
    uint private nextVoterId = 1;
    uint private nextCandidateId = 1;

    // Mappings
    mapping (uint => Voter) public voterDetails;
    mapping (uint => Candidate) public candidateDetails;
    mapping (address => bool) public isAdmin;

    // Winner details
    uint public winnerId;
    string public winnerName;
    uint public winnerVotes;
    address public winnerAddress;

    IERC20 public CkToken;

    // Events
    event ElectionReset(address indexed commissioner, uint timestamp);
    event AdminAdded(address indexed newAdmin, uint timestamp);
    event AdminRemoved(address indexed admin, uint timestamp);

    // Constructor
    constructor(address _CkToken) {
        CkToken = IERC20(_CkToken);
        electionComission = msg.sender;
        isAdmin[msg.sender] = true;
        admins.push(msg.sender);
    }

    // Modifiers
    modifier onlyComissioner() {
        require(msg.sender == electionComission, "Not authorized");
        _;
    }

    modifier onlyAdmin() {
        require(isAdmin[msg.sender], "Only admin can perform this action");
        _;
    }

    modifier isVotingOver() {
        require(block.timestamp <= endTime && block.timestamp >= startTime && !stopVoting, "Voting not allowed now");
        _;
    }

    modifier isValidAge(uint _age) {
        require(_age >= 18, "Not Eligible for Voting");
        _;
    }

    // Registration functions
    function registerVoter(string calldata _name, uint _age, Gender _gender) external isValidAge(_age) {
        require(isVoterNotRegistered(msg.sender), "You are already registered as a voter");
        voterDetails[nextVoterId] = Voter({
            name: _name,
            age: _age,
            voterId: nextVoterId,
            gender: _gender,
            voterCandidateId: 0,
            voterAddress: msg.sender
        });
        nextVoterId++;
    }

    function registerCandidate(string calldata _name, string calldata _party, uint _age, Gender _gender) external isValidAge(_age) {
        require(isCandidateNotRegistered(msg.sender), "You are already registered as a candidate");
        require(msg.sender != electionComission, "Election commission cannot register as a candidate");
        candidateDetails[nextCandidateId] = Candidate({
            name: _name,
            party: _party,
            age: _age,
            gender: _gender,
            candidateId: nextCandidateId,
            candidateAddress: msg.sender,
            votes: 0
        });
        nextCandidateId++;
    }

    // Utility functions
    function isCandidateNotRegistered(address _person) private view returns(bool) {
        for (uint i = 1; i < nextCandidateId; i++) {
            if (candidateDetails[i].candidateAddress == _person) {
                return false;
            }
        }
        return true;
    }

    function isVoterNotRegistered(address _person) private view returns(bool) {
        for (uint i = 1; i < nextVoterId; i++) {
            if (voterDetails[i].voterAddress == _person) {
                return false;
            }
        }
        return true;
    }

    // Voting functions
    function vote(uint _voterId, uint _candidateId) external isVotingOver {
        require (CkToken.balanceOf(msg.sender)>0, "Not allowed");
        require(voterDetails[_voterId].voterAddress == msg.sender, "You are not registered for voting");
        require(voterDetails[_voterId].voterCandidateId == 0, "You have already voted");
        require(candidateDetails[_candidateId].candidateId == _candidateId, "Candidate not found");
        require(msg.sender != candidateDetails[_candidateId].candidateAddress, "Candidates cannot vote for themselves");
        
        voterDetails[_voterId].voterCandidateId = _candidateId;
        candidateDetails[_candidateId].votes++;
    }

    // Administrative functions
    function setVotingPeriod(uint _startTimeDuration, uint _endTimeDuration) external onlyAdmin {
        require(_startTimeDuration < _endTimeDuration, "Start time must be less than end time");

        startTime = _startTimeDuration;
        endTime = _endTimeDuration;
    }

    function StopVoting() external onlyAdmin {
        stopVoting = true;
    }

    function getVotingStatus() external view returns (VotingStatus) {
        if (startTime == 0) {
            return VotingStatus.NotStarted;
        } else if (block.timestamp >= startTime && block.timestamp <= endTime) {
            return VotingStatus.InProgress;
        } else {
            return VotingStatus.Ended;
        }
    }

    function announceVotingResult() external onlyAdmin {
        uint maxVotes = 0;
        uint winningCandidateId;

        // Find the candidate with the highest number of votes
        for (uint i = 1; i < nextCandidateId; i++) {
            if (candidateDetails[i].votes > maxVotes) {
                maxVotes = candidateDetails[i].votes;
                winningCandidateId = candidateDetails[i].candidateId;
            }
        }

        // Set the winner's details
        winnerId = winningCandidateId;
        winnerName = candidateDetails[winningCandidateId].name;
        winnerVotes = maxVotes;
        winnerAddress = candidateDetails[winningCandidateId].candidateAddress;
    }

    // Reset election data function
    function resetElection() external onlyComissioner {
        // Reset voting times
        startTime = 0;
        endTime = 0;
        stopVoting = false;
        
        // Reset winner details
        winnerId = 0;
        winnerName = "";
        winnerVotes = 0;
        winnerAddress = address(0);
        
        // Reset voter and candidate IDs
        nextVoterId = 1;
        nextCandidateId = 1;
        
        emit ElectionReset(msg.sender, block.timestamp);
    }
    
    // Admin management functions
    function addAdmin(address _newAdmin) external onlyComissioner {
        require(_newAdmin != address(0), "Invalid address");
        require(!isAdmin[_newAdmin], "Address is already an admin");
        
        isAdmin[_newAdmin] = true;
        admins.push(_newAdmin);
        
        emit AdminAdded(_newAdmin, block.timestamp);
    }
    
    function removeAdmin(address _admin) external onlyComissioner {
        require(_admin != electionComission, "Cannot remove election commissioner");
        require(isAdmin[_admin], "Address is not an admin");
        
        isAdmin[_admin] = false;
        
        // Remove from admins array
        for (uint i = 0; i < admins.length; i++) {
            if (admins[i] == _admin) {
                admins[i] = admins[admins.length - 1];
                admins.pop();
                break;
            }
        }
        
        emit AdminRemoved(_admin, block.timestamp);
    }
    
    function getAdmins() external view returns (address[] memory) {
        return admins;
    }

    // Getter functions
    function getCandidateList() external view returns (Candidate[] memory) {
        Candidate[] memory candidates = new Candidate[](nextCandidateId - 1);
        for (uint i = 1; i < nextCandidateId; i++) {
            candidates[i - 1] = candidateDetails[i];
        }
        return candidates;
    }

    function getVoterList() external view returns (Voter[] memory) {
        Voter[] memory voters = new Voter[](nextVoterId - 1);
        for (uint i = 1; i < nextVoterId; i++) {
            voters[i - 1] = voterDetails[i];
        }
        return voters;
    }
}