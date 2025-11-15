import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryRestaurantsRepository } from "@/repositories/in-memory/in-memory-restaurants-repository";
import { InMemoryReservationsRepository } from "@/repositories/in-memory/in-memory-reservations-repository";
import { GetRestaurantAvailabilityUseCase } from "./get-restaurant-availability";

describe("GetRestaurantAvailabilityUseCase", () => {
  let restaurantsRepo: InMemoryRestaurantsRepository;
  let reservationsRepo: InMemoryReservationsRepository;
  let sut: GetRestaurantAvailabilityUseCase;
  let restaurantId: string;

  beforeEach(async () => {
    restaurantsRepo = new InMemoryRestaurantsRepository();
    reservationsRepo = new InMemoryReservationsRepository();
    sut = new GetRestaurantAvailabilityUseCase(
      restaurantsRepo,
      reservationsRepo,
    );

    const restaurant = await restaurantsRepo.create({
      name: "Test Resto",
      logo: null,
      primaryColor: "#112233",
      settings: {
        slots: [
          { from: "18:00", to: "20:00", maxReservations: 10 },
          { from: "20:00", to: "22:00", maxReservations: 8 },
        ],
      },
    } as any);

    restaurantId = restaurant.id;

    // seed some reservations
    await reservationsRepo.create({
      restaurant: { connect: { id: restaurantId } },
      date: new Date("2099-11-10T18:00:00.000Z"),
      time: "18:30",
      customerName: "Alice",
      customerEmail: "alice@example.com",
      groupSize: 4,
      status: "confirmed" as any,
    } as any);

    await reservationsRepo.create({
      restaurant: { connect: { id: restaurantId } },
      date: new Date("2099-11-10T18:00:00.000Z"),
      time: "19:00",
      customerName: "Bob",
      customerEmail: "bob@example.com",
      groupSize: 3,
      status: "confirmed" as any,
    } as any);
  });

  it("computes remaining capacity per slot", async () => {
    const { slots } = await sut.execute({
      restaurantId,
      date: new Date("2099-11-10T00:00:00.000Z"),
    });

    expect(slots).toHaveLength(2);

    const first = slots[0];
    expect(first).toBeDefined();
    expect(first!.from).toBe("18:00");
    expect(first!.maxReservations).toBe(10);
    expect(first!.reserved).toBe(7);
    expect(first!.remaining).toBe(3);
  });
});
