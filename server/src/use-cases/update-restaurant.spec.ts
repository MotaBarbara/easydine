import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryRestaurantsRepository } from "@/repositories/in-memory/in-memory-restaurants-repository";
import { UpdateRestaurantUseCase } from "./update-restaurant";

describe("UpdateRestaurantUseCase", () => {
  let restaurantsRepo: InMemoryRestaurantsRepository;
  let sut: UpdateRestaurantUseCase;
  let id: string;

  beforeEach(async () => {
    restaurantsRepo = new InMemoryRestaurantsRepository();
    sut = new UpdateRestaurantUseCase(restaurantsRepo);

    const r = await restaurantsRepo.create({
      name: "Orig",
      logo: null,
      primaryColor: "#112233",
      settings: {
        slots: [{ from: "18:00", to: "20:00", maxReservations: 10 }],
      },
    } as any);
    id = r.id;
  });

  it("updates name and replaces settings", async () => {
    const { restaurant } = await sut.execute({
      restaurantId: id,
      name: "Updated",
      settings: {
        slots: [{ from: "20:00", to: "22:00", maxReservations: 15 }],
        closedWeekly: [{ weekday: 1, from: "12:00", to: "15:00" }],
      },
    });

    expect(restaurant.name).toBe("Updated");
    expect((restaurant.settings as any).slots[0].from).toBe("20:00");
    expect((restaurant.settings as any).closedWeekly[0].weekday).toBe(1);
  });

  it("clears logo when null is provided and leaves primaryColor untouched when omitted", async () => {
    const { restaurant } = await sut.execute({
      restaurantId: id,
      logo: null,
    });

    expect(restaurant.logo).toBeNull();
    expect(restaurant.primaryColor).toBe("#112233");
  });
});