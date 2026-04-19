import { initContract } from '@ts-rest/core';
import { z } from 'zod';
import {
  registerBodySchema,
  loginBodySchema,
  userResponseSchema,
  authResponseSchema,
} from '../schemas/auth.schema';

const c = initContract();

export const authContract = c.router({
  register: {
    method: 'POST',
    path: '/accounts/register',
    body: registerBodySchema,
    responses: {
      201: userResponseSchema,
      400: z.object({ message: z.string() }),
      409: z.object({ message: z.string() }),
    },
    summary: 'Register a new user',
    metadata: {
      security: [],
    },
  },
  login: {
    method: 'POST',
    path: '/accounts/login',
    body: loginBodySchema,
    responses: {
      200: authResponseSchema,
      401: z.object({ message: z.string() }),
    },
    summary: 'Login with credentials',
    metadata: {
      security: [],
    },
  },
  getProfile: {
    method: 'GET',
    path: '/profile/:id',
    pathParams: z.object({
      id: z.string(),
    }),
    responses: {
      200: userResponseSchema,
      401: z.object({ message: z.string() }),
      404: z.object({ message: z.string() }),
    },
    summary: 'Get user profile',
  },
});
