import { z } from 'zod';

export const registerBodySchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  confirmPassword: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
});

export const loginBodySchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const userResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  city: z.string(),
  state: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const authResponseSchema = z.object({
  user: userResponseSchema,
  accessToken: z.string(),
});

export type RegisterBody = z.infer<typeof registerBodySchema>;
export type LoginBody = z.infer<typeof loginBodySchema>;
export type UserResponse = z.infer<typeof userResponseSchema>;
export type AuthResponse = z.infer<typeof authResponseSchema>;
