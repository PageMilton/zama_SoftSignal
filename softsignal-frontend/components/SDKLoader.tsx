'use client';

import { useEffect } from 'react';

/**
 * Client component to load Relayer SDK dynamically
 * This needs to be a client component to handle script loading and errors
 */
export function SDKLoader() {
  useEffect(() => {
    // Check if SDK is already loaded
    if ((window as any).relayerSDK) {
      console.log('[SDKLoader] Relayer SDK already loaded');
      return;
    }

    // Try to load from CDN first
    const cdnScript = document.createElement('script');
    cdnScript.src = 'https://cdn.zama.org/relayer-sdk-js/0.3.0-5/relayer-sdk-js.umd.cjs';
    cdnScript.async = true;
    
    cdnScript.onload = () => {
      console.log('[SDKLoader] Relayer SDK loaded from CDN');
    };

    cdnScript.onerror = () => {
      console.warn('[SDKLoader] Failed to load SDK from CDN, falling back to local copy');
      const localScript = document.createElement('script');
      localScript.src = '/relayer-sdk-js.umd.cjs';
      localScript.async = true;
      localScript.onload = () => {
        console.log('[SDKLoader] Relayer SDK loaded from local copy');
      };
      localScript.onerror = () => {
        console.error('[SDKLoader] Failed to load SDK from local copy');
      };
      document.head.appendChild(localScript);
    };

    document.head.appendChild(cdnScript);
  }, []);

  return null;
}
