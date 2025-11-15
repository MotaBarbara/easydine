import { PrismaReservationsRepository } from "@/repositories/prisma-reservations-repository";
import { CreateReservationUseCase } from "../create-reservation";
import { PrismaRestaurantsRepository } from "@/repositories/prisma-restaurants-repository";

export function makeCreateReservationUseCase() {
  const reservationsRepository = new PrismaReservationsRepository();
  const restaurantsRepository = new PrismaRestaurantsRepository();
  return new CreateReservationUseCase(
    reservationsRepository,
    restaurantsRepository,
  );
}
