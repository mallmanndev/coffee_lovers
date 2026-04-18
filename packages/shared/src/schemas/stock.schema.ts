import { z } from 'zod';

export const addCoffeeToStockInputSchema = z.object({
  coffeeId: z.string().uuid().or(z.string().min(1)), // Can be cuid or objectId depending on DB, but sticking to general string validation for now or follow project pattern
  quantity: z.number().positive(), // em kg
  roastDate: z.string().datetime(),
  freezingDate: z.string().datetime().optional(),
  code: z.string().min(1),
});

export const stockItemResponseSchema = addCoffeeToStockInputSchema.extend({
  id: z.string(),
  userId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type AddCoffeeToStockInput = z.infer<typeof addCoffeeToStockInputSchema>;
export type StockItemResponse = z.infer<typeof stockItemResponseSchema>;
