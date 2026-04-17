import { initContract } from '@ts-rest/core';
import { z } from 'zod';
import {
  equipmentBaseSchema,
  equipmentResponseSchema,
  mergedEquipmentResponseSchema,
  createEquipmentInputSchema,
  createEquipmentOutputSchema,
} from '../schemas/equipment.schema';
import { userEquipmentBaseSchema, userEquipmentResponseSchema } from '../schemas/user-equipment.schema';

const c = initContract();

export const equipmentContract = c.router({
  create: {
    method: 'POST',
    path: '/equipment',
    body: createEquipmentInputSchema,
    responses: {
      201: createEquipmentOutputSchema,
      401: z.object({ message: z.string() }),
      404: z.object({ message: z.string() }),
      409: z.object({ message: z.string() }),
    },
    summary: 'Create a new equipment in catalog and add to user collection',
  },
  list: {
    method: 'GET',
    path: '/equipment',
    query: z.object({
      type: z.string().optional(),
    }),
    responses: {
      200: z.array(equipmentResponseSchema),
    },
    summary: 'List catalog equipment',
  },
  get: {
    method: 'GET',
    path: '/equipment/:id',
    responses: {
      200: mergedEquipmentResponseSchema,
      404: z.object({ message: z.string() }),
    },
    summary: 'Get equipment details and user possession if exists',
  },
  update: {
    method: 'PUT',
    path: '/equipment/:id',
    body: userEquipmentBaseSchema.partial(),
    responses: {
      200: userEquipmentResponseSchema,
      401: z.object({ message: z.string() }),
      404: z.object({ message: z.string() }),
    },
    summary: 'Update personalized user equipment data',
  },
  delete: {
    method: 'DELETE',
    path: '/equipment/:id',
    body: z.object({}),
    responses: {
      204: z.null(),
      401: z.object({ message: z.string() }),
      404: z.object({ message: z.string() }),
    },
    summary: 'Remove equipment from user collection (does not delete catalog item)',
  },
});
