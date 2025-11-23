#!/usr/bin/env node

/**
 * Hardhat Node Detection Script
 * Checks if Hardhat node is running on localhost:8545
 */

import http from 'http';

const HARDHAT_HOST = '127.0.0.1';
const HARDHAT_PORT = 8545;

console.log('🔍 Checking for Hardhat node...');

const checkHardhatNode = () => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: HARDHAT_HOST,
      port: HARDHAT_PORT,
      path: '/',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      if (res.statusCode === 200 || res.statusCode === 405) {
        resolve(true);
      } else {
        reject(new Error(`Unexpected status code: ${res.statusCode}`));
      }
    });

    req.on('error', (error) => {
      reject(error);
    });

    // Send a simple JSON-RPC request
    req.write(JSON.stringify({
      jsonrpc: '2.0',
      method: 'net_version',
      params: [],
      id: 1,
    }));

    req.end();

    // Timeout after 2 seconds
    setTimeout(() => {
      req.destroy();
      reject(new Error('Request timeout'));
    }, 2000);
  });
};

try {
  await checkHardhatNode();
  console.log('✅ Hardhat node is running on http://127.0.0.1:8545');
  process.exit(0);
} catch (error) {
  console.error('❌ Hardhat node is not running!');
  console.error('   Please start the Hardhat node first:');
  console.error('   cd fhevm-hardhat-template && npx hardhat node');
  console.error('');
  console.error('   Or use "npm run dev" instead for Sepolia network.');
  process.exit(1);
}

