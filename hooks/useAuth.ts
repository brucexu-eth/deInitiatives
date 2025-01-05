'use client';

import { useState, useCallback, useEffect } from 'react';
import { useAccount, useSignMessage } from 'wagmi';

export function useAuth() {
  const { address } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load token from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const login = useCallback(async () => {
    if (!address) return;

    try {
      setIsLoading(true);
      // Get nonce
      const nonceResponse = await fetch(`/api/auth/nonce?address=${address}`);
      if (!nonceResponse.ok) {
        throw new Error('Failed to get nonce');
      }
      const { nonce } = await nonceResponse.json();

      // Create message to sign
      const message = `Sign this message to prove you own this wallet.\nNonce: ${nonce}`;

      // Get signature
      const signature = await signMessageAsync({ message });

      // Verify signature and get token
      const verifyResponse = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          signature,
          message,
          address,
        }),
      });

      if (!verifyResponse.ok) {
        throw new Error('Failed to verify signature');
      }

      const { token: newToken } = await verifyResponse.json();
      localStorage.setItem('auth_token', newToken);
      setToken(newToken);
    } catch (error) {
      console.error('Login error:', error);
      localStorage.removeItem('auth_token');
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  }, [address, signMessageAsync]);

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token');
    setToken(null);
  }, []);

  return {
    token,
    login,
    logout,
    isLoading,
  };
}
