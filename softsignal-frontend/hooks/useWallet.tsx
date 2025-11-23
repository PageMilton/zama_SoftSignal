'use client';

/**
 * Wallet Hook with EIP-6963 support and persistence
 */

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { BrowserProvider } from 'ethers';
import { storage } from '@/lib/utils/storage';

export interface EIP6963ProviderDetail {
  info: {
    uuid: string;
    name: string;
    icon: string;
    rdns: string;
  };
  provider: any;
}

export interface WalletState {
  address: string | null;
  chainId: number | null;
  isConnected: boolean;
  isConnecting: boolean;
  provider: BrowserProvider | null;
  connectorId: string | null;
}

interface WalletContextType extends WalletState {
  connect: (providerDetail?: EIP6963ProviderDetail) => Promise<void>;
  disconnect: () => void;
  switchChain: (chainId: number) => Promise<void>;
  availableProviders: EIP6963ProviderDetail[];
}

const WalletContext = createContext<WalletContextType | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WalletState>({
    address: null,
    chainId: null,
    isConnected: false,
    isConnecting: false,
    provider: null,
    connectorId: null,
  });

  const [availableProviders, setAvailableProviders] = useState<EIP6963ProviderDetail[]>([]);

  // Detect EIP-6963 providers
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const providers: EIP6963ProviderDetail[] = [];

    const handleAnnouncement = (event: any) => {
      if (event.detail) {
        providers.push(event.detail);
        setAvailableProviders([...providers]);
      }
    };

    window.addEventListener('eip6963:announceProvider', handleAnnouncement);
    window.dispatchEvent(new Event('eip6963:requestProvider'));

    // Fallback to window.ethereum if no EIP-6963 providers
    setTimeout(() => {
      if (providers.length === 0 && window.ethereum) {
        const fallbackProvider: EIP6963ProviderDetail = {
          info: {
            uuid: 'injected',
            name: 'Injected Wallet',
            icon: '',
            rdns: 'injected',
          },
          provider: window.ethereum,
        };
        providers.push(fallbackProvider);
        setAvailableProviders([fallbackProvider]);
      }
    }, 100);

    return () => {
      window.removeEventListener('eip6963:announceProvider', handleAnnouncement);
    };
  }, []);

  // Silent reconnection on mount
  useEffect(() => {
    const attemptReconnect = async () => {
      if (typeof window === 'undefined') return;

      const wasConnected = storage.getConnected();
      const lastConnectorId = storage.getLastConnectorId();
      const lastAccounts = storage.getLastAccounts();
      const lastAddress = lastAccounts[0]?.toLowerCase();

      if (!wasConnected || !lastConnectorId || !lastAddress) {
        console.log('[useWallet] No previous connection found');
        return;
      }

      // Wait for providers to be detected
      if (availableProviders.length === 0) {
        console.log('[useWallet] Waiting for providers to load...');
        return; // Providers not yet loaded, will retry when availableProviders updates
      }

      // Check if already reconnected
      if (state.isConnected) {
        console.log('[useWallet] Already connected');
        return;
      }

      console.log('[useWallet] Attempting silent reconnect for:', lastAddress);

      // Strategy 1: Try exact UUID match
      let providerDetail = availableProviders.find(
        (p) => p.info.uuid === lastConnectorId
      );

      // Strategy 2: If UUID doesn't match, find provider with matching accounts
      if (!providerDetail) {
        console.warn('[useWallet] UUID mismatch. Last:', lastConnectorId);
        console.warn('[useWallet] Available:', availableProviders.map(p => `${p.info.name} (${p.info.uuid})`));
        console.log('[useWallet] Searching for provider with account:', lastAddress);

        for (const provider of availableProviders) {
          try {
            const accounts = await provider.provider.request({ method: 'eth_accounts' });
            if (accounts && accounts.length > 0) {
              const matchingAccount = accounts.find((acc: string) => acc.toLowerCase() === lastAddress);
              if (matchingAccount) {
                console.log('[useWallet] Found matching provider:', provider.info.name);
                providerDetail = provider;
                break;
              }
            }
          } catch (err) {
            console.warn('[useWallet] Failed to query provider:', provider.info.name, err);
          }
        }
      }

      // Strategy 3: If only one provider available, try it
      if (!providerDetail && availableProviders.length === 1) {
        console.log('[useWallet] Only one provider available, trying it...');
        providerDetail = availableProviders[0];
      }

      if (!providerDetail) {
        console.error('[useWallet] No suitable provider found, clearing stale data');
        storage.clearWalletData();
        return;
      }

      try {
        // Silent reconnect using eth_accounts (no popup)
        const [accounts, chainIdHex] = await Promise.all([
          providerDetail.provider.request({ method: 'eth_accounts' }),
          providerDetail.provider.request({ method: 'eth_chainId' }),
        ]);

        if (accounts && accounts.length > 0) {
          // Verify the account matches (if we found by fallback strategy)
          const currentAddress = accounts[0].toLowerCase();
          if (providerDetail.info.uuid !== lastConnectorId && currentAddress !== lastAddress) {
            console.warn('[useWallet] Account mismatch, clearing data');
            storage.clearWalletData();
            return;
          }

          const chainId = parseInt(chainIdHex, 16);
          const browserProvider = new BrowserProvider(providerDetail.provider);

          console.log('[useWallet] Silent reconnect successful:', {
            provider: providerDetail.info.name,
            address: accounts[0],
            chainId,
            uuidUpdated: providerDetail.info.uuid !== lastConnectorId,
          });

          setState({
            address: accounts[0],
            chainId,
            isConnected: true,
            isConnecting: false,
            provider: browserProvider,
            connectorId: providerDetail.info.uuid,
          });

          // Update storage with current UUID (may have changed)
          storage.setLastConnectorId(providerDetail.info.uuid);
          storage.setLastAccounts(accounts);
          storage.setLastChainId(chainId);
          storage.setConnected(true);
        } else {
          console.log('[useWallet] No accounts returned, clearing data');
          storage.clearWalletData();
        }
      } catch (error) {
        console.error('[useWallet] Silent reconnect failed:', error);
        storage.clearWalletData();
      }
    };

    attemptReconnect();
  }, [availableProviders, state.isConnected]);

  // Setup event listeners for connected wallet
  useEffect(() => {
    if (!state.provider || !state.connectorId) return;

    const providerDetail = availableProviders.find(
      (p) => p.info.uuid === state.connectorId
    );

    if (!providerDetail) return;

    const { provider } = providerDetail;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnect();
      } else {
        setState((prev) => ({ ...prev, address: accounts[0] }));
        storage.setLastAccounts(accounts);
      }
    };

    const handleChainChanged = (chainIdHex: string) => {
      const chainId = parseInt(chainIdHex, 16);
      setState((prev) => ({ ...prev, chainId }));
      storage.setLastChainId(chainId);
      window.location.reload(); // Reload on chain change (best practice)
    };

    const handleDisconnect = () => {
      disconnect();
    };

    provider.on('accountsChanged', handleAccountsChanged);
    provider.on('chainChanged', handleChainChanged);
    provider.on('disconnect', handleDisconnect);

    return () => {
      provider.removeListener('accountsChanged', handleAccountsChanged);
      provider.removeListener('chainChanged', handleChainChanged);
      provider.removeListener('disconnect', handleDisconnect);
    };
  }, [state.provider, state.connectorId, availableProviders]);

  const connect = useCallback(
    async (providerDetail?: EIP6963ProviderDetail) => {
      if (state.isConnecting) return;

      setState((prev) => ({ ...prev, isConnecting: true }));

      try {
        // Use provided provider or first available
        const selectedProvider =
          providerDetail || availableProviders[0];

        if (!selectedProvider) {
          throw new Error('No wallet provider available');
        }

        const { provider, info } = selectedProvider;

        // Request accounts (with user interaction)
        const accounts = await provider.request({
          method: 'eth_requestAccounts',
        });

        const chainIdHex = await provider.request({
          method: 'eth_chainId',
        });
        const chainId = parseInt(chainIdHex, 16);

        const browserProvider = new BrowserProvider(provider);

        setState({
          address: accounts[0],
          chainId,
          isConnected: true,
          isConnecting: false,
          provider: browserProvider,
          connectorId: info.uuid,
        });

        // Persist connection
        storage.setLastConnectorId(info.uuid);
        storage.setLastAccounts(accounts);
        storage.setLastChainId(chainId);
        storage.setConnected(true);
      } catch (error) {
        console.error('Connection failed:', error);
        setState((prev) => ({ ...prev, isConnecting: false }));
        throw error;
      }
    },
    [availableProviders, state.isConnecting]
  );

  const disconnect = useCallback(() => {
    setState({
      address: null,
      chainId: null,
      isConnected: false,
      isConnecting: false,
      provider: null,
      connectorId: null,
    });
    storage.clearWalletData();
  }, []);

  const switchChain = useCallback(
    async (targetChainId: number) => {
      if (!state.provider || !state.connectorId) {
        throw new Error('Wallet not connected');
      }

      const providerDetail = availableProviders.find(
        (p) => p.info.uuid === state.connectorId
      );

      if (!providerDetail) {
        throw new Error('Provider not found');
      }

      const chainIdHex = `0x${targetChainId.toString(16)}`;

      try {
        await providerDetail.provider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: chainIdHex }],
        });
      } catch (error: any) {
        // Chain not added, try adding it
        if (error.code === 4902) {
          const chainConfig = getChainConfig(targetChainId);
          if (chainConfig) {
            await providerDetail.provider.request({
              method: 'wallet_addEthereumChain',
              params: [chainConfig],
            });
          } else {
            throw new Error('Unsupported chain ID');
          }
        } else {
          throw error;
        }
      }
    },
    [state.provider, state.connectorId, availableProviders]
  );

  return (
    <WalletContext.Provider
      value={{ ...state, connect, disconnect, switchChain, availableProviders }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within WalletProvider');
  }
  return context;
}

// Chain configurations
function getChainConfig(chainId: number) {
  const configs: Record<number, any> = {
    11155111: {
      chainId: '0xaa36a7',
      chainName: 'Sepolia Testnet',
      nativeCurrency: {
        name: 'SepoliaETH',
        symbol: 'ETH',
        decimals: 18,
      },
      rpcUrls: ['https://rpc.sepolia.org'],
      blockExplorerUrls: ['https://sepolia.etherscan.io'],
    },
  };
  return configs[chainId];
}

// Type augmentation for window.ethereum
declare global {
  interface WindowEventMap {
    'eip6963:announceProvider': CustomEvent;
  }
  interface Window {
    ethereum?: any;
  }
}
