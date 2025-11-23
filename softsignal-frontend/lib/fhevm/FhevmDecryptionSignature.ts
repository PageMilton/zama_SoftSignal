/**
 * FHEVM Decryption Signature Management
 * Based on frontend/fhevm/FhevmDecryptionSignature.ts
 */

import { FhevmInstance } from './instance';
import { storage } from '../utils/storage';

export interface DecryptionSignature {
  privateKey: string;
  publicKey: string;
  signature: string;
  contractAddresses: string[];
  userAddress: string;
  startTimestamp: number;
  durationDays: number;
}

export class FhevmDecryptionSignature {
  /**
   * Generate new decryption signature (always generates fresh, no cache)
   */
  static async sign(
    instance: FhevmInstance,
    contractAddresses: string[],
    signer: any,
    account: string
  ): Promise<DecryptionSignature | null> {
    try {
      // Get EIP-712 message for signing
      const { publicKey, privateKey } = instance.generateKeypair();
      
      const startTimestamp = Math.floor(Date.now() / 1000);
      const durationDays = 30; // Signature valid for 30 days

      // Create message for signing (sorted contract addresses)
      const sortedAddresses = [...contractAddresses].sort();
      const message = instance.createEIP712(
        publicKey,
        sortedAddresses,
        startTimestamp,
        durationDays
      );

      // Request signature from user
      // Remove EIP712Domain from types (ethers.js v6 handles it automatically)
      const typesWithoutDomain = { ...message.types };
      delete typesWithoutDomain.EIP712Domain;
      
      const signature = await signer.signTypedData(
        message.domain,
        typesWithoutDomain,
        message.message
      );

      return {
        privateKey,
        publicKey,
        signature,
        contractAddresses,
        userAddress: account,
        startTimestamp,
        durationDays,
      };
    } catch (error) {
      console.error('Failed to generate signature:', error);
      return null;
    }
  }

  /**
   * @deprecated Use sign() instead. This method is kept for backward compatibility but always generates fresh signatures.
   */
  static async loadOrSign(
    instance: FhevmInstance,
    contractAddresses: string[],
    signer: any,
    account: string
  ): Promise<DecryptionSignature | null> {
    // Always generate fresh signature, no cache
    return await this.sign(instance, contractAddresses, signer, account);
  }

  /**
   * Clear stored signature (kept for compatibility, but signatures are no longer cached)
   */
  static clear(account: string): void {
    storage.clearDecryptionSignature(account);
  }
}
