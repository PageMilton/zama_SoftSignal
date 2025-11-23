// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint8, euint16, euint32, ebool, externalEuint16} from "@fhevm/solidity/lib/FHE.sol";
import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title SoftSignal - Privacy-Preserving Emotion & Mental Health Tracking
/// @notice Allows users to record encrypted emotion data and compute trends on-chain
/// @dev Uses FHEVM for homomorphic encryption of sensitive mental health data
contract SoftSignal is ZamaEthereumConfig {
    /// @notice Represents a single emotion entry
    struct Entry {
        euint16 mood;        // 0-10 scale (encrypted)
        euint16 stress;      // 0-10 scale (encrypted)
        euint16 sleep;       // 0-10 scale (encrypted)
        uint32 timestamp;    // Unix timestamp
        address owner;       // Entry owner
        bytes32[] tags;      // Event tags (Work, Family, Health, etc.)
    }

    /// @notice Stores aggregated trend data
    struct TrendData {
        euint16 avgMood;
        euint16 avgStress;
        euint16 avgSleep;
        euint8 riskLevel;    // 0=low, 1=moderate, 2=elevated, 3=high
        uint16 entryCount;
    }

    /// @notice Counter for entry IDs
    uint256 private _entryIdCounter;

    /// @notice Mapping from entry ID to Entry
    mapping(uint256 => Entry) private _entries;

    /// @notice Mapping from user address to array of entry IDs
    mapping(address => uint256[]) private _userEntries;

    /// @notice Events
    event EntryAdded(address indexed user, uint256 indexed entryId, uint32 timestamp);
    event EntryAllowed(uint256 indexed entryId, address indexed account);
    event MultipleEntriesAllowed(uint256[] entryIds, address indexed account);

    /// @notice Adds a new emotion entry
    /// @param inputMood Encrypted mood score (0-10)
    /// @param inputStress Encrypted stress level (0-10)
    /// @param inputSleep Encrypted sleep quality (0-10)
    /// @param timestamp Entry timestamp
    /// @param tags Event tags
    /// @param inputProof Input proof for encrypted values
    /// @return entryId The ID of the newly created entry
    function addEntry(
        externalEuint16 inputMood,
        externalEuint16 inputStress,
        externalEuint16 inputSleep,
        uint32 timestamp,
        bytes32[] calldata tags,
        bytes calldata inputProof
    ) external returns (uint256 entryId) {
        // Import encrypted values from user's input
        euint16 mood = FHE.fromExternal(inputMood, inputProof);
        euint16 stress = FHE.fromExternal(inputStress, inputProof);
        euint16 sleep = FHE.fromExternal(inputSleep, inputProof);

        // Allow contract to use these values
        FHE.allowThis(mood);
        FHE.allowThis(stress);
        FHE.allowThis(sleep);

        // Create entry
        entryId = _entryIdCounter++;
        _entries[entryId] = Entry({
            mood: mood,
            stress: stress,
            sleep: sleep,
            timestamp: timestamp,
            owner: msg.sender,
            tags: tags
        });

        // Add to user's entry list
        _userEntries[msg.sender].push(entryId);

        emit EntryAdded(msg.sender, entryId, timestamp);
    }

    /// @notice Gets an entry by ID
    /// @param entryId The entry ID
    /// @return mood Encrypted mood score
    /// @return stress Encrypted stress level
    /// @return sleep Encrypted sleep quality
    /// @return timestamp Entry timestamp
    /// @return owner Entry owner
    function getEntry(uint256 entryId)
        external
        view
        returns (
            euint16 mood,
            euint16 stress,
            euint16 sleep,
            uint32 timestamp,
            address owner
        )
    {
        Entry storage entry = _entries[entryId];
        require(entry.owner != address(0), "Entry does not exist");
        return (entry.mood, entry.stress, entry.sleep, entry.timestamp, entry.owner);
    }

    /// @notice Gets the number of entries for a user
    /// @param user The user address
    /// @return count The number of entries
    function getUserEntryCount(address user) external view returns (uint256) {
        return _userEntries[user].length;
    }

    /// @notice Gets a range of entry IDs for a user
    /// @param user The user address
    /// @param startIndex Starting index in the user's entry array
    /// @param count Number of entries to retrieve
    /// @return entryIds Array of entry IDs
    function getUserEntryIds(
        address user,
        uint256 startIndex,
        uint256 count
    ) external view returns (uint256[] memory entryIds) {
        uint256[] storage userEntries = _userEntries[user];
        require(startIndex < userEntries.length, "Start index out of bounds");

        uint256 endIndex = startIndex + count;
        if (endIndex > userEntries.length) {
            endIndex = userEntries.length;
        }

        entryIds = new uint256[](endIndex - startIndex);
        for (uint256 i = startIndex; i < endIndex; i++) {
            entryIds[i - startIndex] = userEntries[i];
        }
    }

    /// @notice Computes trend data for a user within a time range
    /// @param user The user address
    /// @param startTime Start timestamp (inclusive)
    /// @param endTime End timestamp (inclusive)
    /// @return avgMood Encrypted average mood
    /// @return avgStress Encrypted average stress
    /// @return avgSleep Encrypted average sleep
    /// @return riskLevel Encrypted risk level (0-3)
    function getTrendData(
        address user,
        uint32 startTime,
        uint32 endTime
    )
        external
        returns (
            euint16 avgMood,
            euint16 avgStress,
            euint16 avgSleep,
            euint8 riskLevel
        )
    {
        uint256[] storage userEntries = _userEntries[user];
        require(userEntries.length > 0, "No entries found");

        // Initialize accumulators
        euint32 moodSum = FHE.asEuint32(0);
        euint32 stressSum = FHE.asEuint32(0);
        euint32 sleepSum = FHE.asEuint32(0);
        uint16 count = 0;

        // Accumulate values within time range
        for (uint256 i = 0; i < userEntries.length; i++) {
            Entry storage entry = _entries[userEntries[i]];
            if (entry.timestamp >= startTime && entry.timestamp <= endTime) {
                moodSum = FHE.add(moodSum, FHE.asEuint32(entry.mood));
                stressSum = FHE.add(stressSum, FHE.asEuint32(entry.stress));
                sleepSum = FHE.add(sleepSum, FHE.asEuint32(entry.sleep));
                count++;
            }
        }

        require(count > 0, "No entries in time range");

        // Compute averages
        avgMood = FHE.asEuint16(FHE.div(moodSum, count));
        avgStress = FHE.asEuint16(FHE.div(stressSum, count));
        avgSleep = FHE.asEuint16(FHE.div(sleepSum, count));

        // Compute risk level
        riskLevel = _computeRiskLevel(avgMood, avgStress, avgSleep);

        // Allow contract to return these values
        FHE.allowThis(avgMood);
        FHE.allowThis(avgStress);
        FHE.allowThis(avgSleep);
        FHE.allowThis(riskLevel);
    }

    /// @notice Gets the current risk level for a user (last 7 days)
    /// @param user The user address
    /// @return riskLevel Encrypted risk level
    function getRiskLevel(address user) external returns (euint8 riskLevel) {
        riskLevel = _getRiskLevelInternal(user);
        FHE.allowThis(riskLevel);
    }

    /// @notice Computes risk level based on mood, stress, and sleep averages
    /// @dev 0=low, 1=moderate, 2=elevated, 3=high
    function _computeRiskLevel(
        euint16 avgMood,
        euint16 avgStress,
        euint16 avgSleep
    ) private returns (euint8) {
        // Risk factors:
        // - Low mood (< 4)
        // - High stress (> 7)
        // - Poor sleep (< 5)

        euint8 riskScore = FHE.asEuint8(0);

        // Check low mood
        ebool hasLowMood = FHE.lt(avgMood, FHE.asEuint16(4));
        riskScore = FHE.select(hasLowMood, FHE.add(riskScore, FHE.asEuint8(1)), riskScore);

        // Check high stress
        ebool hasHighStress = FHE.gt(avgStress, FHE.asEuint16(7));
        riskScore = FHE.select(hasHighStress, FHE.add(riskScore, FHE.asEuint8(1)), riskScore);

        // Check poor sleep
        ebool hasPoorSleep = FHE.lt(avgSleep, FHE.asEuint16(5));
        riskScore = FHE.select(hasPoorSleep, FHE.add(riskScore, FHE.asEuint8(1)), riskScore);

        // Map score to risk level
        // 0 factors = low (0), 1 factor = moderate (1), 2 factors = elevated (2), 3 factors = high (3)
        return riskScore;
    }

    /// @notice Allows a specific account to decrypt an entry
    /// @param entryId The entry ID
    /// @param account The account to allow
    function allowAccount(uint256 entryId, address account) external {
        Entry storage entry = _entries[entryId];
        require(entry.owner == msg.sender, "Only owner can grant access");

        FHE.allow(entry.mood, account);
        FHE.allow(entry.stress, account);
        FHE.allow(entry.sleep, account);

        emit EntryAllowed(entryId, account);
    }

    /// @notice Allows a specific account to decrypt multiple entries (batch operation)
    /// @param entryIds Array of entry IDs
    /// @param account The account to allow
    function allowMultipleEntries(uint256[] calldata entryIds, address account) external {
        for (uint256 i = 0; i < entryIds.length; i++) {
            Entry storage entry = _entries[entryIds[i]];
            require(entry.owner == msg.sender, "Only owner can grant access");

            FHE.allow(entry.mood, account);
            FHE.allow(entry.stress, account);
            FHE.allow(entry.sleep, account);
        }

        emit MultipleEntriesAllowed(entryIds, account);
    }

    /// @notice Allows the caller to decrypt their own risk level
    function allowRiskLevel() external {
        euint8 riskLevel = _getRiskLevelInternal(msg.sender);
        FHE.allow(riskLevel, msg.sender);
        FHE.allow(riskLevel, address(this)); // Also allow contract for decryption signature verification
    }
    
    /// @notice Internal function to compute risk level without extra allows
    function _getRiskLevelInternal(address userAddress) private returns (euint8 riskLevel) {
        uint32 currentTime = uint32(block.timestamp);
        uint32 startTime = currentTime > 7 days ? currentTime - 7 days : 0;

        uint256[] storage userEntryIds = _userEntries[userAddress];
        if (userEntryIds.length == 0) {
            return FHE.asEuint8(0);
        }

        euint32 moodSum = FHE.asEuint32(0);
        euint32 stressSum = FHE.asEuint32(0);
        euint32 sleepSum = FHE.asEuint32(0);
        uint32 count = 0;

        for (uint256 i = 0; i < userEntryIds.length; i++) {
            Entry storage entry = _entries[userEntryIds[i]];
            if (entry.timestamp >= startTime) {
                moodSum = FHE.add(moodSum, FHE.asEuint32(entry.mood));
                stressSum = FHE.add(stressSum, FHE.asEuint32(entry.stress));
                sleepSum = FHE.add(sleepSum, FHE.asEuint32(entry.sleep));
                count++;
            }
        }

        if (count > 0) {
            euint16 avgMood = FHE.asEuint16(FHE.div(moodSum, count));
            euint16 avgStress = FHE.asEuint16(FHE.div(stressSum, count));
            euint16 avgSleep = FHE.asEuint16(FHE.div(sleepSum, count));
            riskLevel = _computeRiskLevel(avgMood, avgStress, avgSleep);
        } else {
            riskLevel = FHE.asEuint8(0);
        }
    }

    /// @notice Gets entry tags
    /// @param entryId The entry ID
    /// @return tags Array of tags
    function getEntryTags(uint256 entryId) external view returns (bytes32[] memory) {
        require(_entries[entryId].owner != address(0), "Entry does not exist");
        return _entries[entryId].tags;
    }

    /// @notice Gets total number of entries in the system
    /// @return Total entry count
    function getTotalEntryCount() external view returns (uint256) {
        return _entryIdCounter;
    }
}
