import { z } from 'zod';
import { typeSpecificDataSchema } from './equipament.schema';

export const modificationSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
});

export const userEquipamentBaseSchema = z.object({
  description: z.string().optional(),
  modifications: z.array(modificationSchema).default([]),
  photos: z.array(z.string()).default([]),
  typeSpecificData: typeSpecificDataSchema,
});

export const userEquipamentResponseSchema = userEquipamentBaseSchema.extend({
  id: z.string(),
  equipamentId: z.string(),
  userId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Modification = z.infer<typeof modificationSchema>;
export type UserEquipamentBase = z.infer<typeof userEquipamentBaseSchema>;
export type UserEquipamentResponse = z.infer<typeof userEquipamentResponseSchema>;
