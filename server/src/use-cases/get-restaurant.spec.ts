import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryRestaurantsRepository } from "@/repositories/in-memory/in-memory-restaurants-repository";
import { GetRestaurantUseCase } from "./get-restaurant";
import { RestaurantNotFound } from "./errors/restaurant-not-found-error";

let restaurantsRepo: InMemoryRestaurantsRepository;
let sut: GetRestaurantUseCase;

describe("Get restaurant use case", () => {
  beforeEach(() => {
    restaurantsRepo = new InMemoryRestaurantsRepository();
    sut = new GetRestaurantUseCase(restaurantsRepo);
  });

  it("returns restaurant details", async () => {
    const created = await restaurantsRepo.create({
      name: "Test Restaurant",
      logo: "https://example.com/logo.png",
      primaryColor: "#FF0000",
      settings: {
        slots: [{ from: "18:00", to: "22:00", maxReservations: 10 }],
        closedDates: [],
        closedWeekly: [],
      },
    } as any);

    const { restaurant } = await sut.execute({
      restaurantId: created.id,
    });

    expect(restaurant.id).toBe(created.id);
    expect(restaurant.name).toBe("Test Restaurant");
    expect(restaurant.logo).toBe("https://example.com/logo.png");
    expect(restaurant.primaryColor).toBe("#FF0000");
    expect(restaurant.settings).toEqual({
      slots: [{ from: "18:00", to: "22:00", maxReservations: 10 }],
      closedDates: [],
      closedWeekly: [],
    });
  });

  it("returns null settings when restaurant has no settings", async () => {
    const created = await restaurantsRepo.create({
      name: "Test Restaurant",
      logo: null,
      primaryColor: null,
      settings: null,
    } as any);

    const { restaurant } = await sut.execute({
      restaurantId: created.id,
    });

    expect(restaurant.settings).toBeNull();
  });

  it("throws when restaurant not found", async () => {
    await expect(() =>
      sut.execute({ restaurantId: "non-existent-id" }),
    ).rejects.toThrowError(RestaurantNotFound);
  });
});

