import { z } from 'zod';

export const EquipamentTypeEnum = z.enum([
  'GRINDER',
  'SCALE',
  'KETTLE',
  'ESPRESSO_MACHINE',
  'MISC',
]);

export type EquipamentType = z.infer<typeof EquipamentTypeEnum>;

const GrinderDataSchema = z.object({
  clicks: z.number().optional(),
});

const EspressoMachineDataSchema = z.object({
  portafilterSize: z.enum(['51mm', '58mm']).optional(),
});

const GenericDataSchema = z.object({});

export const typeSpecificDataSchema = z.union([
  GrinderDataSchema,
  EspressoMachineDataSchema,
  GenericDataSchema,
]);

export const equipamentBaseSchema = z.object({
  type: EquipamentTypeEnum,
  name: z.string().min(1),
  model: z.string().min(1),
  brand: z.string().min(1),
  description: z.string().optional(),
  photos: z.array(z.string()).default([]),
});

export const equipamentResponseSchema = equipamentBaseSchema.extend({
  id: z.string(),
  createdById: z.string(),
  typeSpecificData: typeSpecificDataSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const mergedEquipamentResponseSchema = equipamentResponseSchema.extend({
  userEquipamentId: z.string().optional(),
  description: z.string().optional(),
  modifications: z.array(z.any()).default([]),
  userPhotos: z.array(z.string()).default([]),
  userTypeSpecificData: typeSpecificDataSchema.optional(),
  isOwned: z.boolean().default(false),
});

export type EquipamentBase = z.infer<typeof equipamentBaseSchema>;
export type EquipamentResponse = z.infer<typeof equipamentResponseSchema>;
export type MergedEquipamentResponse = z.infer<typeof mergedEquipamentResponseSchema>;

export const createEquipamentInputSchema = z.object({
  equipamentId: z.string().optional(),
  type: EquipamentTypeEnum,
  name: z.string().min(1),
  model: z.string().min(1),
  brand: z.string().min(1),
  description: z.string().optional(),
  photos: z.array(z.string()).default([]),
  modifications: z.array(z.any()).default([]),
  typeSpecificData: z.record(z.any()).optional(),
});

export const createEquipamentOutputSchema = z.object({
  id: z.string(),
  type: EquipamentTypeEnum,
  name: z.string(),
  model: z.string(),
  brand: z.string(),
  description: z.string().optional(),
  photos: z.array(z.string()),
  createdById: z.string(),
  typeSpecificData: z.record(z.any()),
  userEquipamentId: z.string(),
  modifications: z.array(z.any()),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type CreateEquipamentInput = z.infer<typeof createEquipamentInputSchema>;
export type CreateEquipamentOutput = z.infer<typeof createEquipamentOutputSchema>;
