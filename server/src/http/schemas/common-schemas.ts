import z from "zod";

export const uuidParamSchema = z.object({
  id: z.string().uuid(),
});

export const restaurantIdParamSchema = z.object({
  restaurantId: z.string().uuid(),
});

export const reservationIdParamSchema = z.object({
  reservationId: z.string().uuid(),
});
export const dateQuerySchema = z.object({
  date: z.string().date().optional(),
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

