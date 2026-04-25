// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./ValidaToken.sol";

contract ValidaCore {
    ValidaToken public token;

    uint256 public constant STAY_FEE = 0.001 ether;
    uint256 public constant TOKENS_PER_REVIEW = 10 * 10**18;
    uint8 public constant MIN_SCORE = 4;

    struct Host {
        string name;
        string description;
        string location;
        bool isAvailable;
        bool isRegistered;
        uint256 totalStays;
        uint256 totalScore;
        uint256 reviewCount;
    }

    struct StayRequest {
        address traveler;
        address host;
        uint256 createdAt;
        StayStatus status;
        uint8 hostScore;
        uint8 travelerScore;
        string hostComment;
        string travelerComment;
        bool hostReviewed;
        bool travelerReviewed;
    }

    enum StayStatus { Pending, Accepted, CheckedIn, Completed, Rejected }

    mapping(address => Host) public hosts;
    mapping(uint256 => StayRequest) public stays;
    address[] public hostList;
    uint256 public stayCount;
    address public owner;
    uint256 public platformFees;

    event HostRegistered(address indexed host, string name, string location);
    event StayRequested(uint256 indexed stayId, address indexed traveler, address indexed host);
    event StayAccepted(uint256 indexed stayId);
    event CheckedIn(uint256 indexed stayId);
    event ReviewSubmitted(uint256 indexed stayId, address reviewer, uint8 score);
    event StayCompleted(uint256 indexed stayId);

    constructor(address _token) {
        token = ValidaToken(_token);
        owner = msg.sender;
    }

    function registerHost(
        string calldata _name,
        string calldata _description,
        string calldata _location
    ) external {
        require(!hosts[msg.sender].isRegistered, "Already registered");
        hosts[msg.sender] = Host({
            name: _name,
            description: _description,
            location: _location,
            isAvailable: true,
            isRegistered: true,
            totalStays: 0,
            totalScore: 0,
            reviewCount: 0
        });
        hostList.push(msg.sender);
        emit HostRegistered(msg.sender, _name, _location);
    }

    function requestStay(address _host) external payable returns (uint256) {
        require(msg.value >= STAY_FEE, "Insufficient fee");
        require(hosts[_host].isRegistered, "Host not registered");
        require(hosts[_host].isAvailable, "Host not available");
        require(_host != msg.sender, "Cannot request own stay");

        uint256 stayId = stayCount++;
        stays[stayId] = StayRequest({
            traveler: msg.sender,
            host: _host,
            createdAt: block.timestamp,
            status: StayStatus.Pending,
            hostScore: 0,
            travelerScore: 0,
            hostComment: "",
            travelerComment: "",
            hostReviewed: false,
            travelerReviewed: false
        });

        uint256 hostShare = (msg.value * 70) / 100;
        uint256 platformShare = (msg.value * 20) / 100;
        platformFees += platformShare;
        payable(_host).transfer(hostShare);

        emit StayRequested(stayId, msg.sender, _host);
        return stayId;
    }

    function acceptStay(uint256 _stayId) external {
        StayRequest storage stay = stays[_stayId];
        require(stay.host == msg.sender, "Not the host");
        require(stay.status == StayStatus.Pending, "Not pending");
        stay.status = StayStatus.Accepted;
        emit StayAccepted(_stayId);
    }

    function checkIn(uint256 _stayId) external {
        StayRequest storage stay = stays[_stayId];
        require(stay.traveler == msg.sender || stay.host == msg.sender, "Not participant");
        require(stay.status == StayStatus.Accepted, "Not accepted");
        stay.status = StayStatus.CheckedIn;
        emit CheckedIn(_stayId);
    }

    function submitReview(uint256 _stayId, uint8 _score, string calldata _comment) external {
        require(_score >= 1 && _score <= 5, "Score 1-5");
        StayRequest storage stay = stays[_stayId];
        require(stay.status == StayStatus.CheckedIn, "Not checked in");

        if (msg.sender == stay.traveler) {
            require(!stay.hostReviewed, "Already reviewed");
            stay.hostScore = _score;
            stay.hostComment = _comment;
            stay.hostReviewed = true;
        } else if (msg.sender == stay.host) {
            require(!stay.travelerReviewed, "Already reviewed");
            stay.travelerScore = _score;
            stay.travelerComment = _comment;
            stay.travelerReviewed = true;
        } else {
            revert("Not participant");
        }

        emit ReviewSubmitted(_stayId, msg.sender, _score);

        if (stay.hostReviewed && stay.travelerReviewed) {
            _completeStay(_stayId);
        }
    }

    function _completeStay(uint256 _stayId) internal {
        StayRequest storage stay = stays[_stayId];
        stay.status = StayStatus.Completed;

        Host storage h = hosts[stay.host];
        h.totalStays++;
        h.totalScore += stay.hostScore;
        h.reviewCount++;

        if (stay.hostScore >= MIN_SCORE) {
            uint256 multiplier = h.reviewCount > 10 ? 2 : 1;
            token.mint(stay.host, TOKENS_PER_REVIEW * multiplier);
        }
        if (stay.travelerScore >= MIN_SCORE) {
            token.mint(stay.traveler, TOKENS_PER_REVIEW / 2);
        }

        emit StayCompleted(_stayId);
    }

    function getHostCount() external view returns (uint256) {
        return hostList.length;
    }

    function getHostAddress(uint256 index) external view returns (address) {
        return hostList[index];
    }

    function getHostReputation(address _host) external view returns (uint256) {
        Host memory h = hosts[_host];
        if (h.reviewCount == 0) return 0;
        return h.totalScore / h.reviewCount;
    }

    function withdrawPlatformFees() external {
        require(msg.sender == owner, "Not owner");
        uint256 amount = platformFees;
        platformFees = 0;
        payable(owner).transfer(amount);
    }
}
