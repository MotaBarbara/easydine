import { PrismaReservationsRepository } from "@/repositories/prisma-reservations-repository";
import { CreateReservationUseCase } from "../create-reservation";
import { PrismaRestaurantsRepository } from "@/repositories/prisma-restaurants-repository";
import { EmailService } from "@/services/email-service";

export function makeCreateReservationUseCase() {
  const reservationsRepository = new PrismaReservationsRepository();
  const restaurantsRepository = new PrismaRestaurantsRepository();
  const emailService = new EmailService();
  return new CreateReservationUseCase(
    reservationsRepository,
    restaurantsRepository,
    emailService,
  );
}
