import { PrismaRestaurantsRepository } from "@/repositories/prisma-restaurants-repository";
import { PrismaUsersRepository } from "@/repositories/prisma-users-repository";
import { CreateRestaurantUseCase } from "../create-restaurant";

export function makeCreateRestaurantUseCase() {
  const restaurantsRepository = new PrismaRestaurantsRepository();
  const usersRepository = new PrismaUsersRepository();
  return new CreateRestaurantUseCase(restaurantsRepository, usersRepository);
}
