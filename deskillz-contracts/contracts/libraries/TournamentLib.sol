// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

/**
 * @title TournamentLib
 * @author Deskillz Games
 * @notice Shared data structures and utilities for the Deskillz tournament system
 * @dev Used across TournamentEscrow, PrizePool, and related contracts
 */
library TournamentLib {
    // ============================================================================
    // CONSTANTS
    // ============================================================================
    
    /// @notice Maximum percentage value (100% = 10000 basis points)
    uint256 public constant MAX_BPS = 10000;
    
    /// @notice Maximum number of prize tiers/positions
    uint256 public constant MAX_PRIZE_TIERS = 100;
    
    /// @notice Maximum players per tournament
    uint256 public constant MAX_PLAYERS = 10000;
    
    /// @notice Minimum players to start a tournament
    uint256 public constant MIN_PLAYERS = 2;
    
    /// @notice Room code length (8 characters)
    uint256 public constant ROOM_CODE_LENGTH = 8;
    
    /// @notice Closing period before tournament ends (1 hour in seconds)
    uint256 public constant CLOSING_PERIOD = 1 hours;
    
    // ============================================================================
    // ENUMS
    // ============================================================================
    
    /**
     * @notice Tournament status lifecycle
     * @dev Status flow: SCHEDULED -> ACTIVE -> CLOSING -> FINALIZING -> COMPLETED
     *      Can also go to CANCELLED from SCHEDULED or ACTIVE
     */
    enum TournamentStatus {
        SCHEDULED,      // Created, waiting for start time or min players
        ACTIVE,         // 2+ players joined, accepting new entries
        CLOSING,        // Final hour before end, no new entries
        FINALIZING,     // Processing results, distributing prizes
        COMPLETED,      // All prizes distributed
        CANCELLED       // Tournament cancelled, refunds processed
    }
    
    /**
     * @notice Tournament game mode
     */
    enum TournamentMode {
        SYNC,   // Synchronous - players play at the same time
        ASYNC   // Asynchronous - players can play anytime within window
    }
    
    /**
     * @notice Prize distribution type
     */
    enum PrizeDistributionType {
        POSITION_BASED, // Specific positions get specific percentages (1st: 50%, 2nd: 30%, etc.)
        TIER_BASED      // Top X% share a percentage (top 10% share 60%, etc.)
    }
    
    /**
     * @notice Player entry status within a tournament
     */
    enum EntryStatus {
        PENDING,        // Entry created, payment not confirmed
        CONFIRMED,      // Payment confirmed, waiting for tournament start
        PLAYING,        // Currently playing in the tournament
        COMPLETED,      // Finished playing, score submitted
        FORFEITED,      // Did not complete the tournament
        REFUNDED        // Entry fee refunded (tournament cancelled or left early)
    }
    
    // ============================================================================
    // STRUCTS
    // ============================================================================
    
    /**
     * @notice Tournament configuration and state
     * @param id Unique tournament identifier (UUID from backend)
     * @param gameId Game identifier (UUID)
     * @param name Human-readable tournament name
     * @param mode SYNC or ASYNC gameplay
     * @param isPrivate Whether this is a private room tournament
     * @param roomCode 8-character room code (only for private tournaments)
     * @param roomAdmin Creator of private room (must also participate)
     * @param entryFee Entry fee amount
     * @param entryToken Token address for entry fee (address(0) for native BNB)
     * @param prizePool Total prize pool amount
     * @param prizeToken Token address for prizes (usually same as entryToken)
     * @param minPlayers Minimum players to start
     * @param maxPlayers Maximum players allowed
     * @param currentPlayers Current number of confirmed players
     * @param platformFeeBps Platform fee in basis points
     * @param developerShareBps Developer share of platform fee in basis points
     * @param scheduledStart Timestamp when tournament should start
     * @param scheduledEnd Timestamp when tournament should end
     * @param actualStart Timestamp when tournament actually started
     * @param actualEnd Timestamp when tournament actually ended
     * @param status Current tournament status
     * @param prizeDistType Type of prize distribution
     * @param createdAt Creation timestamp
     */
    struct Tournament {
        bytes32 id;                     // 32 bytes - UUID converted to bytes32
        bytes32 gameId;                 // 32 bytes - Game UUID
        string name;                    // Variable
        TournamentMode mode;            // 1 byte
        bool isPrivate;                 // 1 byte
        bytes8 roomCode;                // 8 bytes
        address roomAdmin;              // 20 bytes
        uint256 entryFee;               // 32 bytes
        address entryToken;             // 20 bytes
        uint256 prizePool;              // 32 bytes
        address prizeToken;             // 20 bytes
        uint16 minPlayers;              // 2 bytes
        uint16 maxPlayers;              // 2 bytes
        uint16 currentPlayers;          // 2 bytes
        uint16 platformFeeBps;          // 2 bytes (basis points, max 10000)
        uint16 developerShareBps;       // 2 bytes (basis points, max 10000)
        uint64 scheduledStart;          // 8 bytes
        uint64 scheduledEnd;            // 8 bytes
        uint64 actualStart;             // 8 bytes
        uint64 actualEnd;               // 8 bytes
        TournamentStatus status;        // 1 byte
        PrizeDistributionType prizeDistType; // 1 byte
        uint64 createdAt;               // 8 bytes
    }
    
    /**
     * @notice Prize tier configuration
     * @dev For POSITION_BASED: position is the rank (1, 2, 3...)
     *      For TIER_BASED: position represents percentile threshold (10 = top 10%)
     * @param position Rank position or percentile threshold
     * @param percentageBps Percentage of prize pool in basis points
     */
    struct PrizeTier {
        uint16 position;        // Rank position (1-based) or percentile
        uint16 percentageBps;   // Percentage in basis points (max 10000)
    }
    
    /**
     * @notice Player entry in a tournament
     * @param player Player wallet address
     * @param tournamentId Tournament ID
     * @param entryAmount Amount paid for entry
     * @param entryTxHash Transaction hash of entry payment
     * @param status Current entry status
     * @param score Final score (0 until completed)
     * @param rank Final rank (0 until finalized)
     * @param prizeWon Prize amount won (0 if not in prize positions)
     * @param prizeClaimed Whether prize has been claimed
     * @param joinedAt Timestamp when player joined
     * @param completedAt Timestamp when player finished
     */
    struct TournamentEntry {
        address player;             // 20 bytes
        bytes32 tournamentId;       // 32 bytes
        uint256 entryAmount;        // 32 bytes
        bytes32 entryTxHash;        // 32 bytes
        EntryStatus status;         // 1 byte
        uint64 score;               // 8 bytes
        uint16 rank;                // 2 bytes
        uint256 prizeWon;           // 32 bytes
        bool prizeClaimed;          // 1 byte
        uint64 joinedAt;            // 8 bytes
        uint64 completedAt;         // 8 bytes
    }
    
    /**
     * @notice Final ranking entry for prize distribution
     * @param player Player address
     * @param score Player's final score
     * @param rank Final rank (1-based)
     */
    struct RankingEntry {
        address player;
        uint64 score;
        uint16 rank;
    }
    
    /**
     * @notice Private room invite request
     * @param player Requesting player address
     * @param tournamentId Tournament ID
     * @param requestedAt Request timestamp
     * @param status 0 = pending, 1 = approved, 2 = denied
     */
    struct InviteRequest {
        address player;
        bytes32 tournamentId;
        uint64 requestedAt;
        uint8 status;
    }
    
    // ============================================================================
    // UTILITY FUNCTIONS
    // ============================================================================
    
    /**
     * @notice Convert a UUID string to bytes32
     * @dev UUID format: "550e8400-e29b-41d4-a716-446655440000"
     * @param uuid The UUID string (with or without hyphens)
     * @return bytes32 representation
     */
    function uuidToBytes32(string memory uuid) internal pure returns (bytes32) {
        bytes memory uuidBytes = bytes(uuid);
        bytes memory cleanBytes = new bytes(32);
        uint256 j = 0;
        
        for (uint256 i = 0; i < uuidBytes.length && j < 32; i++) {
            bytes1 char = uuidBytes[i];
            // Skip hyphens
            if (char != 0x2D) { // '-' = 0x2D
                // Convert hex char to nibble
                uint8 nibble;
                if (char >= 0x30 && char <= 0x39) {
                    nibble = uint8(char) - 0x30; // '0'-'9'
                } else if (char >= 0x61 && char <= 0x66) {
                    nibble = uint8(char) - 0x61 + 10; // 'a'-'f'
                } else if (char >= 0x41 && char <= 0x46) {
                    nibble = uint8(char) - 0x41 + 10; // 'A'-'F'
                } else {
                    continue;
                }
                
                // Combine nibbles into bytes
                if (j % 2 == 0) {
                    cleanBytes[j / 2] = bytes1(nibble << 4);
                } else {
                    cleanBytes[j / 2] = bytes1(uint8(cleanBytes[j / 2]) | nibble);
                }
                j++;
            }
        }
        
        return bytes32(cleanBytes);
    }
    
    /**
     * @notice Convert bytes32 to UUID string
     * @param data The bytes32 data
     * @return UUID string with hyphens
     */
    function bytes32ToUuid(bytes32 data) internal pure returns (string memory) {
        bytes memory hexChars = "0123456789abcdef";
        bytes memory result = new bytes(36); // 32 hex + 4 hyphens
        uint256 j = 0;
        
        for (uint256 i = 0; i < 16; i++) {
            // Add hyphens at positions 4, 6, 8, 10
            if (i == 4 || i == 6 || i == 8 || i == 10) {
                result[j++] = "-";
            }
            
            uint8 b = uint8(data[i]);
            result[j++] = hexChars[b >> 4];
            result[j++] = hexChars[b & 0x0f];
        }
        
        return string(result);
    }
    
    /**
     * @notice Calculate prize amount for a specific rank
     * @param prizePool Total prize pool
     * @param percentageBps Percentage in basis points
     * @return Prize amount
     */
    function calculatePrizeAmount(
        uint256 prizePool,
        uint16 percentageBps
    ) internal pure returns (uint256) {
        return (prizePool * percentageBps) / MAX_BPS;
    }
    
    /**
     * @notice Calculate platform fee from entry amount
     * @param entryAmount Entry fee amount
     * @param platformFeeBps Platform fee in basis points
     * @return Platform fee amount
     */
    function calculatePlatformFee(
        uint256 entryAmount,
        uint16 platformFeeBps
    ) internal pure returns (uint256) {
        return (entryAmount * platformFeeBps) / MAX_BPS;
    }
    
    /**
     * @notice Calculate developer share from platform fee
     * @param platformFee Platform fee amount
     * @param developerShareBps Developer share in basis points
     * @return Developer share amount
     */
    function calculateDeveloperShare(
        uint256 platformFee,
        uint16 developerShareBps
    ) internal pure returns (uint256) {
        return (platformFee * developerShareBps) / MAX_BPS;
    }
    
    /**
     * @notice Validate prize distribution totals 100%
     * @param tiers Array of prize tiers
     * @return True if valid
     */
    function validatePrizeDistribution(
        PrizeTier[] memory tiers
    ) internal pure returns (bool) {
        if (tiers.length == 0 || tiers.length > MAX_PRIZE_TIERS) {
            return false;
        }
        
        uint256 totalBps = 0;
        for (uint256 i = 0; i < tiers.length; i++) {
            totalBps += tiers[i].percentageBps;
        }
        
        return totalBps == MAX_BPS;
    }
    
    /**
     * @notice Check if tournament is in a state that allows new entries
     * @param status Current tournament status
     * @return True if entries are allowed
     */
    function canAcceptEntries(TournamentStatus status) internal pure returns (bool) {
        return status == TournamentStatus.SCHEDULED || status == TournamentStatus.ACTIVE;
    }
    
    /**
     * @notice Check if tournament can be cancelled
     * @param status Current tournament status
     * @return True if cancellation is allowed
     */
    function canCancel(TournamentStatus status) internal pure returns (bool) {
        return status == TournamentStatus.SCHEDULED || status == TournamentStatus.ACTIVE;
    }
    
    /**
     * @notice Check if tournament is in progress
     * @param status Current tournament status
     * @return True if tournament is active or closing
     */
    function isInProgress(TournamentStatus status) internal pure returns (bool) {
        return status == TournamentStatus.ACTIVE || status == TournamentStatus.CLOSING;
    }
    
    /**
     * @notice Check if tournament has ended
     * @param status Current tournament status
     * @return True if tournament is finalizing or completed
     */
    function hasEnded(TournamentStatus status) internal pure returns (bool) {
        return status == TournamentStatus.FINALIZING || 
               status == TournamentStatus.COMPLETED ||
               status == TournamentStatus.CANCELLED;
    }
    
    // ============================================================================
    // EVENTS (defined here for consistency)
    // ============================================================================
    
    event TournamentCreated(
        bytes32 indexed tournamentId,
        bytes32 indexed gameId,
        address indexed creator,
        bool isPrivate,
        bytes8 roomCode,
        uint256 entryFee,
        address entryToken
    );
    
    event TournamentStatusChanged(
        bytes32 indexed tournamentId,
        TournamentStatus oldStatus,
        TournamentStatus newStatus
    );
    
    event PlayerJoined(
        bytes32 indexed tournamentId,
        address indexed player,
        uint256 entryAmount
    );
    
    event PlayerLeft(
        bytes32 indexed tournamentId,
        address indexed player,
        uint256 refundAmount
    );
    
    event ScoreSubmitted(
        bytes32 indexed tournamentId,
        address indexed player,
        uint64 score
    );
    
    event PrizeDistributed(
        bytes32 indexed tournamentId,
        address indexed player,
        uint16 rank,
        uint256 amount
    );
    
    event TournamentFinalized(
        bytes32 indexed tournamentId,
        uint256 totalPrizePool,
        uint256 platformFee,
        uint256 developerShare
    );
    
    // ============================================================================
    // ERRORS (defined here for consistency)
    // ============================================================================
    
    error InvalidTournamentId();
    error TournamentNotFound();
    error TournamentNotActive();
    error TournamentAlreadyStarted();
    error TournamentFull();
    error TournamentNotEnoughPlayers();
    error InvalidEntryFee();
    error InvalidPrizeDistribution();
    error AlreadyJoined();
    error NotJoined();
    error NotRoomAdmin();
    error NotWhitelisted();
    error RoomCodeRequired();
    error InvalidRoomCode();
    error CannotCancelAfterStart();
    error PrizeAlreadyClaimed();
    error NoPrizeToClaim();
    error TransferFailed();
    error InvalidRankings();
    error Unauthorized();
}
