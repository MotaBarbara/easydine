import { describe, it, expect } from "vitest";
import { ReservationPastDate } from "./reservation-past-date-error";

describe("ReservationPastDate Error", () => {
  it("should create error with correct message", () => {
    const error = new ReservationPastDate();
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe("Cannot create reservations in the past.");
  });

  it("should be throwable", () => {
    expect(() => {
      throw new ReservationPastDate();
    }).toThrow("Cannot create reservations in the past.");
  });
});




