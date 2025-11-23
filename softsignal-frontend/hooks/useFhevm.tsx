'use client';

/**
 * FHEVM Hook for encryption/decryption
 */

import { useEffect, useState } from 'react';
import { useWallet } from './useWallet';
import { getFhevmInstance, clearFhevmInstance, FhevmInstance } from '@/lib/fhevm/instance';

export function useFhevm() {
  const { provider, chainId, isConnected } = useWallet();
  const [instance, setInstance] = useState<FhevmInstance | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    const initInstance = async () => {
      if (!provider || !chainId || !isConnected) {
        setInstance(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const fhevmInstance = await getFhevmInstance(provider, chainId);
        if (isMounted) {
          setInstance(fhevmInstance);
        }
      } catch (err) {
        console.error('Failed to initialize FHEVM instance:', err);
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Unknown error'));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initInstance();

    return () => {
      isMounted = false;
    };
  }, [provider, chainId, isConnected]);

  // Clear instance when chain changes
  useEffect(() => {
    return () => {
      clearFhevmInstance();
    };
  }, [chainId]);

  return { instance, isLoading, error };
}
