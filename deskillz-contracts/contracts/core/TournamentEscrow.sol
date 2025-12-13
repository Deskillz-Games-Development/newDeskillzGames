// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import "../libraries/TournamentLib.sol";
import "../libraries/RoomCodeLib.sol";
import "./DeskillzCore.sol";
import "./TokenVault.sol";

/**
 * @title TournamentEscrow
 * @author Deskillz Games
 * @notice Manages tournament creation, entries, lifecycle, and prize distribution
 * @dev Supports both public and private (room code) tournaments
 * 
 * Tournament Flow:
 * 1. SCHEDULED: Tournament created, waiting for start time
 * 2. ACTIVE: 2+ players joined, accepting entries until closing period
 * 3. CLOSING: Final hour before end, no new entries
 * 4. FINALIZING: Scores submitted, calculating rankings
 * 5. COMPLETED: Prizes distributed
 * 
 * Private Room Flow:
 * - Room admin creates tournament with room code
 * - Players request invite → admin approves → backend whitelists → player joins
 */
contract TournamentEscrow is 
    Initializable, 
    OwnableUpgradeable, 
    PausableUpgradeable, 
    ReentrancyGuardUpgradeable, 
    UUPSUpgradeable 
{
    using SafeERC20 for IERC20;

    // ============================================================================
    // State Variables
    // ============================================================================

    /// @notice Reference to DeskillzCore
    DeskillzCore public deskillzCore;

    /// @notice Reference to TokenVault
    TokenVault public tokenVault;

    /// @notice Reference to PrizePool contract
    address public prizePool;

    /// @notice All tournaments: tournamentId => Tournament
    mapping(bytes32 => TournamentLib.Tournament) public tournaments;

    /// @notice Tournament entries: tournamentId => player => Entry
    mapping(bytes32 => mapping(address => TournamentLib.TournamentEntry)) public entries;

    /// @notice Tournament player list: tournamentId => players[]
    mapping(bytes32 => address[]) public tournamentPlayers;

    /// @notice Prize distribution tiers: tournamentId => PrizeTier[]
    mapping(bytes32 => TournamentLib.PrizeTier[]) public prizeTiers;

    /// @notice Room code to tournament ID mapping (bytes8 hashed to bytes32 for mapping key)
    mapping(bytes32 => bytes32) public roomCodeToTournament;

    /// @notice Private room whitelist: tournamentId => player => whitelisted
    mapping(bytes32 => mapping(address => bool)) public roomWhitelist;

    /// @notice Invite requests: tournamentId => player => InviteRequest
    mapping(bytes32 => mapping(address => TournamentLib.InviteRequest)) public inviteRequests;

    /// @notice Pending invite players per tournament: tournamentId => players[]
    mapping(bytes32 => address[]) public pendingInvites;

    /// @notice Tournament counter for generating IDs
    uint256 public tournamentCounter;

    /// @notice Active tournaments by game: gameId => tournamentIds[]
    mapping(bytes32 => bytes32[]) public gameActiveTournaments;

    // ============================================================================
    // Events
    // ============================================================================

    event TournamentCreated(
        bytes32 indexed tournamentId,
        bytes32 indexed gameId,
        string name,
        bool isPrivate,
        bytes8 roomCode,
        address indexed creator,
        uint256 entryFee,
        address entryToken
    );

    event TournamentJoined(
        bytes32 indexed tournamentId,
        address indexed player,
        uint256 entryAmount,
        uint256 currentPlayers
    );

    event TournamentLeft(
        bytes32 indexed tournamentId,
        address indexed player,
        uint256 refundAmount
    );

    event TournamentStatusChanged(
        bytes32 indexed tournamentId,
        TournamentLib.TournamentStatus oldStatus,
        TournamentLib.TournamentStatus newStatus
    );

    event TournamentActivated(
        bytes32 indexed tournamentId,
        uint256 playerCount,
        uint256 prizePool
    );

    event TournamentCancelled(
        bytes32 indexed tournamentId,
        string reason,
        uint256 refundedPlayers
    );

    event InviteRequested(
        bytes32 indexed tournamentId,
        address indexed player,
        uint256 timestamp
    );

    event InviteApproved(
        bytes32 indexed tournamentId,
        address indexed player,
        address indexed approvedBy
    );

    event InviteDenied(
        bytes32 indexed tournamentId,
        address indexed player,
        address indexed deniedBy
    );

    event PlayerWhitelisted(
        bytes32 indexed tournamentId,
        address indexed player
    );

    event ScoresSubmitted(
        bytes32 indexed tournamentId,
        uint256 playerCount
    );

    event PrizePoolUpdated(address indexed newPrizePool);

    // ============================================================================
    // Errors
    // ============================================================================

    error InvalidAddress();
    error InvalidAmount();
    error InvalidTournament();
    error TournamentNotFound();
    error TournamentNotAcceptingEntries();
    error TournamentFull();
    error AlreadyJoined();
    error NotJoined();
    error CannotLeave();
    error InsufficientBalance();
    error InvalidRoomCode();
    error NotWhitelisted();
    error NotRoomAdmin();
    error TournamentNotPrivate();
    error AlreadyRequested();
    error InvalidPrizeDistribution();
    error TournamentCannotStart();
    error TournamentCannotCancel();
    error OnlyOperator();
    error InvalidSchedule();
    error EntryFeeBelowMinimum();
    error EntryFeeAboveMaximum();
    error TokenNotSupported();

    // ============================================================================
    // Modifiers
    // ============================================================================

    modifier onlyOperator() {
        if (!deskillzCore.isOperator(msg.sender) && msg.sender != owner()) {
            revert OnlyOperator();
        }
        _;
    }

    modifier tournamentExists(bytes32 tournamentId) {
        if (tournaments[tournamentId].createdAt == 0) {
            revert TournamentNotFound();
        }
        _;
    }

    modifier onlyRoomAdmin(bytes32 tournamentId) {
        if (tournaments[tournamentId].roomAdmin != msg.sender && msg.sender != owner()) {
            revert NotRoomAdmin();
        }
        _;
    }

    // ============================================================================
    // Initialization
    // ============================================================================

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /**
     * @notice Initialize the TournamentEscrow contract
     * @param _deskillzCore Address of DeskillzCore
     * @param _tokenVault Address of TokenVault
     */
    function initialize(
        address _deskillzCore,
        address _tokenVault
    ) external initializer {
        if (_deskillzCore == address(0) || _tokenVault == address(0)) {
            revert InvalidAddress();
        }

        __Ownable_init(msg.sender);
        __Pausable_init();
        __ReentrancyGuard_init();
        __UUPSUpgradeable_init();

        deskillzCore = DeskillzCore(_deskillzCore);
        tokenVault = TokenVault(payable(_tokenVault));
    }

    // ============================================================================
    // Tournament Creation
    // ============================================================================

    /**
     * @notice Create a public tournament (operator only)
     * @param gameId Game identifier
     * @param name Tournament name
     * @param mode SYNC or ASYNC
     * @param entryFee Entry fee amount
     * @param entryToken Token address for entry fee
     * @param minPlayers Minimum players to start
     * @param maxPlayers Maximum players allowed
     * @param scheduledStart Start timestamp
     * @param scheduledEnd End timestamp
     * @param prizeTiersData Prize distribution tiers
     * @param prizeDistType Distribution type
     */
    function createPublicTournament(
        bytes32 gameId,
        string calldata name,
        TournamentLib.TournamentMode mode,
        uint256 entryFee,
        address entryToken,
        uint256 minPlayers,
        uint256 maxPlayers,
        uint256 scheduledStart,
        uint256 scheduledEnd,
        TournamentLib.PrizeTier[] calldata prizeTiersData,
        TournamentLib.PrizeDistributionType prizeDistType
    ) external onlyOperator whenNotPaused returns (bytes32 tournamentId) {
        tournamentId = _createTournament(
            gameId,
            name,
            mode,
            false, // not private
            address(0), // no room admin
            entryFee,
            entryToken,
            minPlayers,
            maxPlayers,
            scheduledStart,
            scheduledEnd,
            prizeTiersData,
            prizeDistType
        );
    }

    /**
     * @notice Create a private room tournament
     * @dev Room admin must also participate in the tournament
     * @param gameId Game identifier
     * @param name Tournament name
     * @param mode SYNC or ASYNC
     * @param entryFee Entry fee amount (must be >= platform minimum)
     * @param entryToken Token address for entry fee
     * @param maxPlayers Maximum players allowed
     * @param scheduledStart Start timestamp
     * @param scheduledEnd End timestamp
     * @param prizeTiersData Prize distribution tiers
     * @param prizeDistType Distribution type
     */
    function createPrivateRoom(
        bytes32 gameId,
        string calldata name,
        TournamentLib.TournamentMode mode,
        uint256 entryFee,
        address entryToken,
        uint256 maxPlayers,
        uint256 scheduledStart,
        uint256 scheduledEnd,
        TournamentLib.PrizeTier[] calldata prizeTiersData,
        TournamentLib.PrizeDistributionType prizeDistType
    ) external whenNotPaused returns (bytes32 tournamentId, bytes8 roomCode) {
        // Private rooms always start with min 2 players
        tournamentId = _createTournament(
            gameId,
            name,
            mode,
            true, // private
            msg.sender, // room admin
            entryFee,
            entryToken,
            2, // min players always 2 for private
            maxPlayers,
            scheduledStart,
            scheduledEnd,
            prizeTiersData,
            prizeDistType
        );

        // Generate room code
        roomCode = RoomCodeLib.generateCodeSecure(
            tournamentId,
            msg.sender,
            block.timestamp
        );
        
        tournaments[tournamentId].roomCode = roomCode;
        
        // Use hash of roomCode as mapping key
        bytes32 roomCodeKey = RoomCodeLib.hash(roomCode);
        roomCodeToTournament[roomCodeKey] = tournamentId;

        // Auto-whitelist room admin
        roomWhitelist[tournamentId][msg.sender] = true;
        emit PlayerWhitelisted(tournamentId, msg.sender);
    }

    /**
     * @notice Internal tournament creation
     */
    function _createTournament(
        bytes32 gameId,
        string calldata name,
        TournamentLib.TournamentMode mode,
        bool isPrivate,
        address roomAdmin,
        uint256 entryFee,
        address entryToken,
        uint256 minPlayers,
        uint256 maxPlayers,
        uint256 scheduledStart,
        uint256 scheduledEnd,
        TournamentLib.PrizeTier[] calldata prizeTiersData,
        TournamentLib.PrizeDistributionType prizeDistType
    ) internal returns (bytes32 tournamentId) {
        // Validate token
        if (entryToken != address(0) && !deskillzCore.isTokenSupported(entryToken)) {
            revert TokenNotSupported();
        }

        // Validate schedule
        if (scheduledStart < block.timestamp) revert InvalidSchedule();
        if (scheduledEnd <= scheduledStart) revert InvalidSchedule();

        // Validate players
        if (minPlayers < TournamentLib.MIN_PLAYERS) minPlayers = TournamentLib.MIN_PLAYERS;
        if (maxPlayers > TournamentLib.MAX_PLAYERS) maxPlayers = TournamentLib.MAX_PLAYERS;
        if (minPlayers > maxPlayers) revert InvalidAmount();

        // Validate prize distribution
        if (!TournamentLib.validatePrizeDistribution(prizeTiersData)) {
            revert InvalidPrizeDistribution();
        }

        // Generate tournament ID
        tournamentCounter++;
        tournamentId = keccak256(abi.encodePacked(
            block.chainid,
            address(this),
            tournamentCounter,
            block.timestamp
        ));

        // Get platform settings
        uint256 platformFeeBps = deskillzCore.platformFeeBps();
        uint256 developerShareBps = deskillzCore.getEffectiveDevShare(gameId);

        // Create tournament with proper type casting
        tournaments[tournamentId] = TournamentLib.Tournament({
            id: tournamentId,
            gameId: gameId,
            name: name,
            mode: mode,
            isPrivate: isPrivate,
            roomCode: bytes8(0), // Set later for private rooms
            roomAdmin: roomAdmin,
            entryFee: entryFee,
            entryToken: entryToken,
            prizePool: 0,
            prizeToken: entryToken, // Same as entry token
            minPlayers: uint16(minPlayers),
            maxPlayers: uint16(maxPlayers),
            currentPlayers: 0,
            platformFeeBps: uint16(platformFeeBps),
            developerShareBps: uint16(developerShareBps),
            scheduledStart: uint64(scheduledStart),
            scheduledEnd: uint64(scheduledEnd),
            actualStart: 0,
            actualEnd: 0,
            status: TournamentLib.TournamentStatus.SCHEDULED,
            prizeDistType: prizeDistType,
            createdAt: uint64(block.timestamp)
        });

        // Store prize tiers
        for (uint256 i = 0; i < prizeTiersData.length; i++) {
            prizeTiers[tournamentId].push(prizeTiersData[i]);
        }

        // Add to game's active tournaments
        gameActiveTournaments[gameId].push(tournamentId);

        emit TournamentCreated(
            tournamentId,
            gameId,
            name,
            isPrivate,
            bytes8(0), // Room code set separately
            isPrivate ? roomAdmin : msg.sender,
            entryFee,
            entryToken
        );
    }

    // ============================================================================
    // Tournament Entry
    // ============================================================================

    /**
     * @notice Join a public tournament
     * @param tournamentId Tournament to join
     */
    function joinTournament(
        bytes32 tournamentId
    ) external nonReentrant whenNotPaused tournamentExists(tournamentId) {
        TournamentLib.Tournament storage t = tournaments[tournamentId];
        
        // Check tournament status using library function
        if (!TournamentLib.canAcceptEntries(t.status)) revert TournamentNotAcceptingEntries();
        if (t.currentPlayers >= t.maxPlayers) revert TournamentFull();
        if (entries[tournamentId][msg.sender].joinedAt != 0) revert AlreadyJoined();

        // Check whitelist for private tournaments
        if (t.isPrivate && !roomWhitelist[tournamentId][msg.sender]) {
            revert NotWhitelisted();
        }

        // Lock entry fee in escrow
        if (t.entryFee > 0) {
            tokenVault.lockEscrow(
                msg.sender,
                t.entryToken,
                t.entryFee,
                tournamentId
            );
        }

        // Create entry
        entries[tournamentId][msg.sender] = TournamentLib.TournamentEntry({
            player: msg.sender,
            tournamentId: tournamentId,
            entryAmount: t.entryFee,
            entryTxHash: bytes32(0),
            status: TournamentLib.EntryStatus.CONFIRMED,
            score: 0,
            rank: 0,
            prizeWon: 0,
            prizeClaimed: false,
            joinedAt: uint64(block.timestamp),
            completedAt: 0
        });

        tournamentPlayers[tournamentId].push(msg.sender);
        t.currentPlayers++;
        t.prizePool += t.entryFee;

        emit TournamentJoined(tournamentId, msg.sender, t.entryFee, t.currentPlayers);

        // Auto-activate if minimum players reached
        if (t.currentPlayers >= t.minPlayers && t.status == TournamentLib.TournamentStatus.SCHEDULED) {
            _activateTournament(tournamentId);
        }
    }

    /**
     * @notice Join a private tournament by room code
     * @param roomCode 8-character room code
     */
    function joinByRoomCode(
        bytes8 roomCode
    ) external nonReentrant whenNotPaused {
        if (!RoomCodeLib.isValidCode(roomCode)) revert InvalidRoomCode();
        
        bytes32 roomCodeKey = RoomCodeLib.hash(roomCode);
        bytes32 tournamentId = roomCodeToTournament[roomCodeKey];
        if (tournamentId == bytes32(0)) revert TournamentNotFound();

        TournamentLib.Tournament storage t = tournaments[tournamentId];
        
        // Must be whitelisted for private tournaments
        if (!roomWhitelist[tournamentId][msg.sender]) {
            revert NotWhitelisted();
        }

        // Check tournament status using library function
        if (!TournamentLib.canAcceptEntries(t.status)) revert TournamentNotAcceptingEntries();
        if (t.currentPlayers >= t.maxPlayers) revert TournamentFull();
        if (entries[tournamentId][msg.sender].joinedAt != 0) revert AlreadyJoined();

        // Lock entry fee in escrow
        if (t.entryFee > 0) {
            tokenVault.lockEscrow(
                msg.sender,
                t.entryToken,
                t.entryFee,
                tournamentId
            );
        }

        // Create entry
        entries[tournamentId][msg.sender] = TournamentLib.TournamentEntry({
            player: msg.sender,
            tournamentId: tournamentId,
            entryAmount: t.entryFee,
            entryTxHash: bytes32(0),
            status: TournamentLib.EntryStatus.CONFIRMED,
            score: 0,
            rank: 0,
            prizeWon: 0,
            prizeClaimed: false,
            joinedAt: uint64(block.timestamp),
            completedAt: 0
        });

        tournamentPlayers[tournamentId].push(msg.sender);
        t.currentPlayers++;
        t.prizePool += t.entryFee;

        emit TournamentJoined(tournamentId, msg.sender, t.entryFee, t.currentPlayers);

        // Auto-activate if minimum players reached
        if (t.currentPlayers >= t.minPlayers && t.status == TournamentLib.TournamentStatus.SCHEDULED) {
            _activateTournament(tournamentId);
        }
    }

    /**
     * @notice Leave a tournament (before it starts)
     * @param tournamentId Tournament to leave
     */
    function leaveTournament(
        bytes32 tournamentId
    ) external nonReentrant whenNotPaused tournamentExists(tournamentId) {
        TournamentLib.Tournament storage t = tournaments[tournamentId];
        TournamentLib.TournamentEntry storage entry = entries[tournamentId][msg.sender];

        if (entry.joinedAt == 0) revert NotJoined();
        if (entry.status != TournamentLib.EntryStatus.CONFIRMED) revert CannotLeave();
        
        // Room admin cannot leave their own tournament
        if (t.isPrivate && t.roomAdmin == msg.sender) revert CannotLeave();

        // Can only leave before tournament actually starts playing
        if (t.status != TournamentLib.TournamentStatus.SCHEDULED && 
            t.status != TournamentLib.TournamentStatus.ACTIVE) {
            revert CannotLeave();
        }

        // Release escrow
        if (entry.entryAmount > 0) {
            tokenVault.releaseEscrow(
                msg.sender,
                t.entryToken,
                entry.entryAmount,
                tournamentId
            );
        }

        entry.status = TournamentLib.EntryStatus.REFUNDED;
        t.currentPlayers--;
        t.prizePool -= entry.entryAmount;

        emit TournamentLeft(tournamentId, msg.sender, entry.entryAmount);
    }

    // ============================================================================
    // Private Room Management
    // ============================================================================

    /**
     * @notice Request to join a private tournament
     * @param tournamentId Tournament to request access to
     */
    function requestInvite(
        bytes32 tournamentId
    ) external whenNotPaused tournamentExists(tournamentId) {
        TournamentLib.Tournament storage t = tournaments[tournamentId];
        
        if (!t.isPrivate) revert TournamentNotPrivate();
        if (roomWhitelist[tournamentId][msg.sender]) revert AlreadyJoined();
        if (inviteRequests[tournamentId][msg.sender].requestedAt != 0) revert AlreadyRequested();

        inviteRequests[tournamentId][msg.sender] = TournamentLib.InviteRequest({
            player: msg.sender,
            tournamentId: tournamentId,
            requestedAt: uint64(block.timestamp),
            status: 0 // pending
        });

        pendingInvites[tournamentId].push(msg.sender);

        emit InviteRequested(tournamentId, msg.sender, block.timestamp);
    }

    /**
     * @notice Approve a player's invite request (room admin only)
     * @param tournamentId Tournament ID
     * @param player Player to approve
     */
    function approveInvite(
        bytes32 tournamentId,
        address player
    ) external whenNotPaused tournamentExists(tournamentId) onlyRoomAdmin(tournamentId) {
        TournamentLib.InviteRequest storage request = inviteRequests[tournamentId][player];
        
        if (request.requestedAt == 0) revert InvalidAddress();
        if (request.status != 0) revert AlreadyRequested();

        request.status = 1; // approved
        roomWhitelist[tournamentId][player] = true;

        emit InviteApproved(tournamentId, player, msg.sender);
        emit PlayerWhitelisted(tournamentId, player);
    }

    /**
     * @notice Deny a player's invite request (room admin only)
     * @param tournamentId Tournament ID
     * @param player Player to deny
     */
    function denyInvite(
        bytes32 tournamentId,
        address player
    ) external whenNotPaused tournamentExists(tournamentId) onlyRoomAdmin(tournamentId) {
        TournamentLib.InviteRequest storage request = inviteRequests[tournamentId][player];
        
        if (request.requestedAt == 0) revert InvalidAddress();
        if (request.status != 0) revert AlreadyRequested();

        request.status = 2; // denied

        emit InviteDenied(tournamentId, player, msg.sender);
    }

    /**
     * @notice Whitelist a player for private tournament (operator only)
     * @dev Called by backend after room admin approves
     * @param tournamentId Tournament ID
     * @param player Player to whitelist
     */
    function whitelistPlayer(
        bytes32 tournamentId,
        address player
    ) external onlyOperator tournamentExists(tournamentId) {
        if (!tournaments[tournamentId].isPrivate) revert TournamentNotPrivate();
        
        roomWhitelist[tournamentId][player] = true;
        emit PlayerWhitelisted(tournamentId, player);
    }

    /**
     * @notice Batch whitelist players (operator only)
     * @param tournamentId Tournament ID
     * @param players Players to whitelist
     */
    function whitelistPlayersBatch(
        bytes32 tournamentId,
        address[] calldata players
    ) external onlyOperator tournamentExists(tournamentId) {
        if (!tournaments[tournamentId].isPrivate) revert TournamentNotPrivate();
        
        for (uint256 i = 0; i < players.length; i++) {
            roomWhitelist[tournamentId][players[i]] = true;
            emit PlayerWhitelisted(tournamentId, players[i]);
        }
    }

    // ============================================================================
    // Tournament Lifecycle Management
    // ============================================================================

    /**
     * @notice Manually activate tournament (operator only)
     * @param tournamentId Tournament to activate
     */
    function startTournament(
        bytes32 tournamentId
    ) external onlyOperator tournamentExists(tournamentId) {
        TournamentLib.Tournament storage t = tournaments[tournamentId];
        
        if (t.status != TournamentLib.TournamentStatus.SCHEDULED) revert TournamentCannotStart();
        if (t.currentPlayers < t.minPlayers) revert TournamentCannotStart();

        _activateTournament(tournamentId);
    }

    /**
     * @notice Internal tournament activation
     */
    function _activateTournament(bytes32 tournamentId) internal {
        TournamentLib.Tournament storage t = tournaments[tournamentId];
        
        TournamentLib.TournamentStatus oldStatus = t.status;
        t.status = TournamentLib.TournamentStatus.ACTIVE;
        t.actualStart = uint64(block.timestamp);

        emit TournamentStatusChanged(tournamentId, oldStatus, TournamentLib.TournamentStatus.ACTIVE);
        emit TournamentActivated(tournamentId, t.currentPlayers, t.prizePool);
    }

    /**
     * @notice Move tournament to closing phase (operator only)
     * @param tournamentId Tournament ID
     */
    function setClosing(
        bytes32 tournamentId
    ) external onlyOperator tournamentExists(tournamentId) {
        TournamentLib.Tournament storage t = tournaments[tournamentId];
        
        if (t.status != TournamentLib.TournamentStatus.ACTIVE) revert InvalidTournament();

        TournamentLib.TournamentStatus oldStatus = t.status;
        t.status = TournamentLib.TournamentStatus.CLOSING;

        emit TournamentStatusChanged(tournamentId, oldStatus, TournamentLib.TournamentStatus.CLOSING);
    }

    /**
     * @notice Cancel a tournament (operator only)
     * @param tournamentId Tournament to cancel
     * @param reason Cancellation reason
     */
    function cancelTournament(
        bytes32 tournamentId,
        string calldata reason
    ) external onlyOperator tournamentExists(tournamentId) {
        TournamentLib.Tournament storage t = tournaments[tournamentId];
        
        if (!TournamentLib.canCancel(t.status)) revert TournamentCannotCancel();

        // Refund all players
        address[] memory players = tournamentPlayers[tournamentId];
        uint256 refundCount = 0;

        for (uint256 i = 0; i < players.length; i++) {
            TournamentLib.TournamentEntry storage entry = entries[tournamentId][players[i]];
            if (entry.status == TournamentLib.EntryStatus.CONFIRMED && entry.entryAmount > 0) {
                tokenVault.releaseEscrow(
                    players[i],
                    t.entryToken,
                    entry.entryAmount,
                    tournamentId
                );
                entry.status = TournamentLib.EntryStatus.REFUNDED;
                refundCount++;
            }
        }

        TournamentLib.TournamentStatus oldStatus = t.status;
        t.status = TournamentLib.TournamentStatus.CANCELLED;
        t.actualEnd = uint64(block.timestamp);

        emit TournamentStatusChanged(tournamentId, oldStatus, TournamentLib.TournamentStatus.CANCELLED);
        emit TournamentCancelled(tournamentId, reason, refundCount);
    }

    /**
     * @notice Cancel private room (room admin only, before start)
     * @param tournamentId Tournament to cancel
     */
    function cancelPrivateRoom(
        bytes32 tournamentId
    ) external nonReentrant whenNotPaused tournamentExists(tournamentId) onlyRoomAdmin(tournamentId) {
        TournamentLib.Tournament storage t = tournaments[tournamentId];
        
        if (!t.isPrivate) revert TournamentNotPrivate();
        if (t.status != TournamentLib.TournamentStatus.SCHEDULED) revert TournamentCannotCancel();

        // Refund all players
        address[] memory players = tournamentPlayers[tournamentId];
        uint256 refundCount = 0;

        for (uint256 i = 0; i < players.length; i++) {
            TournamentLib.TournamentEntry storage entry = entries[tournamentId][players[i]];
            if (entry.status == TournamentLib.EntryStatus.CONFIRMED && entry.entryAmount > 0) {
                tokenVault.releaseEscrow(
                    players[i],
                    t.entryToken,
                    entry.entryAmount,
                    tournamentId
                );
                entry.status = TournamentLib.EntryStatus.REFUNDED;
                refundCount++;
            }
        }

        TournamentLib.TournamentStatus oldStatus = t.status;
        t.status = TournamentLib.TournamentStatus.CANCELLED;
        t.actualEnd = uint64(block.timestamp);

        emit TournamentStatusChanged(tournamentId, oldStatus, TournamentLib.TournamentStatus.CANCELLED);
        emit TournamentCancelled(tournamentId, "Cancelled by room admin", refundCount);
    }

    // ============================================================================
    // Score Submission & Finalization (Called by ScoreValidator/Backend)
    // ============================================================================

    /**
     * @notice Submit final rankings for tournament (operator only)
     * @dev Called by backend after verifying scores
     * @param tournamentId Tournament ID
     * @param rankings Final player rankings
     */
    function submitRankings(
        bytes32 tournamentId,
        TournamentLib.RankingEntry[] calldata rankings
    ) external onlyOperator tournamentExists(tournamentId) {
        TournamentLib.Tournament storage t = tournaments[tournamentId];
        
        if (t.status != TournamentLib.TournamentStatus.ACTIVE && 
            t.status != TournamentLib.TournamentStatus.CLOSING) {
            revert InvalidTournament();
        }

        // Update entry scores and ranks
        for (uint256 i = 0; i < rankings.length; i++) {
            TournamentLib.TournamentEntry storage entry = entries[tournamentId][rankings[i].player];
            if (entry.joinedAt == 0) continue;
            
            entry.score = rankings[i].score;
            entry.rank = rankings[i].rank;
            entry.status = TournamentLib.EntryStatus.COMPLETED;
            entry.completedAt = uint64(block.timestamp);
        }

        // Move to finalizing
        TournamentLib.TournamentStatus oldStatus = t.status;
        t.status = TournamentLib.TournamentStatus.FINALIZING;

        emit TournamentStatusChanged(tournamentId, oldStatus, TournamentLib.TournamentStatus.FINALIZING);
        emit ScoresSubmitted(tournamentId, rankings.length);
    }

    /**
     * @notice Finalize tournament and trigger prize distribution
     * @param tournamentId Tournament ID
     */
    function finalizeTournament(
        bytes32 tournamentId
    ) external onlyOperator tournamentExists(tournamentId) {
        TournamentLib.Tournament storage t = tournaments[tournamentId];
        
        if (t.status != TournamentLib.TournamentStatus.FINALIZING) revert InvalidTournament();
        if (prizePool == address(0)) revert InvalidAddress();

        // Mark as completed
        TournamentLib.TournamentStatus oldStatus = t.status;
        t.status = TournamentLib.TournamentStatus.COMPLETED;
        t.actualEnd = uint64(block.timestamp);

        emit TournamentStatusChanged(tournamentId, oldStatus, TournamentLib.TournamentStatus.COMPLETED);

        // Prize distribution is handled by PrizePool contract
        // Called separately to allow gas optimization
    }

    // ============================================================================
    // Admin Functions
    // ============================================================================

    /**
     * @notice Set PrizePool contract address
     * @param _prizePool New PrizePool address
     */
    function setPrizePool(address _prizePool) external onlyOwner {
        if (_prizePool == address(0)) revert InvalidAddress();
        prizePool = _prizePool;
        emit PrizePoolUpdated(_prizePool);
    }

    /**
     * @notice Update DeskillzCore reference
     * @param _deskillzCore New DeskillzCore address
     */
    function setDeskillzCore(address _deskillzCore) external onlyOwner {
        if (_deskillzCore == address(0)) revert InvalidAddress();
        deskillzCore = DeskillzCore(_deskillzCore);
    }

    /**
     * @notice Update TokenVault reference
     * @param _tokenVault New TokenVault address
     */
    function setTokenVault(address _tokenVault) external onlyOwner {
        if (_tokenVault == address(0)) revert InvalidAddress();
        tokenVault = TokenVault(payable(_tokenVault));
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    // ============================================================================
    // View Functions
    // ============================================================================

    /**
     * @notice Get tournament details
     * @param tournamentId Tournament ID
     */
    function getTournament(
        bytes32 tournamentId
    ) external view returns (TournamentLib.Tournament memory) {
        return tournaments[tournamentId];
    }

    /**
     * @notice Get entry details
     * @param tournamentId Tournament ID
     * @param player Player address
     */
    function getEntry(
        bytes32 tournamentId,
        address player
    ) external view returns (TournamentLib.TournamentEntry memory) {
        return entries[tournamentId][player];
    }

    /**
     * @notice Get all players in tournament
     * @param tournamentId Tournament ID
     */
    function getTournamentPlayers(
        bytes32 tournamentId
    ) external view returns (address[] memory) {
        return tournamentPlayers[tournamentId];
    }

    /**
     * @notice Get prize tiers for tournament
     * @param tournamentId Tournament ID
     */
    function getPrizeTiers(
        bytes32 tournamentId
    ) external view returns (TournamentLib.PrizeTier[] memory) {
        return prizeTiers[tournamentId];
    }

    /**
     * @notice Get tournament by room code
     * @param roomCode Room code
     */
    function getTournamentByRoomCode(
        bytes8 roomCode
    ) external view returns (bytes32) {
        bytes32 roomCodeKey = RoomCodeLib.hash(roomCode);
        return roomCodeToTournament[roomCodeKey];
    }

    /**
     * @notice Check if player is whitelisted
     * @param tournamentId Tournament ID
     * @param player Player address
     */
    function isWhitelisted(
        bytes32 tournamentId,
        address player
    ) external view returns (bool) {
        return roomWhitelist[tournamentId][player];
    }

    /**
     * @notice Get pending invites for tournament
     * @param tournamentId Tournament ID
     */
    function getPendingInvites(
        bytes32 tournamentId
    ) external view returns (address[] memory) {
        return pendingInvites[tournamentId];
    }

    /**
     * @notice Get active tournaments for a game
     * @param gameId Game ID
     */
    function getGameActiveTournaments(
        bytes32 gameId
    ) external view returns (bytes32[] memory) {
        return gameActiveTournaments[gameId];
    }

    /**
     * @notice Check if tournament is accepting entries
     * @param tournamentId Tournament ID
     */
    function canJoin(bytes32 tournamentId) external view returns (bool) {
        TournamentLib.Tournament storage t = tournaments[tournamentId];
        return TournamentLib.canAcceptEntries(t.status) && t.currentPlayers < t.maxPlayers;
    }

    /**
     * @notice Get room code as string
     * @param tournamentId Tournament ID
     */
    function getRoomCodeString(bytes32 tournamentId) external view returns (string memory) {
        return RoomCodeLib.toString(tournaments[tournamentId].roomCode);
    }

    // ============================================================================
    // Upgrade Authorization
    // ============================================================================

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    function version() external pure returns (string memory) {
        return "1.0.0";
    }
}
