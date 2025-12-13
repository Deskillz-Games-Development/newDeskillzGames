// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

/**
 * @title DeskillzCore
 * @author Deskillz Games
 * @notice Central configuration and settings contract for the Deskillz platform
 * @dev Upgradeable contract using UUPS pattern
 *      Controls: platform fees, supported tokens, entry limits, developer shares
 *      Only the platform admin (owner) can modify settings
 */
contract DeskillzCore is 
    Initializable, 
    OwnableUpgradeable, 
    PausableUpgradeable, 
    ReentrancyGuardUpgradeable,
    UUPSUpgradeable 
{
    // ============================================================================
    // CONSTANTS
    // ============================================================================
    
    /// @notice Maximum basis points (100%)
    uint256 public constant MAX_BPS = 10000;
    
    /// @notice Maximum platform fee (50%)
    uint256 public constant MAX_PLATFORM_FEE_BPS = 5000;
    
    /// @notice Maximum developer share (100% of platform fee)
    uint256 public constant MAX_DEVELOPER_SHARE_BPS = 10000;
    
    /// @notice Version for upgrade tracking
    string public constant VERSION = "1.0.0";
    
    // ============================================================================
    // STATE VARIABLES
    // ============================================================================
    
    /// @notice Platform fee in basis points (e.g., 1000 = 10%)
    uint256 public platformFeeBps;
    
    /// @notice Developer share of platform fee in basis points (e.g., 7000 = 70%)
    uint256 public developerShareBps;
    
    /// @notice Minimum entry fee in USD (scaled by 10^18, e.g., 1e18 = $1)
    uint256 public minEntryFeeUsd;
    
    /// @notice Maximum entry fee in USD (scaled by 10^18)
    uint256 public maxEntryFeeUsd;
    
    /// @notice Wallet that receives platform's share of fees
    address public platformWallet;
    
    /// @notice TokenVault contract address
    address public tokenVault;
    
    /// @notice TournamentEscrow contract address
    address public tournamentEscrow;
    
    /// @notice PrizePool contract address
    address public prizePool;
    
    /// @notice ScoreValidator contract address
    address public scoreValidator;
    
    /// @notice DeveloperPayout contract address
    address public developerPayout;
    
    /// @notice Mapping of supported tokens (address => isSupported)
    mapping(address => bool) public supportedTokens;
    
    /// @notice Array of supported token addresses for enumeration
    address[] public supportedTokenList;
    
    /// @notice Game developer wallet addresses (gameId => developerWallet)
    mapping(bytes32 => address) public gameDevelopers;
    
    /// @notice Per-game developer share override (gameId => shareBps, 0 = use default)
    mapping(bytes32 => uint256) public gameDevShareOverride;
    
    /// @notice Backend operator addresses that can submit scores/results
    mapping(address => bool) public operators;
    
    /// @notice Nonce for unique ID generation
    uint256 private _nonce;
    
    // ============================================================================
    // EVENTS
    // ============================================================================
    
    event PlatformFeeUpdated(uint256 oldFee, uint256 newFee);
    event DeveloperShareUpdated(uint256 oldShare, uint256 newShare);
    event EntryLimitsUpdated(uint256 minFee, uint256 maxFee);
    event PlatformWalletUpdated(address oldWallet, address newWallet);
    event TokenAdded(address indexed token, string symbol);
    event TokenRemoved(address indexed token);
    event GameDeveloperSet(bytes32 indexed gameId, address developer);
    event GameDevShareOverrideSet(bytes32 indexed gameId, uint256 shareBps);
    event OperatorUpdated(address indexed operator, bool status);
    event ContractAddressUpdated(string contractName, address contractAddress);
    
    // ============================================================================
    // ERRORS
    // ============================================================================
    
    error InvalidFee();
    error InvalidAddress();
    error TokenAlreadySupported();
    error TokenNotSupported();
    error InvalidShare();
    error InvalidLimits();
    error NotOperator();
    
    // ============================================================================
    // MODIFIERS
    // ============================================================================
    
    /**
     * @notice Restrict to platform operators
     */
    modifier onlyOperator() {
        if (!operators[msg.sender] && msg.sender != owner()) {
            revert NotOperator();
        }
        _;
    }
    
    // ============================================================================
    // INITIALIZER
    // ============================================================================
    
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }
    
    /**
     * @notice Initialize the contract
     * @param _owner Platform admin address
     * @param _platformWallet Wallet to receive platform fees
     * @param _platformFeeBps Initial platform fee (basis points)
     * @param _developerShareBps Initial developer share (basis points)
     */
    function initialize(
        address _owner,
        address _platformWallet,
        uint256 _platformFeeBps,
        uint256 _developerShareBps
    ) external initializer {
        if (_owner == address(0)) revert InvalidAddress();
        if (_platformWallet == address(0)) revert InvalidAddress();
        if (_platformFeeBps > MAX_PLATFORM_FEE_BPS) revert InvalidFee();
        if (_developerShareBps > MAX_DEVELOPER_SHARE_BPS) revert InvalidShare();
        
        __Ownable_init(_owner);
        __Pausable_init();
        __ReentrancyGuard_init();
        __UUPSUpgradeable_init();
        
        platformWallet = _platformWallet;
        platformFeeBps = _platformFeeBps;
        developerShareBps = _developerShareBps;
        
        // Default entry limits: $1 - $1000
        minEntryFeeUsd = 1 ether; // 1e18 = $1
        maxEntryFeeUsd = 1000 ether; // 1000e18 = $1000
        
        // Owner is also an operator by default
        operators[_owner] = true;
    }
    
    // ============================================================================
    // ADMIN FUNCTIONS - Platform Settings
    // ============================================================================
    
    /**
     * @notice Update the platform fee percentage
     * @param newFeeBps New fee in basis points (max 5000 = 50%)
     */
    function setPlatformFee(uint256 newFeeBps) external onlyOwner {
        if (newFeeBps > MAX_PLATFORM_FEE_BPS) revert InvalidFee();
        
        uint256 oldFee = platformFeeBps;
        platformFeeBps = newFeeBps;
        
        emit PlatformFeeUpdated(oldFee, newFeeBps);
    }
    
    /**
     * @notice Update the developer share of platform fee
     * @param newShareBps New share in basis points (max 10000 = 100%)
     */
    function setDeveloperShare(uint256 newShareBps) external onlyOwner {
        if (newShareBps > MAX_DEVELOPER_SHARE_BPS) revert InvalidShare();
        
        uint256 oldShare = developerShareBps;
        developerShareBps = newShareBps;
        
        emit DeveloperShareUpdated(oldShare, newShareBps);
    }
    
    /**
     * @notice Update entry fee limits
     * @param newMinFee Minimum entry fee in USD (scaled by 10^18)
     * @param newMaxFee Maximum entry fee in USD (scaled by 10^18)
     */
    function setEntryLimits(uint256 newMinFee, uint256 newMaxFee) external onlyOwner {
        if (newMinFee > newMaxFee) revert InvalidLimits();
        if (newMinFee == 0) revert InvalidLimits();
        
        minEntryFeeUsd = newMinFee;
        maxEntryFeeUsd = newMaxFee;
        
        emit EntryLimitsUpdated(newMinFee, newMaxFee);
    }
    
    /**
     * @notice Update the platform fee receiving wallet
     * @param newWallet New wallet address
     */
    function setPlatformWallet(address newWallet) external onlyOwner {
        if (newWallet == address(0)) revert InvalidAddress();
        
        address oldWallet = platformWallet;
        platformWallet = newWallet;
        
        emit PlatformWalletUpdated(oldWallet, newWallet);
    }
    
    // ============================================================================
    // ADMIN FUNCTIONS - Token Management
    // ============================================================================
    
    /**
     * @notice Add a supported token
     * @param token Token contract address (address(0) for native BNB)
     * @param symbol Token symbol for logging
     */
    function addSupportedToken(address token, string calldata symbol) external onlyOwner {
        if (supportedTokens[token]) revert TokenAlreadySupported();
        
        supportedTokens[token] = true;
        supportedTokenList.push(token);
        
        emit TokenAdded(token, symbol);
    }
    
    /**
     * @notice Remove a supported token
     * @param token Token contract address
     */
    function removeSupportedToken(address token) external onlyOwner {
        if (!supportedTokens[token]) revert TokenNotSupported();
        
        supportedTokens[token] = false;
        
        // Remove from list (swap and pop)
        for (uint256 i = 0; i < supportedTokenList.length; i++) {
            if (supportedTokenList[i] == token) {
                supportedTokenList[i] = supportedTokenList[supportedTokenList.length - 1];
                supportedTokenList.pop();
                break;
            }
        }
        
        emit TokenRemoved(token);
    }
    
    /**
     * @notice Batch add supported tokens
     * @param tokens Array of token addresses
     * @param symbols Array of token symbols
     */
    function addSupportedTokensBatch(
        address[] calldata tokens,
        string[] calldata symbols
    ) external onlyOwner {
        require(tokens.length == symbols.length, "Array length mismatch");
        
        for (uint256 i = 0; i < tokens.length; i++) {
            if (!supportedTokens[tokens[i]]) {
                supportedTokens[tokens[i]] = true;
                supportedTokenList.push(tokens[i]);
                emit TokenAdded(tokens[i], symbols[i]);
            }
        }
    }
    
    // ============================================================================
    // ADMIN FUNCTIONS - Game & Developer Management
    // ============================================================================
    
    /**
     * @notice Register a game developer
     * @param gameId Game UUID as bytes32
     * @param developer Developer wallet address
     */
    function setGameDeveloper(bytes32 gameId, address developer) external onlyOwner {
        if (developer == address(0)) revert InvalidAddress();
        
        gameDevelopers[gameId] = developer;
        
        emit GameDeveloperSet(gameId, developer);
    }
    
    /**
     * @notice Set per-game developer share override
     * @param gameId Game UUID as bytes32
     * @param shareBps Developer share in basis points (0 to use default)
     */
    function setGameDevShareOverride(bytes32 gameId, uint256 shareBps) external onlyOwner {
        if (shareBps > MAX_DEVELOPER_SHARE_BPS) revert InvalidShare();
        
        gameDevShareOverride[gameId] = shareBps;
        
        emit GameDevShareOverrideSet(gameId, shareBps);
    }
    
    /**
     * @notice Batch register game developers
     * @param gameIds Array of game UUIDs
     * @param developers Array of developer addresses
     */
    function setGameDevelopersBatch(
        bytes32[] calldata gameIds,
        address[] calldata developers
    ) external onlyOwner {
        require(gameIds.length == developers.length, "Array length mismatch");
        
        for (uint256 i = 0; i < gameIds.length; i++) {
            if (developers[i] != address(0)) {
                gameDevelopers[gameIds[i]] = developers[i];
                emit GameDeveloperSet(gameIds[i], developers[i]);
            }
        }
    }
    
    // ============================================================================
    // ADMIN FUNCTIONS - Operator Management
    // ============================================================================
    
    /**
     * @notice Add or remove a backend operator
     * @param operator Operator address
     * @param status True to add, false to remove
     */
    function setOperator(address operator, bool status) external onlyOwner {
        if (operator == address(0)) revert InvalidAddress();
        
        operators[operator] = status;
        
        emit OperatorUpdated(operator, status);
    }
    
    /**
     * @notice Batch update operators
     * @param operatorAddresses Array of operator addresses
     * @param statuses Array of status values
     */
    function setOperatorsBatch(
        address[] calldata operatorAddresses,
        bool[] calldata statuses
    ) external onlyOwner {
        require(operatorAddresses.length == statuses.length, "Array length mismatch");
        
        for (uint256 i = 0; i < operatorAddresses.length; i++) {
            if (operatorAddresses[i] != address(0)) {
                operators[operatorAddresses[i]] = statuses[i];
                emit OperatorUpdated(operatorAddresses[i], statuses[i]);
            }
        }
    }
    
    // ============================================================================
    // ADMIN FUNCTIONS - Contract Addresses
    // ============================================================================
    
    /**
     * @notice Set TokenVault contract address
     * @param _tokenVault TokenVault address
     */
    function setTokenVault(address _tokenVault) external onlyOwner {
        if (_tokenVault == address(0)) revert InvalidAddress();
        tokenVault = _tokenVault;
        emit ContractAddressUpdated("TokenVault", _tokenVault);
    }
    
    /**
     * @notice Set TournamentEscrow contract address
     * @param _tournamentEscrow TournamentEscrow address
     */
    function setTournamentEscrow(address _tournamentEscrow) external onlyOwner {
        if (_tournamentEscrow == address(0)) revert InvalidAddress();
        tournamentEscrow = _tournamentEscrow;
        emit ContractAddressUpdated("TournamentEscrow", _tournamentEscrow);
    }
    
    /**
     * @notice Set PrizePool contract address
     * @param _prizePool PrizePool address
     */
    function setPrizePool(address _prizePool) external onlyOwner {
        if (_prizePool == address(0)) revert InvalidAddress();
        prizePool = _prizePool;
        emit ContractAddressUpdated("PrizePool", _prizePool);
    }
    
    /**
     * @notice Set ScoreValidator contract address
     * @param _scoreValidator ScoreValidator address
     */
    function setScoreValidator(address _scoreValidator) external onlyOwner {
        if (_scoreValidator == address(0)) revert InvalidAddress();
        scoreValidator = _scoreValidator;
        emit ContractAddressUpdated("ScoreValidator", _scoreValidator);
    }
    
    /**
     * @notice Set DeveloperPayout contract address
     * @param _developerPayout DeveloperPayout address
     */
    function setDeveloperPayout(address _developerPayout) external onlyOwner {
        if (_developerPayout == address(0)) revert InvalidAddress();
        developerPayout = _developerPayout;
        emit ContractAddressUpdated("DeveloperPayout", _developerPayout);
    }
    
    /**
     * @notice Set all contract addresses at once
     */
    function setAllContracts(
        address _tokenVault,
        address _tournamentEscrow,
        address _prizePool,
        address _scoreValidator,
        address _developerPayout
    ) external onlyOwner {
        if (_tokenVault != address(0)) {
            tokenVault = _tokenVault;
            emit ContractAddressUpdated("TokenVault", _tokenVault);
        }
        if (_tournamentEscrow != address(0)) {
            tournamentEscrow = _tournamentEscrow;
            emit ContractAddressUpdated("TournamentEscrow", _tournamentEscrow);
        }
        if (_prizePool != address(0)) {
            prizePool = _prizePool;
            emit ContractAddressUpdated("PrizePool", _prizePool);
        }
        if (_scoreValidator != address(0)) {
            scoreValidator = _scoreValidator;
            emit ContractAddressUpdated("ScoreValidator", _scoreValidator);
        }
        if (_developerPayout != address(0)) {
            developerPayout = _developerPayout;
            emit ContractAddressUpdated("DeveloperPayout", _developerPayout);
        }
    }
    
    // ============================================================================
    // ADMIN FUNCTIONS - Pause/Unpause
    // ============================================================================
    
    /**
     * @notice Pause the platform (emergency)
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @notice Unpause the platform
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    // ============================================================================
    // VIEW FUNCTIONS
    // ============================================================================
    
    /**
     * @notice Check if a token is supported
     * @param token Token address
     * @return True if supported
     */
    function isTokenSupported(address token) external view returns (bool) {
        return supportedTokens[token];
    }
    
    /**
     * @notice Get all supported tokens
     * @return Array of supported token addresses
     */
    function getSupportedTokens() external view returns (address[] memory) {
        return supportedTokenList;
    }
    
    /**
     * @notice Get the number of supported tokens
     * @return Count of supported tokens
     */
    function getSupportedTokenCount() external view returns (uint256) {
        return supportedTokenList.length;
    }
    
    /**
     * @notice Get developer wallet for a game
     * @param gameId Game UUID
     * @return Developer wallet address
     */
    function getGameDeveloper(bytes32 gameId) external view returns (address) {
        return gameDevelopers[gameId];
    }
    
    /**
     * @notice Get effective developer share for a game
     * @param gameId Game UUID
     * @return Developer share in basis points
     */
    function getEffectiveDevShare(bytes32 gameId) external view returns (uint256) {
        uint256 override_ = gameDevShareOverride[gameId];
        return override_ > 0 ? override_ : developerShareBps;
    }
    
    /**
     * @notice Check if an address is an operator
     * @param operator Address to check
     * @return True if operator
     */
    function isOperator(address operator) external view returns (bool) {
        return operators[operator] || operator == owner();
    }
    
    /**
     * @notice Get platform configuration summary
     * @return _platformFeeBps Platform fee
     * @return _developerShareBps Developer share
     * @return _minEntryFeeUsd Minimum entry fee
     * @return _maxEntryFeeUsd Maximum entry fee
     * @return _platformWallet Platform wallet
     */
    function getPlatformConfig() external view returns (
        uint256 _platformFeeBps,
        uint256 _developerShareBps,
        uint256 _minEntryFeeUsd,
        uint256 _maxEntryFeeUsd,
        address _platformWallet
    ) {
        return (
            platformFeeBps,
            developerShareBps,
            minEntryFeeUsd,
            maxEntryFeeUsd,
            platformWallet
        );
    }
    
    /**
     * @notice Get all contract addresses
     */
    function getContractAddresses() external view returns (
        address _tokenVault,
        address _tournamentEscrow,
        address _prizePool,
        address _scoreValidator,
        address _developerPayout
    ) {
        return (
            tokenVault,
            tournamentEscrow,
            prizePool,
            scoreValidator,
            developerPayout
        );
    }
    
    /**
     * @notice Calculate platform fee for an amount
     * @param amount Entry fee amount
     * @return fee Platform fee amount
     */
    function calculatePlatformFee(uint256 amount) external view returns (uint256 fee) {
        return (amount * platformFeeBps) / MAX_BPS;
    }
    
    /**
     * @notice Calculate developer share from platform fee
     * @param platformFee Platform fee amount
     * @param gameId Game UUID (for per-game overrides)
     * @return devShare Developer share amount
     * @return platformShare Platform's share amount
     */
    function calculateShares(
        uint256 platformFee,
        bytes32 gameId
    ) external view returns (uint256 devShare, uint256 platformShare) {
        uint256 effectiveShare = gameDevShareOverride[gameId];
        if (effectiveShare == 0) {
            effectiveShare = developerShareBps;
        }
        
        devShare = (platformFee * effectiveShare) / MAX_BPS;
        platformShare = platformFee - devShare;
    }
    
    /**
     * @notice Generate next unique nonce
     * @return nonce Unique nonce value
     */
    function getNextNonce() external returns (uint256 nonce) {
        nonce = _nonce;
        _nonce++;
    }
    
    // ============================================================================
    // UPGRADE AUTHORIZATION
    // ============================================================================
    
    /**
     * @notice Authorize upgrade (only owner)
     */
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
}
