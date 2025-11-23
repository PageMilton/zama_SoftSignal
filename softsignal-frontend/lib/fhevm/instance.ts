/**
 * FHEVM Instance Management
 * Handles creation and caching of FHEVM instances for encryption/decryption
 */

import { BrowserProvider, JsonRpcProvider } from 'ethers';
import { storage } from '../utils/storage';

// Type definitions for FHEVM instances
export type HandleContractPair = {
  handle: string;
  contractAddress: string;
};

// v0.3.0 renamed DecryptedResults → UserDecryptResults
export type UserDecryptResults = Record<string, bigint>;
// Backward compatibility alias
export type DecryptedResults = UserDecryptResults;

export type EIP712Message = {
  domain: {
    chainId: number;
    name: string;
    verifyingContract: string;
    version: string;
  };
  message: any;
  primaryType: string;
  types: Record<string, Array<{ name: string; type: string }>>;
};

export type FhevmInstance = {
  encrypt16: (value: number) => Promise<string>;
  encrypt32: (value: number) => Promise<string>;
  createEncryptedInput: (contractAddress: string, userAddress: string) => any;
  getPublicKey: () => string;
  getPublicParams: (size?: number) => string;
  generateKeypair: () => { publicKey: string; privateKey: string };
  createEIP712: (
    publicKey: string,
    contractAddresses: string[],
    startTimestamp: number,
    durationDays: number
  ) => EIP712Message;
  userDecrypt: (
    handles: HandleContractPair[],
    privateKey: string,
    publicKey: string,
    signature: string,
    contractAddresses: string[],
    userAddress: string,
    startTimestamp: number,
    durationDays: number
  ) => Promise<UserDecryptResults>;
};

let cachedInstance: FhevmInstance | null = null;
let cachedChainId: number | null = null;

/**
 * Creates or returns cached FHEVM instance
 */
export async function getFhevmInstance(
  provider: BrowserProvider,
  chainId: number
): Promise<FhevmInstance> {
  // Return cached instance if chain hasn't changed
  if (cachedInstance && cachedChainId === chainId) {
    return cachedInstance;
  }

  // Determine if we're on localhost (mock mode) or real network
  const isMockMode = chainId === 31337;

  if (isMockMode) {
    // Try to fetch FHEVM Hardhat node metadata
    const rpcUrl = 'http://localhost:8545';
    const metadata = await tryFetchFHEVMHardhatNodeRelayerMetadata(rpcUrl);

    if (!metadata) {
      throw new Error(
        'Failed to fetch FHEVM relayer metadata from Hardhat node. ' +
        'Make sure the Hardhat node is running with FHEVM support.'
      );
    }

    // Dynamic import for mock mode
    const { MockFhevmInstance } = await import('@fhevm/mock-utils');
    const { Contract } = await import('ethers');
    const rpcProvider = new JsonRpcProvider(rpcUrl);

    // Query InputVerifier EIP712 domain for verifyingContract address and chainId
    const inputVerifierContract = new Contract(
      metadata.InputVerifierAddress,
      ["function eip712Domain() external view returns (bytes1, string, string, uint256, address, bytes32, uint256[])"],
      rpcProvider
    );
    const domain = await inputVerifierContract.eip712Domain();
    const verifyingContractAddressInputVerification = domain[4]; // index 4: verifyingContract
    const gatewayChainId = Number(domain[3]); // index 3: chainId (must match gatewayChainId)

    console.log('[Mock] InputVerifier EIP712 domain:', {
      verifyingContract: verifyingContractAddressInputVerification,
      chainId: gatewayChainId,
    });

    const instance = await MockFhevmInstance.create(
      rpcProvider,
      rpcProvider,
      {
        aclContractAddress: metadata.ACLAddress,
        chainId: chainId,
        gatewayChainId: gatewayChainId, // Must match InputVerifier EIP712 domain chainId
        inputVerifierContractAddress: metadata.InputVerifierAddress,
        kmsContractAddress: metadata.KMSVerifierAddress,
        verifyingContractAddressDecryption: '0x5ffdaAB0373E62E2ea2944776209aEf29E631A64',
        verifyingContractAddressInputVerification: verifyingContractAddressInputVerification,
      },
      {
        // v0.3.0 requires 4th parameter: properties
        inputVerifierProperties: {},
        kmsVerifierProperties: {},
      }
    );

    cachedInstance = instance as unknown as FhevmInstance;
    cachedChainId = chainId;

    return cachedInstance;
  } else {
    // Real network mode - use relayer SDK
    // The relayer SDK is loaded dynamically via CDN in the browser
    if (typeof window === 'undefined') {
      throw new Error('FHEVM instance can only be created in browser environment.');
    }

    // Wait for SDK to load (with timeout)
    const maxWaitTime = 10000; // 10 seconds
    const checkInterval = 100; // 100ms
    let waited = 0;
    
    while (!(window as any).relayerSDK && waited < maxWaitTime) {
      await new Promise(resolve => setTimeout(resolve, checkInterval));
      waited += checkInterval;
    }

    if (!(window as any).relayerSDK) {
      throw new Error(
        'Relayer SDK failed to load after 10 seconds. ' +
        'Check your internet connection or use Mock mode (npm run dev:mock).'
      );
    }

    const relayerSDK = (window as any).relayerSDK;

    // Initialize SDK if not already done
    if (!relayerSDK.__initialized__) {
      await relayerSDK.initSDK();
      relayerSDK.__initialized__ = true;
    }

    // v0.9: Use ZamaEthereumConfig instead of SepoliaConfig
    const networkConfig = relayerSDK.ZamaEthereumConfig || relayerSDK.SepoliaConfig;
    
    if (!networkConfig) {
      throw new Error('FHEVM network config not found in relayer SDK');
    }

    // Get ACL address for storage key
    const aclAddress = networkConfig.aclContractAddress;

    // Check for cached public key and params
    const cachedPub = storage.getPublicKey(chainId);
    const cachedParams = storage.get(`fhevm.publicParams.${aclAddress}`);

    // Use the provider passed to this function (already a BrowserProvider)
    const config = {
      ...networkConfig,
      network: provider,
      publicKey: cachedPub || undefined,
      publicParams: cachedParams || undefined,
    };

    console.log('[FHEVM] Creating instance with config:', { chainId, aclAddress });

    const instance = await relayerSDK.createInstance(config);

    // Cache public key and params if we didn't have them
    if (!cachedPub) {
      storage.setPublicKey(chainId, instance.getPublicKey());
    }
    if (!cachedParams) {
      storage.set(`fhevm.publicParams.${aclAddress}`, instance.getPublicParams(2048));
    }

    cachedInstance = instance as unknown as FhevmInstance;
    cachedChainId = chainId;

    return cachedInstance;
  }
}

