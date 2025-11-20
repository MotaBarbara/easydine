import z from "zod";

/**
 * Common parameter schemas used across multiple controllers
 */
export const uuidParamSchema = z.object({
  id: z.string().uuid(),
});

export const restaurantIdParamSchema = z.object({
  restaurantId: z.string().uuid(),
});

export const reservationIdParamSchema = z.object({
  reservationId: z.string().uuid(),
});

/**
 * Common query schemas
 */
export const dateQuerySchema = z.object({
  date: z.string().date().optional(),
});

