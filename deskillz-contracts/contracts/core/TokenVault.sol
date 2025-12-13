// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import "./DeskillzCore.sol";

/**
 * @title TokenVault
 * @author Deskillz Games
 * @notice Multi-token vault for holding tournament entry fees, prizes, and platform funds
 * @dev Supports BNB (native) and ERC20 tokens (USDT, USDC, BUSD)
 * 
 * Key features:
 * - User deposits and withdrawals
 * - Escrow for tournament entry fees
 * - Authorized contract withdrawals (TournamentEscrow, PrizePool)
 * - Balance tracking per user per token
 * - Emergency withdrawal by admin
 */
contract TokenVault is 
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

    /// @notice Reference to DeskillzCore for token validation
    DeskillzCore public deskillzCore;

    /// @notice User balances: user => token => balance (address(0) for BNB)
    mapping(address => mapping(address => uint256)) public userBalances;

    /// @notice Escrow balances (locked for tournaments): user => token => balance
    mapping(address => mapping(address => uint256)) public escrowBalances;

    /// @notice Total vault balance per token (for accounting verification)
    mapping(address => uint256) public totalVaultBalance;

    /// @notice Contracts authorized to move funds (TournamentEscrow, PrizePool, etc.)
    mapping(address => bool) public authorizedContracts;

    /// @notice Minimum deposit amounts per token
    mapping(address => uint256) public minDeposit;

    /// @notice Maximum deposit amounts per token (0 = no limit)
    mapping(address => uint256) public maxDeposit;

    /// @notice Withdrawal cooldown per user (prevents rapid withdrawals)
    mapping(address => uint256) public lastWithdrawalTime;

    /// @notice Withdrawal cooldown period in seconds
    uint256 public withdrawalCooldown;

    /// @notice Native token address constant
    address public constant NATIVE_TOKEN = address(0);

    // ============================================================================
    // Events
    // ============================================================================

    event Deposited(
        address indexed user,
        address indexed token,
        uint256 amount,
        uint256 newBalance
    );

    event Withdrawn(
        address indexed user,
        address indexed token,
        uint256 amount,
        uint256 newBalance
    );

    event EscrowLocked(
        address indexed user,
        address indexed token,
        uint256 amount,
        bytes32 indexed tournamentId
    );

    event EscrowReleased(
        address indexed user,
        address indexed token,
        uint256 amount,
        bytes32 indexed tournamentId
    );

    event EscrowTransferred(
        address indexed from,
        address indexed to,
        address indexed token,
        uint256 amount,
        bytes32 tournamentId
    );

    event AuthorizedContractUpdated(address indexed contractAddress, bool authorized);
    event DepositLimitsUpdated(address indexed token, uint256 minAmount, uint256 maxAmount);
    event WithdrawalCooldownUpdated(uint256 newCooldown);
    event EmergencyWithdrawal(address indexed token, uint256 amount, address indexed recipient);
    event DeskillzCoreUpdated(address indexed newCore);

    // ============================================================================
    // Errors
    // ============================================================================

    error InvalidAddress();
    error InvalidAmount();
    error InsufficientBalance();
    error InsufficientEscrow();
    error TokenNotSupported();
    error UnauthorizedContract();
    error DepositBelowMinimum();
    error DepositAboveMaximum();
    error WithdrawalCooldownActive();
    error TransferFailed();
    error InvalidCoreContract();

    // ============================================================================
    // Modifiers
    // ============================================================================

    modifier onlyAuthorizedContract() {
        if (!authorizedContracts[msg.sender] && msg.sender != owner()) {
            revert UnauthorizedContract();
        }
        _;
    }

    modifier validToken(address token) {
        if (token != NATIVE_TOKEN && !deskillzCore.isTokenSupported(token)) {
            revert TokenNotSupported();
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
     * @notice Initialize the TokenVault contract
     * @param _deskillzCore Address of the DeskillzCore contract
     * @param _withdrawalCooldown Initial withdrawal cooldown in seconds
     */
    function initialize(
        address _deskillzCore,
        uint256 _withdrawalCooldown
    ) external initializer {
        if (_deskillzCore == address(0)) revert InvalidAddress();

        __Ownable_init(msg.sender);
        __Pausable_init();
        __ReentrancyGuard_init();
        __UUPSUpgradeable_init();

        deskillzCore = DeskillzCore(_deskillzCore);
        withdrawalCooldown = _withdrawalCooldown;
    }

    // ============================================================================
    // User Deposit Functions
    // ============================================================================

    /**
     * @notice Deposit native token (BNB) into the vault
     */
    function depositNative() external payable nonReentrant whenNotPaused {
        if (msg.value == 0) revert InvalidAmount();
        
        _validateDepositLimits(NATIVE_TOKEN, msg.value);
        
        userBalances[msg.sender][NATIVE_TOKEN] += msg.value;
        totalVaultBalance[NATIVE_TOKEN] += msg.value;

        emit Deposited(msg.sender, NATIVE_TOKEN, msg.value, userBalances[msg.sender][NATIVE_TOKEN]);
    }

    /**
     * @notice Deposit ERC20 token into the vault
     * @param token Address of the ERC20 token
     * @param amount Amount to deposit
     */
    function depositToken(
        address token, 
        uint256 amount
    ) external nonReentrant whenNotPaused validToken(token) {
        if (token == NATIVE_TOKEN) revert InvalidAddress();
        if (amount == 0) revert InvalidAmount();
        
        _validateDepositLimits(token, amount);

        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        
        userBalances[msg.sender][token] += amount;
        totalVaultBalance[token] += amount;

        emit Deposited(msg.sender, token, amount, userBalances[msg.sender][token]);
    }

    // ============================================================================
    // User Withdrawal Functions
    // ============================================================================

    /**
     * @notice Withdraw native token (BNB) from the vault
     * @param amount Amount to withdraw
     */
    function withdrawNative(uint256 amount) external nonReentrant whenNotPaused {
        if (amount == 0) revert InvalidAmount();
        if (userBalances[msg.sender][NATIVE_TOKEN] < amount) revert InsufficientBalance();
        
        _checkWithdrawalCooldown(msg.sender);

        userBalances[msg.sender][NATIVE_TOKEN] -= amount;
        totalVaultBalance[NATIVE_TOKEN] -= amount;
        lastWithdrawalTime[msg.sender] = block.timestamp;

        (bool success, ) = msg.sender.call{value: amount}("");
        if (!success) revert TransferFailed();

        emit Withdrawn(msg.sender, NATIVE_TOKEN, amount, userBalances[msg.sender][NATIVE_TOKEN]);
    }

    /**
     * @notice Withdraw ERC20 token from the vault
     * @param token Address of the ERC20 token
     * @param amount Amount to withdraw
     */
    function withdrawToken(
        address token, 
        uint256 amount
    ) external nonReentrant whenNotPaused validToken(token) {
        if (token == NATIVE_TOKEN) revert InvalidAddress();
        if (amount == 0) revert InvalidAmount();
        if (userBalances[msg.sender][token] < amount) revert InsufficientBalance();
        
        _checkWithdrawalCooldown(msg.sender);

        userBalances[msg.sender][token] -= amount;
        totalVaultBalance[token] -= amount;
        lastWithdrawalTime[msg.sender] = block.timestamp;

        IERC20(token).safeTransfer(msg.sender, amount);

        emit Withdrawn(msg.sender, token, amount, userBalances[msg.sender][token]);
    }

    // ============================================================================
    // Escrow Functions (Called by Authorized Contracts)
    // ============================================================================

    /**
     * @notice Lock user funds into escrow for tournament entry
     * @param user Address of the user
     * @param token Token address (address(0) for BNB)
     * @param amount Amount to lock
     * @param tournamentId Tournament identifier
     */
    function lockEscrow(
        address user,
        address token,
        uint256 amount,
        bytes32 tournamentId
    ) external onlyAuthorizedContract nonReentrant {
        if (user == address(0)) revert InvalidAddress();
        if (amount == 0) revert InvalidAmount();
        if (userBalances[user][token] < amount) revert InsufficientBalance();

        userBalances[user][token] -= amount;
        escrowBalances[user][token] += amount;

        emit EscrowLocked(user, token, amount, tournamentId);
    }

    /**
     * @notice Release escrow back to user balance (e.g., tournament cancelled)
     * @param user Address of the user
     * @param token Token address
     * @param amount Amount to release
     * @param tournamentId Tournament identifier
     */
    function releaseEscrow(
        address user,
        address token,
        uint256 amount,
        bytes32 tournamentId
    ) external onlyAuthorizedContract nonReentrant {
        if (user == address(0)) revert InvalidAddress();
        if (amount == 0) revert InvalidAmount();
        if (escrowBalances[user][token] < amount) revert InsufficientEscrow();

        escrowBalances[user][token] -= amount;
        userBalances[user][token] += amount;

        emit EscrowReleased(user, token, amount, tournamentId);
    }

    /**
     * @notice Transfer escrow from one user to another (prize distribution)
     * @param from Source user address
     * @param to Destination user address
     * @param token Token address
     * @param amount Amount to transfer
     * @param tournamentId Tournament identifier
     */
    function transferEscrow(
        address from,
        address to,
        address token,
        uint256 amount,
        bytes32 tournamentId
    ) external onlyAuthorizedContract nonReentrant {
        if (from == address(0) || to == address(0)) revert InvalidAddress();
        if (amount == 0) revert InvalidAmount();
        if (escrowBalances[from][token] < amount) revert InsufficientEscrow();

        escrowBalances[from][token] -= amount;
        userBalances[to][token] += amount;

        emit EscrowTransferred(from, to, token, amount, tournamentId);
    }

    /**
     * @notice Deduct from escrow (for platform fees, developer share)
     * @param user Address of the user
     * @param token Token address
     * @param amount Amount to deduct
     * @param recipient Address to receive the funds
     * @param tournamentId Tournament identifier
     */
    function deductEscrow(
        address user,
        address token,
        uint256 amount,
        address recipient,
        bytes32 tournamentId
    ) external onlyAuthorizedContract nonReentrant {
        if (user == address(0) || recipient == address(0)) revert InvalidAddress();
        if (amount == 0) revert InvalidAmount();
        if (escrowBalances[user][token] < amount) revert InsufficientEscrow();

        escrowBalances[user][token] -= amount;
        totalVaultBalance[token] -= amount;

        // Transfer to recipient (platform wallet, developer wallet)
        if (token == NATIVE_TOKEN) {
            (bool success, ) = recipient.call{value: amount}("");
            if (!success) revert TransferFailed();
        } else {
            IERC20(token).safeTransfer(recipient, amount);
        }

        emit EscrowTransferred(user, recipient, token, amount, tournamentId);
    }

    /**
     * @notice Batch release escrow for multiple users (tournament cancellation)
     * @param users Array of user addresses
     * @param token Token address
     * @param amounts Array of amounts
     * @param tournamentId Tournament identifier
     */
    function batchReleaseEscrow(
        address[] calldata users,
        address token,
        uint256[] calldata amounts,
        bytes32 tournamentId
    ) external onlyAuthorizedContract nonReentrant {
        if (users.length != amounts.length) revert InvalidAmount();

        for (uint256 i = 0; i < users.length; i++) {
            if (users[i] == address(0)) continue;
            if (amounts[i] == 0) continue;
            if (escrowBalances[users[i]][token] < amounts[i]) continue;

            escrowBalances[users[i]][token] -= amounts[i];
            userBalances[users[i]][token] += amounts[i];

            emit EscrowReleased(users[i], token, amounts[i], tournamentId);
        }
    }

    // ============================================================================
    // Direct Transfer Functions (Called by Authorized Contracts)
    // ============================================================================

    /**
     * @notice Transfer funds directly from user balance to recipient
     * @dev Used for direct tournament entry (not pre-deposited)
     * @param user User address
     * @param token Token address
     * @param amount Amount to transfer
     * @param recipient Recipient address
     */
    function transferFromUser(
        address user,
        address token,
        uint256 amount,
        address recipient
    ) external onlyAuthorizedContract nonReentrant {
        if (user == address(0) || recipient == address(0)) revert InvalidAddress();
        if (amount == 0) revert InvalidAmount();
        if (userBalances[user][token] < amount) revert InsufficientBalance();

        userBalances[user][token] -= amount;
        totalVaultBalance[token] -= amount;

        if (token == NATIVE_TOKEN) {
            (bool success, ) = recipient.call{value: amount}("");
            if (!success) revert TransferFailed();
        } else {
            IERC20(token).safeTransfer(recipient, amount);
        }
    }

    /**
     * @notice Credit funds to user balance (prize distribution)
     * @param user User address
     * @param token Token address
     * @param amount Amount to credit
     */
    function creditUser(
        address user,
        address token,
        uint256 amount
    ) external onlyAuthorizedContract nonReentrant {
        if (user == address(0)) revert InvalidAddress();
        if (amount == 0) revert InvalidAmount();

        userBalances[user][token] += amount;
        // Note: totalVaultBalance is not increased as funds should already be in vault
    }

    // ============================================================================
    // Admin Functions
    // ============================================================================

    /**
     * @notice Set authorized contract status
     * @param contractAddress Address to authorize/deauthorize
     * @param authorized Whether to authorize
     */
    function setAuthorizedContract(
        address contractAddress, 
        bool authorized
    ) external onlyOwner {
        if (contractAddress == address(0)) revert InvalidAddress();
        authorizedContracts[contractAddress] = authorized;
        emit AuthorizedContractUpdated(contractAddress, authorized);
    }

    /**
     * @notice Batch set authorized contracts
     * @param contracts Array of contract addresses
     * @param authorized Array of authorization statuses
     */
    function setAuthorizedContractsBatch(
        address[] calldata contracts,
        bool[] calldata authorized
    ) external onlyOwner {
        if (contracts.length != authorized.length) revert InvalidAmount();
        
        for (uint256 i = 0; i < contracts.length; i++) {
            if (contracts[i] == address(0)) continue;
            authorizedContracts[contracts[i]] = authorized[i];
            emit AuthorizedContractUpdated(contracts[i], authorized[i]);
        }
    }

    /**
     * @notice Set deposit limits for a token
     * @param token Token address
     * @param minAmount Minimum deposit amount
     * @param maxAmount Maximum deposit amount (0 for no limit)
     */
    function setDepositLimits(
        address token,
        uint256 minAmount,
        uint256 maxAmount
    ) external onlyOwner {
        if (maxAmount > 0 && minAmount > maxAmount) revert InvalidAmount();
        minDeposit[token] = minAmount;
        maxDeposit[token] = maxAmount;
        emit DepositLimitsUpdated(token, minAmount, maxAmount);
    }

    /**
     * @notice Set withdrawal cooldown period
     * @param newCooldown New cooldown in seconds
     */
    function setWithdrawalCooldown(uint256 newCooldown) external onlyOwner {
        withdrawalCooldown = newCooldown;
        emit WithdrawalCooldownUpdated(newCooldown);
    }

    /**
     * @notice Update DeskillzCore reference
     * @param newCore New DeskillzCore address
     */
    function setDeskillzCore(address newCore) external onlyOwner {
        if (newCore == address(0)) revert InvalidAddress();
        deskillzCore = DeskillzCore(newCore);
        emit DeskillzCoreUpdated(newCore);
    }

    /**
     * @notice Emergency withdrawal of stuck tokens
     * @dev Only callable by owner, should only be used in emergencies
     * @param token Token address (address(0) for BNB)
     * @param amount Amount to withdraw
     * @param recipient Recipient address
     */
    function emergencyWithdraw(
        address token,
        uint256 amount,
        address recipient
    ) external onlyOwner {
        if (recipient == address(0)) revert InvalidAddress();
        if (amount == 0) revert InvalidAmount();

        if (token == NATIVE_TOKEN) {
            if (address(this).balance < amount) revert InsufficientBalance();
            (bool success, ) = recipient.call{value: amount}("");
            if (!success) revert TransferFailed();
        } else {
            if (IERC20(token).balanceOf(address(this)) < amount) revert InsufficientBalance();
            IERC20(token).safeTransfer(recipient, amount);
        }

        emit EmergencyWithdrawal(token, amount, recipient);
    }

    /**
     * @notice Pause all vault operations
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice Unpause vault operations
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    // ============================================================================
    // View Functions
    // ============================================================================

    /**
     * @notice Get user's available balance (not in escrow)
     * @param user User address
     * @param token Token address
     * @return Available balance
     */
    function getBalance(
        address user, 
        address token
    ) external view returns (uint256) {
        return userBalances[user][token];
    }

    /**
     * @notice Get user's escrow balance
     * @param user User address
     * @param token Token address
     * @return Escrow balance
     */
    function getEscrowBalance(
        address user, 
        address token
    ) external view returns (uint256) {
        return escrowBalances[user][token];
    }

    /**
     * @notice Get user's total balance (available + escrow)
     * @param user User address
     * @param token Token address
     * @return Total balance
     */
    function getTotalUserBalance(
        address user, 
        address token
    ) external view returns (uint256) {
        return userBalances[user][token] + escrowBalances[user][token];
    }

    /**
     * @notice Get vault's total balance for a token
     * @param token Token address
     * @return Total balance
     */
    function getVaultBalance(address token) external view returns (uint256) {
        return totalVaultBalance[token];
    }

    /**
     * @notice Get actual vault balance (for verification)
     * @param token Token address
     * @return Actual balance
     */
    function getActualVaultBalance(address token) external view returns (uint256) {
        if (token == NATIVE_TOKEN) {
            return address(this).balance;
        }
        return IERC20(token).balanceOf(address(this));
    }

    /**
     * @notice Check if contract is authorized
     * @param contractAddress Contract to check
     * @return Whether authorized
     */
    function isAuthorizedContract(address contractAddress) external view returns (bool) {
        return authorizedContracts[contractAddress];
    }

    /**
     * @notice Get time until user can withdraw again
     * @param user User address
     * @return Seconds until withdrawal is allowed (0 if allowed)
     */
    function getWithdrawalCooldownRemaining(address user) external view returns (uint256) {
        if (withdrawalCooldown == 0) return 0;
        
        uint256 nextAllowed = lastWithdrawalTime[user] + withdrawalCooldown;
        if (block.timestamp >= nextAllowed) return 0;
        
        return nextAllowed - block.timestamp;
    }

    /**
     * @notice Check if user can withdraw
     * @param user User address
     * @return Whether withdrawal is allowed
     */
    function canWithdraw(address user) external view returns (bool) {
        if (withdrawalCooldown == 0) return true;
        return block.timestamp >= lastWithdrawalTime[user] + withdrawalCooldown;
    }

    /**
     * @notice Get deposit limits for a token
     * @param token Token address
     * @return min Minimum deposit
     * @return max Maximum deposit (0 = no limit)
     */
    function getDepositLimits(address token) external view returns (uint256 min, uint256 max) {
        return (minDeposit[token], maxDeposit[token]);
    }

    /**
     * @notice Get multiple balances for a user
     * @param user User address
     * @param tokens Array of token addresses
     * @return balances Array of balances
     * @return escrows Array of escrow balances
     */
    function getMultipleBalances(
        address user,
        address[] calldata tokens
    ) external view returns (uint256[] memory balances, uint256[] memory escrows) {
        balances = new uint256[](tokens.length);
        escrows = new uint256[](tokens.length);
        
        for (uint256 i = 0; i < tokens.length; i++) {
            balances[i] = userBalances[user][tokens[i]];
            escrows[i] = escrowBalances[user][tokens[i]];
        }
    }

    // ============================================================================
    // Internal Functions
    // ============================================================================

    function _validateDepositLimits(address token, uint256 amount) internal view {
        if (minDeposit[token] > 0 && amount < minDeposit[token]) {
            revert DepositBelowMinimum();
        }
        if (maxDeposit[token] > 0 && amount > maxDeposit[token]) {
            revert DepositAboveMaximum();
        }
    }

    function _checkWithdrawalCooldown(address user) internal view {
        if (withdrawalCooldown > 0) {
            if (block.timestamp < lastWithdrawalTime[user] + withdrawalCooldown) {
                revert WithdrawalCooldownActive();
            }
        }
    }

    /**
     * @notice Authorize contract upgrades
     */
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    // ============================================================================
    // Receive Function
    // ============================================================================

    /**
     * @notice Allow contract to receive BNB directly
     * @dev Funds received this way are added to sender's balance
     */
    receive() external payable {
        if (msg.value > 0) {
            userBalances[msg.sender][NATIVE_TOKEN] += msg.value;
            totalVaultBalance[NATIVE_TOKEN] += msg.value;
            emit Deposited(msg.sender, NATIVE_TOKEN, msg.value, userBalances[msg.sender][NATIVE_TOKEN]);
        }
    }

    // ============================================================================
    // Version
    // ============================================================================

    function version() external pure returns (string memory) {
        return "1.0.0";
    }
}