/**
 * Try to fetch FHEVM relayer metadata from Hardhat node
 */
async function tryFetchFHEVMHardhatNodeRelayerMetadata(
  rpcUrl: string
): Promise<
  | {
      ACLAddress: `0x${string}`;
      InputVerifierAddress: `0x${string}`;
      KMSVerifierAddress: `0x${string}`;
    }
  | undefined
> {
  try {
    const rpc = new JsonRpcProvider(rpcUrl);

    // Check if it's a Hardhat node
    const version = await rpc.send('web3_clientVersion', []);
    if (typeof version !== 'string' || !version.toLowerCase().includes('hardhat')) {
      rpc.destroy();
      return undefined;
    }

    // Try to fetch FHEVM metadata
    const metadata = await rpc.send('fhevm_relayer_metadata', []);
    rpc.destroy();

    if (!metadata || typeof metadata !== 'object') {
      return undefined;
    }

    // Validate metadata
    if (
      !('ACLAddress' in metadata) ||
      typeof metadata.ACLAddress !== 'string' ||
      !metadata.ACLAddress.startsWith('0x')
    ) {
      return undefined;
    }

    if (
      !('InputVerifierAddress' in metadata) ||
      typeof metadata.InputVerifierAddress !== 'string' ||
      !metadata.InputVerifierAddress.startsWith('0x')
    ) {
      return undefined;
    }

    if (
      !('KMSVerifierAddress' in metadata) ||
      typeof metadata.KMSVerifierAddress !== 'string' ||
      !metadata.KMSVerifierAddress.startsWith('0x')
    ) {
      return undefined;
    }

    return metadata as {
      ACLAddress: `0x${string}`;
      InputVerifierAddress: `0x${string}`;
      KMSVerifierAddress: `0x${string}`;
    };
  } catch (error) {
    console.error('Failed to fetch FHEVM relayer metadata:', error);
    return undefined;
  }
}

/**
 * Clears cached instance (call when chain changes)
 */
export function clearFhevmInstance() {
  cachedInstance = null;
  cachedChainId = null;
}
