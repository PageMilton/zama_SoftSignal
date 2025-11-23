/**
 * LocalStorage utility for wallet and FHEVM persistence
 */

const STORAGE_KEYS = {
  WALLET_LAST_CONNECTOR_ID: 'wallet.lastConnectorId',
  WALLET_LAST_ACCOUNTS: 'wallet.lastAccounts',
  WALLET_LAST_CHAIN_ID: 'wallet.lastChainId',
  WALLET_CONNECTED: 'wallet.connected',
  FHEVM_DECRYPTION_SIGNATURE_PREFIX: 'fhevm.decryptionSignature.',
  FHEVM_PUBLIC_KEY: 'fhevm.publicKey.',
} as const;

export const storage = {
  // Wallet persistence
  setLastConnectorId(connectorId: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.WALLET_LAST_CONNECTOR_ID, connectorId);
    }
  },

  getLastConnectorId(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_KEYS.WALLET_LAST_CONNECTOR_ID);
    }
    return null;
  },

  setLastAccounts(accounts: string[]) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.WALLET_LAST_ACCOUNTS, JSON.stringify(accounts));
    }
  },

  getLastAccounts(): string[] {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEYS.WALLET_LAST_ACCOUNTS);
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  },

  setLastChainId(chainId: number) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.WALLET_LAST_CHAIN_ID, chainId.toString());
    }
  },

  getLastChainId(): number | null {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEYS.WALLET_LAST_CHAIN_ID);
      return stored ? parseInt(stored, 10) : null;
    }
    return null;
  },

  setConnected(connected: boolean) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.WALLET_CONNECTED, connected.toString());
    }
  },

  getConnected(): boolean {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_KEYS.WALLET_CONNECTED) === 'true';
    }
    return false;
  },

  clearWalletData() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.WALLET_LAST_CONNECTOR_ID);
      localStorage.removeItem(STORAGE_KEYS.WALLET_LAST_ACCOUNTS);
      localStorage.removeItem(STORAGE_KEYS.WALLET_LAST_CHAIN_ID);
      localStorage.removeItem(STORAGE_KEYS.WALLET_CONNECTED);
    }
  },

  // FHEVM decryption signature (per account)
  setDecryptionSignature(account: string, signature: string) {
    if (typeof window !== 'undefined') {
      const key = `${STORAGE_KEYS.FHEVM_DECRYPTION_SIGNATURE_PREFIX}${account.toLowerCase()}`;
      localStorage.setItem(key, signature);
    }
  },

  getDecryptionSignature(account: string): string | null {
    if (typeof window !== 'undefined') {
      const key = `${STORAGE_KEYS.FHEVM_DECRYPTION_SIGNATURE_PREFIX}${account.toLowerCase()}`;
      return localStorage.getItem(key);
    }
    return null;
  },

  clearDecryptionSignature(account: string) {
    if (typeof window !== 'undefined') {
      const key = `${STORAGE_KEYS.FHEVM_DECRYPTION_SIGNATURE_PREFIX}${account.toLowerCase()}`;
      localStorage.removeItem(key);
    }
  },

  // FHEVM public key (per network)
  setPublicKey(chainId: number, publicKey: string) {
    if (typeof window !== 'undefined') {
      const key = `${STORAGE_KEYS.FHEVM_PUBLIC_KEY}${chainId}`;
      localStorage.setItem(key, publicKey);
    }
  },

  getPublicKey(chainId: number): string | null {
    if (typeof window !== 'undefined') {
      const key = `${STORAGE_KEYS.FHEVM_PUBLIC_KEY}${chainId}`;
      return localStorage.getItem(key);
    }
    return null;
  },

  // Generic storage methods
  set(key: string, value: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, value);
    }
  },

  get(key: string): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(key);
    }
    return null;
  },

  remove(key: string) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key);
    }
  },
};
