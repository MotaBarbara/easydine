import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryRestaurantsRepository } from "@/repositories/in-memory/in-memory-restaurants-repository";
import { InMemoryUsersRepository } from "@/repositories/in-memory/in-memory-users-repository";
import { CreateRestaurantUseCase } from "./create-restaurant";
import { RestaurantAlreadyExistsError } from "./errors/restaurant-already-exists-error";
import { hash } from "bcryptjs";

let restaurantsRepo: InMemoryRestaurantsRepository;
let usersRepo: InMemoryUsersRepository;
let sut: CreateRestaurantUseCase;

describe("Create Restaurant Use Case", () => {
  beforeEach(async () => {
    restaurantsRepo = new InMemoryRestaurantsRepository();
    usersRepo = new InMemoryUsersRepository();
    sut = new CreateRestaurantUseCase(restaurantsRepo, usersRepo);
  });

  it("creates a restaurant", async () => {
    const user = await usersRepo.create({
      email: "test@example.com",
      name: "Test User",
      passwordHash: await hash("123456", 6),
    });

    const { restaurant } = await sut.execute({
      ownerId: user.id,
      name: "Test Restaurant",
    });

    expect(restaurant.id).toEqual(expect.any(String));
    expect(restaurant.name).toBe("Test Restaurant");
  });

  it("prevents duplicate name", async () => {
    const user = await usersRepo.create({
      email: "test@example.com",
      name: "Test User",
      passwordHash: await hash("123456", 6),
    });

    await sut.execute({
      ownerId: user.id,
      name: "Test Restaurant",
    });

    await expect(() =>
      sut.execute({
        ownerId: user.id,
        name: "Test Restaurant",
      }),
    ).rejects.toBeInstanceOf(RestaurantAlreadyExistsError);
  });
});
