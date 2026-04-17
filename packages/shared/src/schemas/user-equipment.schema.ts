import { z } from 'zod';
import { typeSpecificDataSchema } from './equipment.schema';

export const modificationSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
});

export const userEquipmentBaseSchema = z.object({
  description: z.string().optional(),
  modifications: z.array(modificationSchema).default([]),
  photos: z.array(z.string()).default([]),
  typeSpecificData: typeSpecificDataSchema,
});

export const userEquipmentResponseSchema = userEquipmentBaseSchema.extend({
  id: z.string(),
  equipmentId: z.string(),
  userId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Modification = z.infer<typeof modificationSchema>;
export type UserEquipmentBase = z.infer<typeof userEquipmentBaseSchema>;
export type UserEquipmentResponse = z.infer<typeof userEquipmentResponseSchema>;
