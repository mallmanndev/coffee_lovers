import { z } from 'zod';

export const coffeeProcessingSchema = z.object({
  processing_method: z.string().optional(),
  fermentation_details: z.string().optional(),
  drying_method: z.string().optional(),
});

export const coffeeRoastSchema = z.object({
  roast_profile: z.string().optional(),
});

export const coffeeSensoryProfileSchema = z.object({
  notes: z.string().optional(),
  acidity: z.string().optional(),
  body: z.string().optional(),
  sweetness: z.string().optional(),
  finish: z.string().optional(),
  sca_score: z.number().nullable().optional(),
});

export const createCoffeeInputSchema = z.object({
  coffee_name: z.string().min(1),
  roastery: z.string().min(1),
  producer_farm: z.string().optional(),
  origin_country: z.string().optional(),
  region: z.string().optional(),
  altitude_meters: z.number().nullable().optional(),
  variety: z.string().optional(),
  photos: z.array(z.string().url()).optional(),
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
