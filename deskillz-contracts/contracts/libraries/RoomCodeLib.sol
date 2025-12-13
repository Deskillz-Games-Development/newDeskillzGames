// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

/**
 * @title RoomCodeLib
 * @author Deskillz Games
 * @notice Library for generating and validating 8-character alphanumeric room codes
 * @dev Room codes are used for private tournament invitations
 *      Format: 8 characters, uppercase letters and numbers only (0-9, A-Z)
 *      Example: "X7K9M2PL"
 */
library RoomCodeLib {
    // ============================================================================
    // CONSTANTS
    // ============================================================================
    
    /// @notice Length of room code in characters
    uint256 public constant CODE_LENGTH = 8;
    
    /// @notice Character set for room codes (uppercase alphanumeric, excluding confusing chars)
    /// @dev Excludes 0/O, 1/I/L to avoid confusion
    bytes public constant CHARSET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
    
    /// @notice Length of character set
    uint256 public constant CHARSET_LENGTH = 30; // 8 digits (2-9) + 22 letters (excl O, I, L)
    
    // ============================================================================
    // FUNCTIONS
    // ============================================================================
    
    /**
     * @notice Generate a unique room code
     * @dev Uses block data and input parameters for randomness
     *      NOT cryptographically secure, but sufficient for room codes
     * @param tournamentId Tournament ID to include in seed
     * @param creator Creator address to include in seed
     * @param salt Additional salt for uniqueness
     * @return code 8-character room code as bytes8
     */
    function generateCode(
        bytes32 tournamentId,
        address creator,
        uint256 salt
    ) internal view returns (bytes8) {
        // Create pseudo-random seed
        bytes32 seed = keccak256(abi.encodePacked(
            block.timestamp,
            block.prevrandao,
            tournamentId,
            creator,
            salt,
            block.number
        ));
        
        bytes memory result = new bytes(CODE_LENGTH);
        
        for (uint256 i = 0; i < CODE_LENGTH; i++) {
            // Use different parts of the seed for each character
            uint256 charIndex = uint256(uint8(seed[i % 32])) % CHARSET_LENGTH;
            result[i] = CHARSET[charIndex];
            
            // Rotate seed for next character
            if (i > 0 && i % 32 == 0) {
                seed = keccak256(abi.encodePacked(seed, i));
            }
        }
        
        return bytes8(bytes(result));
    }
    
    /**
     * @notice Generate a room code with additional entropy
     * @dev More secure version with multiple entropy sources
     * @param tournamentId Tournament ID
     * @param creator Creator address
     * @param nonce Contract nonce for uniqueness
     * @return code 8-character room code as bytes8
     */
    function generateCodeSecure(
        bytes32 tournamentId,
        address creator,
        uint256 nonce
    ) internal view returns (bytes8) {
        // Multiple rounds of hashing for better distribution
        bytes32 seed1 = keccak256(abi.encodePacked(
            block.timestamp,
            block.prevrandao,
            tournamentId
        ));
        
        bytes32 seed2 = keccak256(abi.encodePacked(
            creator,
            nonce,
            block.number,
            gasleft()
        ));
        
        bytes32 finalSeed = keccak256(abi.encodePacked(seed1, seed2));
        
        bytes memory result = new bytes(CODE_LENGTH);
        
        for (uint256 i = 0; i < CODE_LENGTH; i++) {
            uint256 charIndex = uint256(uint8(finalSeed[i])) % CHARSET_LENGTH;
            result[i] = CHARSET[charIndex];
        }
        
        return bytes8(bytes(result));
    }
    
    /**
     * @notice Validate a room code format
     * @param code The room code to validate
     * @return isValid True if the code is valid format
     */
    function isValidCode(bytes8 code) internal pure returns (bool) {
        // Check it's not empty
        if (code == bytes8(0)) {
            return false;
        }
        
        // Check each character is valid
        for (uint256 i = 0; i < CODE_LENGTH; i++) {
            bytes1 char = code[i];
            if (!isValidChar(char)) {
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * @notice Check if a character is valid for room codes
     * @param char The character to check
     * @return True if valid
     */
    function isValidChar(bytes1 char) internal pure returns (bool) {
        // Numbers 2-9 (0x32 - 0x39)
        if (char >= 0x32 && char <= 0x39) {
            return true;
        }
        
        // Uppercase letters excluding confusing ones (I, L, O)
        if (char >= 0x41 && char <= 0x5A) {
            // Exclude I (0x49), L (0x4C), O (0x4F)
            if (char == 0x49 || char == 0x4C || char == 0x4F) {
                return false;
            }
            return true;
        }
        
        return false;
    }
    
    /**
     * @notice Convert room code to uppercase string
     * @param code The room code as bytes8
     * @return Room code as string
     */
    function toString(bytes8 code) internal pure returns (string memory) {
        bytes memory result = new bytes(CODE_LENGTH);
        for (uint256 i = 0; i < CODE_LENGTH; i++) {
            result[i] = code[i];
        }
        return string(result);
    }
    
    /**
     * @notice Convert string to room code bytes8
     * @dev Converts to uppercase automatically
     * @param codeString The room code as string
     * @return Room code as bytes8
     */
    function fromString(string memory codeString) internal pure returns (bytes8) {
        bytes memory codeBytes = bytes(codeString);
        require(codeBytes.length == CODE_LENGTH, "Invalid code length");
        
        bytes memory result = new bytes(CODE_LENGTH);
        
        for (uint256 i = 0; i < CODE_LENGTH; i++) {
            bytes1 char = codeBytes[i];
            
            // Convert lowercase to uppercase
            if (char >= 0x61 && char <= 0x7A) {
                char = bytes1(uint8(char) - 32);
            }
            
            result[i] = char;
        }
        
        bytes8 code = bytes8(bytes(result));
        require(isValidCode(code), "Invalid code format");
        
        return code;
    }
    
    /**
     * @notice Compare two room codes
     * @param code1 First code
     * @param code2 Second code
     * @return True if codes match
     */
    function equals(bytes8 code1, bytes8 code2) internal pure returns (bool) {
        return code1 == code2;
    }
    
    /**
     * @notice Check if room code is empty/unset
     * @param code The room code
     * @return True if empty
     */
    function isEmpty(bytes8 code) internal pure returns (bool) {
        return code == bytes8(0);
    }
    
    /**
     * @notice Hash a room code for mapping keys
     * @dev Useful for creating mappings indexed by room code
     * @param code The room code
     * @return Hash of the room code
     */
    function hash(bytes8 code) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(code));
    }
}
