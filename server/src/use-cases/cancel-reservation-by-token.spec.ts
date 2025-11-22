import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryReservationsRepository } from "@/repositories/in-memory/in-memory-reservations-repository";
import { CancelReservationByTokenUseCase } from "./cancel-reservation-by-token";
import { CancelReservationUseCase } from "./cancel-reservation";
import { ReservationNotFoundError } from "./errors/reservation-not-found-error";

let reservationsRepo: InMemoryReservationsRepository;
let cancelReservation: CancelReservationUseCase;
let sut: CancelReservationByTokenUseCase;

describe("Cancel reservation by token use case", () => {
  beforeEach(() => {
    reservationsRepo = new InMemoryReservationsRepository();
    cancelReservation = new CancelReservationUseCase(reservationsRepo);
    sut = new CancelReservationByTokenUseCase(
      reservationsRepo,
      cancelReservation,
    );
  });

  it("cancels a reservation by token", async () => {
    const reservation = await reservationsRepo.create({
      restaurant: { connect: { id: "r1" } },
      date: new Date("2099-11-10T18:00:00Z"),
      time: "18:00",
      customerName: "Jane Doe",
      customerEmail: "jane@example.com",
      groupSize: 2,
      status: "confirmed" as any,
      cancelToken: "test-token-123",
    } as any);

    const { reservation: cancelled } = await sut.execute({
      token: reservation.cancelToken!,
    });

    expect(cancelled.status).toBe("cancelled");
    expect(cancelled.id).toBe(reservation.id);
  });

  it("throws when reservation not found by token", async () => {
    await expect(() =>
      sut.execute({ token: "non-existent-token" }),
    ).rejects.toThrowError(ReservationNotFoundError);
  });
});

