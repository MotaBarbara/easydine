import { PrismaRestaurantsRepository } from "@/repositories/prisma-restaurants-repository";
import { ListRestaurantsUseCase } from "../list-restaurants";

export function makeListRestaurantsUseCase() {
  const restaurantsRepo = new PrismaRestaurantsRepository();
  return new ListRestaurantsUseCase(restaurantsRepo);
}
