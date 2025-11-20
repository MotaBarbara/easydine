import z from "zod";

/**
 * Schemas for reservation-related requests
 */
export const createReservationBodySchema = z.object({
  restaurantId: z.string().uuid(),
  date: z.string().datetime(),
  time: z.string(),
  customerName: z.string().min(1),
  customerEmail: z.string().email(),
  groupSize: z.number().int().min(1),
});

export const authenticateBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const registerBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
});

