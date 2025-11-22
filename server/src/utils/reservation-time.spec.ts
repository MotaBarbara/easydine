import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  dayMonthYear,
  weekday,
  timeInRange,
  isPastDay,
  isPastDateTime,
  isClosedAt,
} from "./reservation-time";
import type { RestaurantSettings } from "@/types/restaurant-settings";

describe("reservation-time", () => {
  describe("dayMonthYear", () => {
    it("should format date as YYYY-MM-DD in UTC", () => {
      const date = new Date("2025-01-15T10:30:00Z");
      expect(dayMonthYear(date)).toBe("2025-01-15");
    });

    it("You must fill in the months and days with a single digit.", () => {
      const date = new Date("2025-01-05T10:30:00Z");
      expect(dayMonthYear(date)).toBe("2025-01-05");
    });
  });

  describe("weekday", () => {
    it("should return the weekday", () => {
      const date = new Date("2025-01-15T10:30:00Z");
      expect(weekday(date)).toBe(3);
    });
  });

  describe("timeInRange", () => {
    it("should return true when no from/to provided", () => {
      expect(timeInRange("12:00")).toBe(true);
    });

    it("should return true when time is within range", () => {
      expect(timeInRange("13:00", "12:00", "14:00")).toBe(true);
    });

    it("should return false when time is before from", () => {
      expect(timeInRange("11:00", "12:00", "14:00")).toBe(false);
    });

    it("should return false when time is at or after to", () => {
      expect(timeInRange("14:00", "12:00", "14:00")).toBe(false);
    });

    it("should return true when only from is provided and time is after", () => {
      expect(timeInRange("13:00", "12:00")).toBe(true);
    });

    it("should return true when only to is provided and time is before", () => {
      expect(timeInRange("13:00", undefined, "14:00")).toBe(true);
    });
  });

  describe("isPastDay", () => {
    it("should return true for past dates", () => {
      const pastDate = new Date("2020-01-01T10:00:00Z");
      expect(isPastDay(pastDate)).toBe(true);
    });

    it("should return false for today", () => {
      const today = new Date();
      expect(isPastDay(today)).toBe(false);
    });

    it("should return false for future dates", () => {
      const futureDate = new Date("2030-01-01T10:00:00Z");
      expect(isPastDay(futureDate)).toBe(false);
    });
  });

  describe("isPastDateTime", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("should return true for past dates", () => {
      vi.setSystemTime(new Date("2025-01-15T12:00:00Z"));
      const pastDate = new Date("2025-01-14T10:00:00Z");
      expect(isPastDateTime(pastDate, "10:00")).toBe(true);
    });

    it("should return true for past times on today", () => {
      vi.setSystemTime(new Date("2025-01-15T14:00:00Z"));
      const today = new Date("2025-01-15T10:00:00Z");
      expect(isPastDateTime(today, "13:00")).toBe(true);
    });

    it("should return false for future times on today", () => {
      vi.setSystemTime(new Date("2025-01-15T12:00:00Z"));
      const today = new Date("2025-01-15T10:00:00Z");
      expect(isPastDateTime(today, "13:00")).toBe(false);
    });

    it("should return false for future dates", () => {
      vi.setSystemTime(new Date("2025-01-15T12:00:00Z"));
      const futureDate = new Date("2025-01-16T10:00:00Z");
      expect(isPastDateTime(futureDate, "10:00")).toBe(false);
    });

    it("should handle invalid time format", () => {
      vi.setSystemTime(new Date("2025-01-15T12:00:00Z"));
      const today = new Date("2025-01-15T10:00:00Z");
      expect(isPastDateTime(today, "invalid")).toBe(true);
    });

    it("should handle time without minutes", () => {
      vi.setSystemTime(new Date("2025-01-15T12:00:00Z"));
      const today = new Date("2025-01-15T10:00:00Z");
      expect(isPastDateTime(today, "11")).toBe(true);
    });
  });

  describe("isClosedAt", () => {
    const settings: RestaurantSettings = {
      slots: [],
      closedDates: [
        { date: "2025-12-25", from: "18:00", to: "23:59" },
      ],
      closedWeekly: [
        { weekday: 1, from: "12:00", to: "15:00" },
      ],
    };

    it("should return false when settings is null", () => {
      const date = new Date("2025-01-15T10:00:00Z");
      expect(isClosedAt(null, date, "12:00")).toBe(false);
    });

    it("should return false when settings is undefined", () => {
      const date = new Date("2025-01-15T10:00:00Z");
      expect(isClosedAt(undefined, date, "12:00")).toBe(false);
    });

    it("should return true for closed date with time in range", () => {
      const date = new Date("2025-12-25T10:00:00Z");
      expect(isClosedAt(settings, date, "19:00")).toBe(true);
    });

    it("should return false for closed date with time outside range", () => {
      const date = new Date("2025-12-25T10:00:00Z");
      expect(isClosedAt(settings, date, "12:00")).toBe(false);
    });

    it("should return true for closed weekly day with time in range", () => {
      const date = new Date("2025-01-13T10:00:00Z");
      expect(isClosedAt(settings, date, "13:00")).toBe(true);
    });

    it("should return false for closed weekly day with time outside range", () => {
      const date = new Date("2025-01-13T10:00:00Z");
      expect(isClosedAt(settings, date, "16:00")).toBe(false);
    });

    it("should return false for open day and time", () => {
      const date = new Date("2025-01-15T10:00:00Z");
      expect(isClosedAt(settings, date, "12:00")).toBe(false);
    });

    it("should handle closed date without time range", () => {
      const settingsWithoutTime: RestaurantSettings = {
        slots: [],
        closedDates: [{ date: "2025-12-25" }],
        closedWeekly: [],
      };
      const date = new Date("2025-12-25T10:00:00Z");
      expect(isClosedAt(settingsWithoutTime, date, "12:00")).toBe(true);
    });

    it("should handle closed weekly without time range", () => {
      const settingsWithoutTime: RestaurantSettings = {
        slots: [],
        closedDates: [],
        closedWeekly: [{ weekday: 1 }],
      };
      const date = new Date("2025-01-13T10:00:00Z");
      expect(isClosedAt(settingsWithoutTime, date, "12:00")).toBe(true);
    });
  });
});

