'use client';

/**
 * Contract Hook for SoftSignal interactions
 */

import { useEffect, useState } from 'react';
import { Contract } from 'ethers';
import { useWallet } from './useWallet';
import { createSoftSignalContract } from '@/lib/contract/SoftSignalContract';

// These will be dynamically imported from generated ABI files
let SoftSignalABI: any = null;
let getCurrentAddress: any = null;

export function useContract() {
  const { provider, chainId, isConnected } = useWallet();
  const [contract, setContract] = useState<Contract | null>(null);
  const [contractAddress, setContractAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    const initContract = async () => {
      if (!provider || !chainId || !isConnected) {
        setContract(null);
        setContractAddress(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Dynamically import generated ABI
        if (!SoftSignalABI) {
          const abiModule = await import('@/abi/SoftSignalABI');
          SoftSignalABI = abiModule.SoftSignalABI;
        }

        if (!getCurrentAddress) {
          const addressModule = await import('@/abi/SoftSignalAddresses');
          getCurrentAddress = addressModule.getCurrentAddress;
        }

        const address = getCurrentAddress(chainId);
        const contractInstance = createSoftSignalContract(address, SoftSignalABI, provider);

        if (isMounted) {
          setContract(contractInstance);
          setContractAddress(address);
        }
      } catch (err) {
        console.error('Failed to initialize contract:', err);
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Contract not deployed'));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initContract();

    return () => {
      isMounted = false;
    };
  }, [provider, chainId, isConnected]);

  return { contract, contractAddress, isLoading, error };
}
