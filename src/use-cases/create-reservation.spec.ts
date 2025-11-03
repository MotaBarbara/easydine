import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryReservationsRepository } from "@/repositories/in-memory/in-memory-reservations-repository";
import { CreateReservationUseCase } from "./create-reservation";
import { ReservationConflictError } from "./errors/reservation-conflict-error";
import { InMemoryRestaurantsRepository } from "@/repositories/in-memory/in-memory-restaurants-repository";

let reservationsRepo: InMemoryReservationsRepository;
let restaurantsRepo: InMemoryRestaurantsRepository;
let sut: CreateReservationUseCase;

describe("Create Reservation Use Case", () => {
  beforeEach(() => {
    reservationsRepo = new InMemoryReservationsRepository();
    restaurantsRepo = new InMemoryRestaurantsRepository();
    sut = new CreateReservationUseCase(reservationsRepo, restaurantsRepo);
  });

  it("Creates reservation", async () => {
    const { reservation } = await sut.execute({
      restaurantId: "r1",
      date: new Date("2025-11-10T18:00:00Z"),
      time: "18:00",
      customerName: "Jane Doe",
      customerEmail: "jane@example.com",
      groupSize: 2,
    });

    expect(reservation.id).toEqual(expect.any(String));
  });

  it("Prevents double booking", async () => {
    await sut.execute({
      restaurantId: "r1",
      date: new Date("2025-11-10T18:00:00Z"),
      time: "18:00",
      customerName: "John",
      customerEmail: "john@example.com",
      groupSize: 4,
    });

    await expect(() =>
      sut.execute({
        restaurantId: "r1",
        date: new Date("2025-11-10T18:00:00Z"),
        time: "18:00",
        customerName: "Alice",
        customerEmail: "alice@example.com",
        groupSize: 2,
      }),
    ).rejects.toBeInstanceOf(ReservationConflictError);
  });
});
