import z from "zod";

export const createReservationBodySchema = z.object({
  restaurantId: z.string().uuid(),
  date: z.string().datetime(),
  time: z.string(),
  customerName: z.string().min(1),
  customerEmail: z.string().email(),
  groupSize: z.number().int().min(1),
});

