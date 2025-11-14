import { PrismaRestaurantsRepository } from "@/repositories/prisma-restaurants-repository";
import { PrismaReservationsRepository } from "@/repositories/prisma-reservations-repository";
import { GetRestaurantAvailabilityUseCase } from "../get-restaurant-availability";

export function makeGetRestaurantAvailabilityUseCase() {
  const restaurantsRepo = new PrismaRestaurantsRepository();
  const reservationsRepo = new PrismaReservationsRepository();
  return new GetRestaurantAvailabilityUseCase(
    restaurantsRepo,
    reservationsRepo,
  );
}