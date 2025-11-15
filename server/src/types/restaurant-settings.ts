import z from "zod";

const hhmm = z
  .string()
  .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "time must be HH:MM");

const ymd = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date must be YYYY-MM-DD");

const Slot = z
  .object({
    from: hhmm,
    to: hhmm,
    maxReservations: z.number().int().min(1),
  })
  .refine(s => s.from < s.to, {
    message: "`from` must be before `to`",
    path: ["to"],
  });

const ClosedWeekly = z
  .object({
    weekday: z.number().int().min(0).max(6),
    from: hhmm.optional(),
    to: hhmm.optional(),
  })
  .refine(cw => !(cw.from && cw.to) || cw.from < cw.to, {
    message: "`from` must be before `to`",
    path: ["to"],
  });

const ClosedDate = z
  .object({
    date: ymd,
    from: hhmm.optional(),
    to: hhmm.optional(),
  })
  .refine(cd => !(cd.from && cd.to) || cd.from < cd.to, {
    message: "`from` must be before `to`",
    path: ["to"],
  });

export const restaurantSettingsSchema = z
  .object({
    slots: z.array(Slot).optional(),
    closedWeekly: z.array(ClosedWeekly).optional(),
    closedDates: z.array(ClosedDate).optional(),
  })
  .refine(
    obj => {
      const slots = obj.slots ?? [];
      const sorted = [...slots].sort((a, b) => a.from.localeCompare(b.from));

      for (let i = 1; i < sorted.length; i++) {
        const curr = sorted[i]!;
        const prev = sorted[i - 1]!;
        if (curr.from < prev.to) return false;
      }
      return true;
    },
    {
      path: ["slots"],
      message: "slots must not overlap",
    },
  );

export type RestaurantSettings = z.infer<typeof restaurantSettingsSchema>;
