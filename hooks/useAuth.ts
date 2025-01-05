'use client';

import { useState, useCallback, useEffect } from 'react';
import { useAccount, useSignMessage } from 'wagmi';

export function useAuth() {
  const { address } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load token from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    if (storedToken) {
      setToken(storedToken);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async () => {
    if (!address) return;

    try {
      // Get nonce
      const nonceResponse = await fetch('/api/auth/nonce', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address }),
      });
      
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
        const error = await verifyResponse.json();
        throw new Error(error.error || 'Failed to verify signature');
      }

      const { token: newToken } = await verifyResponse.json();

      // Store token
      localStorage.setItem('auth_token', newToken);
      setToken(newToken);

      return newToken;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
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
