import z from "zod";
import { restaurantSettingsSchema } from "@/types/restaurant-settings";

/**
 * Schemas for restaurant-related requests
 */
export const createRestaurantBodySchema = z.object({
  name: z.string().min(1),
  logo: z.string().url().optional().nullable(),
  primaryColor: z
    .string()
    .regex(/^#([0-9a-fA-F]{6})$/, "hex color like #RRGGBB")
    .optional()
    .nullable(),
  settings: restaurantSettingsSchema.optional().nullable(),
});

export const updateRestaurantBodySchema = z.object({
  name: z.string().min(1).optional().nullable(),
  logo: z.string().url().optional().nullable().or(z.literal(null)),
  primaryColor: z
    .string()
    .regex(/^#([0-9a-fA-F]{6})$/, "hex color like #RRGGBB")
    .optional()
    .nullable(),
  settings: restaurantSettingsSchema.optional().nullable(),
});

