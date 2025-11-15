import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryReservationsRepository } from "@/repositories/in-memory/in-memory-reservations-repository";
import { CancelReservationUseCase } from "./cancel-reservation";
import { ReservationAlreadyCancelledError } from "./errors/reservation-already-cancelled-error";
import { ReservationNotFoundError } from "./errors/reservation-not-found-error";

let reservationsRepo: InMemoryReservationsRepository;
let sut: CancelReservationUseCase;

describe("Cancel Reservation Use Case", () => {
  beforeEach(() => {
    reservationsRepo = new InMemoryReservationsRepository();
    sut = new CancelReservationUseCase(reservationsRepo);
  });

  it("cancels an existing reservation", async () => {
    const res = await reservationsRepo.create({
      restaurant: { connect: { id: "r1" } },
      date: new Date("2099-11-10T18:00:00Z"),
      time: "18:00",
      customerName: "Jane Doe",
      customerEmail: "jane@example.com",
      groupSize: 2,
      status: "confirmed" as any,
    } as any);

    const { reservation } = await sut.execute(res.id);
    expect(reservation.status).toBe("cancelled");
  });

  it("throws when reservation not found", async () => {
    await expect(() => sut.execute("missing")).rejects.toThrowError(
      ReservationNotFoundError,
    );
  });

  it("prevents double cancellation", async () => {
    const res = await reservationsRepo.create({
      restaurant: { connect: { id: "r1" } },
      date: new Date("2099-11-10T18:00:00Z"),
      time: "18:00",
      customerName: "John Doe",
      customerEmail: "john@example.com",
      groupSize: 2,
      status: "cancelled" as any,
    } as any);

    await expect(() => sut.execute(res.id)).rejects.toThrowError(
      ReservationAlreadyCancelledError,
    );
  });
});
