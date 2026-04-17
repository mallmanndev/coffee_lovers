import { z } from 'zod';

export const coffeeProcessingSchema = z.object({
  processing_method: z.string().min(1).optional(),
  fermentation_details: z.string().min(1).optional(),
  drying_method: z.string().min(1).optional(),
});

export const coffeeRoastSchema = z.object({
  roast_profile: z.string().min(1).optional(),
});

export const coffeeSensoryProfileSchema = z.object({
  notes: z.string().min(1).optional(),
  acidity: z.string().min(1).optional(),
  body: z.string().min(1).optional(),
  sweetness: z.string().min(1).optional(),
  finish: z.string().min(1).optional(),
  sca_score: z.number().nullable().optional(),
});

export const createCoffeeInputSchema = z.object({
  coffee_name: z.string().min(1),
  producer_farm: z.string().min(1).optional(),
  roastery: z.string().min(1),
  origin_country: z.string().min(1).optional(),
  region: z.string().min(1).optional(),
  altitude_meters: z.number().nullable().optional(),
  variety: z.string().min(1).optional(),
  processing: coffeeProcessingSchema.optional(),
  roast: coffeeRoastSchema.optional(),
  sensory_profile: coffeeSensoryProfileSchema.optional(),
});

export const createCoffeeOutputSchema = createCoffeeInputSchema.extend({
  id: z.string(),
  userId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type CreateCoffeeInput = z.infer<typeof createCoffeeInputSchema>;
export type CreateCoffeeOutput = z.infer<typeof createCoffeeOutputSchema>;
