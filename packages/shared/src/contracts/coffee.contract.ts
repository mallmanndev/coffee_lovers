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
});
