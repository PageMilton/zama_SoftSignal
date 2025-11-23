/**
 * FHEVM Encryption utilities
 */

import { FhevmInstance } from './instance';

export interface EncryptedInput {
  handles: string[];
  inputProof: string;
}

/**
 * Encrypts a single 16-bit value
 */
export async function encrypt16(instance: FhevmInstance, value: number): Promise<string> {
  if (value < 0 || value > 65535) {
    throw new Error('Value must be between 0 and 65535 for euint16');
  }
  return await instance.encrypt16(value);
}

/**
 * Encrypts a single 32-bit value
 */
export async function encrypt32(instance: FhevmInstance, value: number): Promise<string> {
  if (value < 0 || value > 4294967295) {
    throw new Error('Value must be between 0 and 4294967295 for euint32');
  }
  return await instance.encrypt32(value);
}

/**
 * Creates an encrypted input for multiple values
 * This is more gas-efficient than encrypting values separately
 */
export async function createEncryptedInput(
  instance: FhevmInstance,
  contractAddress: string,
  userAddress: string,
  values: { type: 16 | 32; value: number }[]
): Promise<EncryptedInput> {
  const input = instance.createEncryptedInput(contractAddress, userAddress);

  for (const { type, value } of values) {
    if (type === 16) {
      input.add16(value);
    } else if (type === 32) {
      input.add32(value);
    } else {
      throw new Error(`Unsupported type: ${type}`);
    }
  }

  const encrypted = await input.encrypt();
  
  return {
    handles: encrypted.handles,
    inputProof: encrypted.inputProof,
  };
}

/**
 * Helper for encrypting emotion entry data
 */
export async function encryptEmotionEntry(
  instance: FhevmInstance,
  contractAddress: string,
  userAddress: string,
  mood: number,
  stress: number,
  sleep: number
): Promise<EncryptedInput> {
  // Validate ranges
  if (mood < 0 || mood > 10) throw new Error('Mood must be between 0 and 10');
  if (stress < 0 || stress > 10) throw new Error('Stress must be between 0 and 10');
  if (sleep < 0 || sleep > 10) throw new Error('Sleep must be between 0 and 10');

  // Scale to euint16 range (0-10 -> 0-10 * 100 for precision)
  const scaledMood = Math.round(mood * 100);
  const scaledStress = Math.round(stress * 100);
  const scaledSleep = Math.round(sleep * 100);

  return await createEncryptedInput(
    instance,
    contractAddress,
    userAddress,
    [
      { type: 16, value: scaledMood },
      { type: 16, value: scaledStress },
      { type: 16, value: scaledSleep },
    ]
  );
}
