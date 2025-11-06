import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryRestaurantsRepository } from "@/repositories/in-memory/in-memory-restaurants-repository";
import { CreateRestaurantUseCase } from "./create-restaurant";
import { RestaurantAlreadyExistsError } from "./errors/restaurant-already-exists-error";

let restaurantsRepo: InMemoryRestaurantsRepository;
let sut: CreateRestaurantUseCase;

describe("Create Restaurant Use Case", () => {
  beforeEach(async () => {
    restaurantsRepo = new InMemoryRestaurantsRepository();
    sut = new CreateRestaurantUseCase(restaurantsRepo);
  });

  it("creates a restaurant", async () => {
    const { restaurant } = await sut.execute({
      name: "Test Restaurant",
    });

    expect(restaurant.id).toEqual(expect.any(String));
    expect(restaurant.name).toBe("Test Restaurant");
  });

  it("prevents duplicate name", async () => {
    await sut.execute({
      name: "Test Restaurant",
    });

    await expect(() =>
      sut.execute({
        name: "Test Restaurant",
      }),
    ).rejects.toBeInstanceOf(RestaurantAlreadyExistsError);
  });
});
