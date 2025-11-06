// src/use-cases/create-restaurant.ts
import type { RestaurantsRepository } from "@/repositories/restaurants-repository";
import { Prisma, type Restaurant } from "generated/prisma";
import { RestaurantAlreadyExistsError } from "./errors/restaurant-already-exists-error";

interface CreateRestaurantUseCaseRequest {
  name: string;
  logo?: string | null;
  primaryColor?: string | null;
  settings?: Prisma.InputJsonValue | null;
}

interface CreateRestaurantUseCaseResponse {
  restaurant: Restaurant;
}

export class CreateRestaurantUseCase {
  constructor(private restaurantsRepository: RestaurantsRepository) {}

  async execute({
    name,
    logo = null,
    primaryColor = null,
    settings = null,
  }: CreateRestaurantUseCaseRequest): Promise<CreateRestaurantUseCaseResponse> {
    const existing = await this.restaurantsRepository.findByName(name);
    if (existing) {
      throw new RestaurantAlreadyExistsError();
    }

    const restaurant = await this.restaurantsRepository.create({
      name,
      logo: logo ?? null,
      primaryColor: primaryColor ?? null,
      settings: settings === null ? Prisma.JsonNull : settings,
    });

    return { restaurant };
  }
}
