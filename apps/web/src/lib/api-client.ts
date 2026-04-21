import { initClient } from '@ts-rest/core';
import { apiContract } from '@coffee-lovers/shared';
import { getAccessToken } from '@/lib/auth-session';

export const apiClient = initClient(apiContract, {
  baseUrl: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001',
  baseHeaders: {
    'Content-Type': 'application/json',
    Authorization: () => {
      const token = getAccessToken();
      return token ? `Bearer ${token}` : '';
    },
  },
});
