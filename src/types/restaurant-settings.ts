import z from "zod";

export type RestaurantSettings = {
  slots?: { from: string; to: string; maxReservations: number }[];
  closedWeekly?: Array<{
    weekday: number;
    from?: string;
    to?: string;
  }>;
  closedDates?: Array<{
    date: string;
    from?: string;
    to?: string;
  }>;
};

export const restaurantSettingsSchema = z.object({
  timezone: z.string().optional(),
  slots: z
    .array(
      z.object({
        from: z.string(),
        to: z.string(),
        maxReservations: z.number().int().min(1),
      }),
    )
    .optional(),
  closedWeekly: z
    .array(
      z.object({
        weekday: z.number().int().min(0).max(6),
        from: z.string().optional(),
        to: z.string().optional(),
      }),
    )
    .optional(),
  closedDates: z
    .array(
      z.object({
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        from: z.string().optional(),
        to: z.string().optional(),
      }),
    )
    .optional(),
});
