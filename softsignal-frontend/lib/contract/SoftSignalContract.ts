/**
 * SoftSignal Contract interaction utilities
 */

import { Contract, BrowserProvider } from 'ethers';

/**
 * Converts a BigInt or string handle to a properly formatted hex string
 * FHEVM handles must be 32 bytes (64 hex characters)
 */
function toHandleString(value: any): string {
  console.log('[toHandleString] Input:', value, 'Type:', typeof value);
  
  if (typeof value === 'bigint') {
    // Convert to hex and pad to 64 characters (32 bytes)
    const result = '0x' + value.toString(16).padStart(64, '0');
    console.log('[toHandleString] BigInt -> Hex:', result);
    return result;
  }
  
  // If already a string, ensure it's properly formatted
  const str = String(value);
  console.log('[toHandleString] String value:', str, 'Length:', str.length);
  
  if (str.startsWith('0x') && str.length < 66) {
    const result = '0x' + str.slice(2).padStart(64, '0');
    console.log('[toHandleString] Padded result:', result);
    return result;
  }
  
  console.log('[toHandleString] Returning as-is:', str);
  return str;
}

export interface EmotionEntry {
  id: number;
  mood: string; // encrypted handle
  stress: string; // encrypted handle
  sleep: string; // encrypted handle
  timestamp: number;
  owner: string;
  tags?: string[];
}

export interface TrendData {
  avgMood: string; // encrypted handle
  avgStress: string; // encrypted handle
  avgSleep: string; // encrypted handle
  riskLevel: string; // encrypted handle
}

/**
 * Creates a contract instance
 */
export function createSoftSignalContract(
  address: string,
  abi: any[],
  provider: BrowserProvider
): Contract {
  // Validate address
  if (!address || address === '') {
    throw new Error(
      '⚠️ Contract not deployed to current network.\n\n' +
      'Please either:\n' +
      '1. Switch to Localhost network and use Mock mode\n' +
      '2. Deploy contract to Sepolia and update address mapping'
    );
  }

  return new Contract(address, abi, provider);
}

/**
 * Adds a new emotion entry
 */
export async function addEntry(
  contract: Contract,
  encryptedMood: string,
  encryptedStress: string,
  encryptedSleep: string,
  timestamp: number,
  tags: string[],
  inputProof: string
): Promise<string> {
  const tx = await contract.addEntry(
    encryptedMood,
    encryptedStress,
    encryptedSleep,
    timestamp,
    tags,
    inputProof
  );
  const receipt = await tx.wait();
  
  // Extract entry ID from event
  const event = receipt.logs.find((log: any) => {
    try {
      const parsed = contract.interface.parseLog(log);
      return parsed?.name === 'EntryAdded';
    } catch {
      return false;
    }
  });

  if (event) {
    const parsed = contract.interface.parseLog(event);
    return parsed?.args?.entryId?.toString() || '0';
  }

  return '0';
}

/**
 * Gets entry count for a user
 */
export async function getUserEntryCount(
  contract: Contract,
  userAddress: string
): Promise<number> {
  const count = await contract.getUserEntryCount(userAddress);
  return Number(count);
}

/**
 * Gets entry IDs for a user
 */
export async function getUserEntryIds(
  contract: Contract,
  userAddress: string,
  startIndex: number,
  count: number
): Promise<number[]> {
  const ids = await contract.getUserEntryIds(userAddress, startIndex, count);
  return ids.map((id: any) => Number(id));
}

/**
 * Gets a single entry
 */
export async function getEntry(
  contract: Contract,
  entryId: number
): Promise<EmotionEntry> {
  const entry = await contract.getEntry(entryId);
  
  return {
    id: entryId,
    mood: toHandleString(entry.mood),
    stress: toHandleString(entry.stress),
    sleep: toHandleString(entry.sleep),
    timestamp: Number(entry.timestamp),
    owner: entry.owner,
  };
}

/**
 * Gets entry tags
 */
export async function getEntryTags(
  contract: Contract,
  entryId: number
): Promise<string[]> {
  const tags = await contract.getEntryTags(entryId);
  return tags;
}

/**
 * Allows an account to decrypt an entry
 */
export async function allowAccount(
  contract: Contract,
  entryId: number,
  account: string
): Promise<void> {
  const tx = await contract.allowAccount(entryId, account);
  await tx.wait();
}

/**
 * Allows an account to decrypt multiple entries
 */
export async function allowMultipleEntries(
  contract: Contract,
  entryIds: number[],
  account: string
): Promise<void> {
  const tx = await contract.allowMultipleEntries(entryIds, account);
  await tx.wait();
}

/**
 * Gets trend data for a user
 * Uses staticCall because getTrendData cannot be marked as 'view' due to FHE operations
 */
export async function getTrendData(
  contract: Contract,
  userAddress: string,
  startTime: number,
  endTime: number
): Promise<TrendData> {
  // Use staticCall to read the return value without sending a transaction
  const trend = await contract.getTrendData.staticCall(userAddress, startTime, endTime);
  
  return {
    avgMood: toHandleString(trend.avgMood),
    avgStress: toHandleString(trend.avgStress),
    avgSleep: toHandleString(trend.avgSleep),
    riskLevel: toHandleString(trend.riskLevel),
  };
}

/**
 * Allows the caller to decrypt their risk level
 */
export async function allowRiskLevel(
  contract: Contract
): Promise<void> {
  const tx = await contract.allowRiskLevel();
  await tx.wait();
}

/**
 * Gets risk level for a user
 * Uses staticCall because getRiskLevel cannot be marked as 'view' due to FHE operations
 */
export async function getRiskLevel(
  contract: Contract,
  userAddress: string
): Promise<string> {
  // Use staticCall to read the return value without sending a transaction
  const riskLevel = await contract.getRiskLevel.staticCall(userAddress);
  console.log('[getRiskLevel] Raw value:', riskLevel);
  console.log('[getRiskLevel] Type:', typeof riskLevel);
  const formatted = toHandleString(riskLevel);
  console.log('[getRiskLevel] Formatted:', formatted);
  console.log('[getRiskLevel] Length:', formatted.length);
  return formatted;
}
