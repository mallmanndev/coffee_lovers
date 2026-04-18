import { createCoffeeOutputSchema } from '@coffee-lovers/shared';
import { z } from 'zod';

export type CoffeeListItemDto = z.infer<typeof createCoffeeOutputSchema>;

export interface CoffeeDao {
  findForUser(userId: string, search?: string): Promise<CoffeeListItemDto[]>;
}

export const COFFEE_DAO = Symbol('CoffeeDao');
