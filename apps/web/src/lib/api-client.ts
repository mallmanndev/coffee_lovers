import { initClient } from '@ts-rest/core';
import { authContract } from '@coffee-lovers/shared';

export const apiClient = initClient(authContract, {
  baseUrl: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001',
  baseHeaders: {
    'Content-Type': 'application/json',
  },
});
