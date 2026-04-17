import { z } from 'zod';

export const EquipmentTypeEnum = z.enum([
  'GRINDER',
  'SCALE',
  'KETTLE',
  'ESPRESSO_MACHINE',
  'MISC',
]);

export type EquipmentType = z.infer<typeof EquipmentTypeEnum>;

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

export const equipmentBaseSchema = z.object({
  type: EquipmentTypeEnum,
  name: z.string().min(1),
  model: z.string().min(1),
  brand: z.string().min(1),
  description: z.string().optional(),
  photos: z.array(z.string()).default([]),
});

export const equipmentResponseSchema = equipmentBaseSchema.extend({
  id: z.string(),
  createdById: z.string(),
  typeSpecificData: typeSpecificDataSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const mergedEquipmentResponseSchema = equipmentResponseSchema.extend({
  userEquipmentId: z.string().optional(),
  description: z.string().optional(),
  modifications: z.array(z.any()).default([]),
  userPhotos: z.array(z.string()).default([]),
  userTypeSpecificData: typeSpecificDataSchema.optional(),
  isOwned: z.boolean().default(false),
});

export type EquipmentBase = z.infer<typeof equipmentBaseSchema>;
export type EquipmentResponse = z.infer<typeof equipmentResponseSchema>;
export type MergedEquipmentResponse = z.infer<typeof mergedEquipmentResponseSchema>;
