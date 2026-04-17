import { initContract } from '@ts-rest/core';
import { z } from 'zod';
import {
  equipamentBaseSchema,
  equipamentResponseSchema,
  mergedEquipamentResponseSchema,
  createEquipamentInputSchema,
  createEquipamentOutputSchema,
} from '../schemas/equipament.schema';
import { userEquipamentBaseSchema, userEquipamentResponseSchema } from '../schemas/user-equipament.schema';

const c = initContract();

export const equipamentContract = c.router({
  create: {
    method: 'POST',
    path: '/equipament',
    body: createEquipamentInputSchema,
    responses: {
      201: createEquipamentOutputSchema,
      401: z.object({ message: z.string() }),
      404: z.object({ message: z.string() }),
      409: z.object({ message: z.string() }),
    },
    summary: 'Create a new equipament in catalog and add to user collection',
  },
  list: {
    method: 'GET',
    path: '/equipament',
    query: z.object({
      type: z.string().optional(),
    }),
    responses: {
      200: z.array(equipamentResponseSchema),
    },
    summary: 'List catalog equipament',
  },
  get: {
    method: 'GET',
    path: '/equipament/:id',
    responses: {
      200: mergedEquipamentResponseSchema,
      404: z.object({ message: z.string() }),
    },
    summary: 'Get equipament details and user possession if exists',
  },
  update: {
    method: 'PUT',
    path: '/equipament/:id',
    body: userEquipamentBaseSchema.partial(),
    responses: {
      200: userEquipamentResponseSchema,
      401: z.object({ message: z.string() }),
      404: z.object({ message: z.string() }),
    },
    summary: 'Update personalized user equipament data',
  },
  delete: {
    method: 'DELETE',
    path: '/equipament/:id',
    body: z.object({}),
    responses: {
      204: z.null(),
      401: z.object({ message: z.string() }),
      404: z.object({ message: z.string() }),
    },
    summary: 'Remove equipament from user collection (does not delete catalog item)',
  },
});
