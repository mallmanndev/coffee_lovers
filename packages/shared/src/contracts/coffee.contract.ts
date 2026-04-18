import { initContract } from '@ts-rest/core';
import { z } from 'zod';
import { createCoffeeInputSchema, createCoffeeOutputSchema } from '../schemas/coffee.schema';

const c = initContract();

export const coffeeContract = c.router({
  create: {
    method: 'POST',
    path: '/coffee',
    body: createCoffeeInputSchema,
    responses: {
      201: createCoffeeOutputSchema,
      401: z.object({ message: z.string() }),
    },
    summary: 'Create a coffee registry entry',
  },
  list: {
    method: 'GET',
    path: '/coffee',
    query: z.object({
      search: z.string().optional(),
    }),
    responses: {
      200: z.array(createCoffeeOutputSchema),
      401: z.object({ message: z.string() }),
    },
    summary: 'List coffees for the authenticated user',
  },
});
