import { PrismaRestaurantsRepository } from "@/repositories/prisma-restaurants-repository";
import { UpdateRestaurantUseCase } from "../update-restaurant";

export function makeUpdateRestaurantUseCase() {
  const restaurantsRepo = new PrismaRestaurantsRepository();
  return new UpdateRestaurantUseCase(restaurantsRepo);
}
