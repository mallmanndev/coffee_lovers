import { initContract } from '@ts-rest/core';
import { z } from 'zod';
import { addCoffeeToStockInputSchema, stockItemResponseSchema } from '../schemas/stock.schema';

const c = initContract();

export const stockContract = c.router({
  add: {
    method: 'POST',
    path: '/stock',
    body: addCoffeeToStockInputSchema,
    responses: {
      201: stockItemResponseSchema,
      401: z.object({ message: z.string() }),
      404: z.object({ message: z.string() }),
    },
    summary: 'Add coffee to stock',
  },
});
