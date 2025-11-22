import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryRestaurantsRepository } from "@/repositories/in-memory/in-memory-restaurants-repository";
import { ListRestaurantsUseCase } from "./list-restaurants";

let restaurantsRepo: InMemoryRestaurantsRepository;
let sut: ListRestaurantsUseCase;

describe("List restaurants use case", () => {
  beforeEach(() => {
    restaurantsRepo = new InMemoryRestaurantsRepository();
    sut = new ListRestaurantsUseCase(restaurantsRepo);
  });

  it("returns empty array when no restaurants exist", async () => {
    const { restaurants } = await sut.execute();
    expect(restaurants).toEqual([]);
  });

  it("returns all restaurants", async () => {
    const restaurant1 = await restaurantsRepo.create({
      name: "Restaurant 1",
      logo: "https://example.com/logo1.png",
      primaryColor: "#FF0000",
    } as any);

    const restaurant2 = await restaurantsRepo.create({
      name: "Restaurant 2",
      logo: null,
      primaryColor: "#00FF00",
    } as any);

    const { restaurants } = await sut.execute();

    expect(restaurants).toHaveLength(2);
    expect(restaurants).toEqual(
      expect.arrayContaining([
        {
          id: restaurant1.id,
          name: "Restaurant 1",
          logo: "https://example.com/logo1.png",
          primaryColor: "#FF0000",
        },
        {
          id: restaurant2.id,
          name: "Restaurant 2",
          logo: null,
          primaryColor: "#00FF00",
        },
      ]),
    );
  });

  it("only returns id, name, logo, and primary color", async () => {
    await restaurantsRepo.create({
      name: "Restaurant 1",
      logo: "https://example.com/logo1.png",
      primaryColor: "#FF0000",
      settings: {
        slots: [{ from: "18:00", to: "22:00", maxReservations: 10 }],
      },
    } as any);

    const { restaurants } = await sut.execute();

    expect(restaurants[0]).not.toHaveProperty("settings");
    expect(restaurants[0]).toEqual({
      id: expect.any(String),
      name: "Restaurant 1",
      logo: "https://example.com/logo1.png",
      primaryColor: "#FF0000",
    });
  });
});

