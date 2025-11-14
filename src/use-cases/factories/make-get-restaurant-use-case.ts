import { PrismaRestaurantsRepository } from "@/repositories/prisma-restaurants-repository";
import { GetRestaurantUseCase } from "../get-restaurant";

export function makeGetRestaurantUseCase() {
  const restaurantsRepo = new PrismaRestaurantsRepository();
  return new GetRestaurantUseCase(restaurantsRepo);
}
