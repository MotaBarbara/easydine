import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryRestaurantsRepository } from "@/repositories/in-memory/in-memory-restaurants-repository";
import { CreateRestaurantUseCase } from "./create-restaurant";
import { InMemoryReservationsRepository } from "@/repositories/in-memory/in-memory-reservations-repository";
import { CreateReservationUseCase } from "./create-reservation";

let reservationsRepo: InMemoryReservationsRepository;
let restaurantsRepo: InMemoryRestaurantsRepository;
let sut: CreateReservationUseCase;
let restaurantId: string;

describe("Create Reservation Use Case", () => {
  beforeEach(async () => {
    reservationsRepo = new InMemoryReservationsRepository();
    restaurantsRepo = new InMemoryRestaurantsRepository();
    sut = new CreateReservationUseCase(reservationsRepo, restaurantsRepo);

    const restaurant = await restaurantsRepo.create({
      name: "Restaurant Zé",
      logo: null,
      primaryColor: null,
      settings: {
        slots: [
          { from: "18:00", to: "20:00", maxReservations: 10 },
          { from: "20:00", to: "22:00", maxReservations: 10 },
        ],
      },
    } as any);

    restaurantId = restaurant.id;
  });

  it("rejects a Monday booking due to restaurant being closed", async () => {
    const r = await restaurantsRepo.create({
      name: "Restaurant Alice",
      settings: { closedWeekly: [{ weekday: 1 }] },
    } as any);

    await expect(() =>
      sut.execute({
        restaurantId: r.id,
        date: new Date("2025-11-10T18:00:00Z"),
        time: "18:00",
        customerName: "Alice",
        customerEmail: "alice@test.com",
        groupSize: 2,
      }),
    ).rejects.toThrowError("closed");
  });

  it("rejects Monday lunch but allows Monday dinner", async () => {
    const r = await restaurantsRepo.create({
      name: "Restaurant Pedro",
      settings: {
        closedWeekly: [{ weekday: 1, from: "12:00", to: "15:00" }],
        slots: [
          { from: "12:00", to: "15:00", maxReservations: 10 },
          { from: "19:00", to: "22:00", maxReservations: 10 },
        ],
      },
    } as any);

    await expect(() =>
      sut.execute({
        restaurantId: r.id,
        date: new Date("2025-11-10T12:30:00Z"),
        time: "12:30",
        customerName: "Luis",
        customerEmail: "luis@test.com",
        groupSize: 2,
      }),
    ).rejects.toThrowError("closed");

    const ok = await sut.execute({
      restaurantId: r.id,
      date: new Date("2025-11-10T19:00:00Z"),
      time: "19:00",
      customerName: "Antonio",
      customerEmail: "antonio@test.com",
      groupSize: 2,
    });
    expect(ok.reservation.id).toBeTruthy();
  });

  it("rejects special-date dinner but allows lunch", async () => {
    const r = await restaurantsRepo.create({
      name: "R",
      settings: {
        closedDates: [{ date: "2025-12-25", from: "18:00", to: "23:59" }],
        slots: [
          { from: "12:00", to: "15:00", maxReservations: 10 },
          { from: "18:00", to: "22:00", maxReservations: 10 },
        ],
      },
    } as any);

    await expect(() =>
      sut.execute({
        restaurantId: r.id,
        date: new Date("2025-12-25T19:00:00Z"),
        time: "19:00",
        customerName: "A",
        customerEmail: "a@x.com",
        groupSize: 2,
      }),
    ).rejects.toThrowError("closed");

    const ok = await sut.execute({
      restaurantId: r.id,
      date: new Date("2025-12-25T12:30:00Z"),
      time: "12:30",
      customerName: "B",
      customerEmail: "b@x.com",
      groupSize: 2,
    });
    expect(ok.reservation.id).toBeTruthy();
  });
});
