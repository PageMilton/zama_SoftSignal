/**
 * FHEVM Decryption utilities
 */

import { FhevmInstance } from './instance';
import { FhevmDecryptionSignature } from './FhevmDecryptionSignature';

/**
 * Decrypts a single encrypted handle
 */
export async function userDecrypt(
  instance: FhevmInstance,
  contractAddress: string,
  handle: string,
  userAddress: string,
  signer: any
): Promise<number> {
  try {
    // Generate fresh decryption signature (no cache)
    const sig = await FhevmDecryptionSignature.sign(
      instance,
      [contractAddress],
      signer,
      userAddress
    );

    if (!sig) {
      throw new Error('Failed to get decryption signature');
    }

    // Decrypt using full API
    const result = await instance.userDecrypt(
      [{ handle, contractAddress }],
      sig.privateKey,
      sig.publicKey,
      sig.signature,
      sig.contractAddresses,
      sig.userAddress,
      sig.startTimestamp,
      sig.durationDays
    );

    return Number(result[handle]);
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Failed to decrypt value. Ensure you have permission.');
  }
}

/**
 * Batch decrypts multiple handles
 */
export async function batchDecrypt(
  instance: FhevmInstance,
  contractAddress: string,
  handles: string[],
  userAddress: string,
  signer: any
): Promise<number[]> {
  try {
    // Generate fresh decryption signature (no cache)
    const sig = await FhevmDecryptionSignature.sign(
      instance,
      [contractAddress],
      signer,
      userAddress
    );

    if (!sig) {
      throw new Error('Failed to get decryption signature');
    }

    // Prepare all handles
    const handleObjects = handles.map(handle => ({ handle, contractAddress }));

    // Decrypt all at once
    const result = await instance.userDecrypt(
      handleObjects,
      sig.privateKey,
      sig.publicKey,
      sig.signature,
      sig.contractAddresses,
      sig.userAddress,
      sig.startTimestamp,
      sig.durationDays
    );

    // Extract values in order
    return handles.map(handle => Number(result[handle]));
  } catch (error) {
    console.error('Batch decryption failed:', error);
    throw error;
  }
}

/**
 * Decrypts emotion entry data (mood, stress, sleep)
 * Scales back from euint16 range (0-1000) to 0-10
 */
export async function decryptEmotionEntry(
  instance: FhevmInstance,
  contractAddress: string,
  moodHandle: string,
  stressHandle: string,
  sleepHandle: string,
  userAddress: string,
  signer: any
): Promise<{ mood: number; stress: number; sleep: number }> {
  const [scaledMood, scaledStress, scaledSleep] = await batchDecrypt(
    instance,
    contractAddress,
    [moodHandle, stressHandle, sleepHandle],
    userAddress,
    signer
  );

  return {
    mood: scaledMood / 100,
    stress: scaledStress / 100,
    sleep: scaledSleep / 100,
  };
}

/**
 * Decrypts a risk level (euint8)
 */
export async function decryptRiskLevel(
  instance: FhevmInstance,
  contractAddress: string,
  riskHandle: string,
  userAddress: string,
  signer: any
): Promise<number> {
  return await userDecrypt(instance, contractAddress, riskHandle, userAddress, signer);
}
