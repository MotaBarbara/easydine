import { describe, it, beforeEach, expect } from "vitest";
import { InMemoryReservationsRepository } from "@/repositories/in-memory/in-memory-reservations-repository";
import { ListReservationsUseCase } from "./list-reservations";

describe("ListReservationsUseCase", () => {
  let reservationsRepo: InMemoryReservationsRepository;
  let sut: ListReservationsUseCase;

  beforeEach(() => {
    reservationsRepo = new InMemoryReservationsRepository();
    sut = new ListReservationsUseCase(reservationsRepo);
    const createdAt = new Date("2025-11-01T00:00:00.000Z");

    reservationsRepo.items.push(
      {
        id: "res-joao-10-nov-1",
        restaurantId: "rest-1",
        date: new Date("2025-11-10T18:00:00.000Z"),
        time: "18:00",
        customerName: "Alice",
        customerEmail: "alice@example.com",
        groupSize: 2,
        status: "confirmed",
        createdAt: createdAt,
      },
      {
        id: "res-joao-10-nov-2",
        restaurantId: "rest-1",
        date: new Date("2025-11-10T20:00:00.000Z"),
        time: "20:00",
        customerName: "Bob",
        customerEmail: "bob@example.com",
        groupSize: 4,
        status: "confirmed",
        createdAt: createdAt,
      },
    );

    reservationsRepo.items.push({
      id: "res-joao-11-nov-1",
      restaurantId: "rest-1",
      date: new Date("2025-11-11T20:00:00.000Z"),
      time: "20:00",
      customerName: "Bob",
      customerEmail: "bob@example.com",
      groupSize: 4,
      status: "confirmed",
      createdAt: createdAt,
    });

    reservationsRepo.items.push({
      id: "res-ze-10-nov-1",
      restaurantId: "rest-2",
      date: new Date("2025-11-10T18:00:00.000Z"),
      time: "18:00",
      customerName: "Dave",
      customerEmail: "dave@example.com",
      groupSize: 2,
      status: "confirmed",
      createdAt: createdAt,
    });
  });

  it("lists reservations for a restaurant and date", async () => {
    const { reservations } = await sut.execute({
      restaurantId: "rest-1",
      date: new Date("2025-11-10T00:00:00.000Z"),
    });

    expect(reservations).toHaveLength(2);
    expect(reservations.map(r => r.id)).toEqual([
      "res-joao-10-nov-1",
      "res-joao-10-nov-2",
    ]);
  });
});
