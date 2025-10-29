import { PrismaReservationsRepository } from "@/repositories/prisma-reservations-repository";
import { CreateReservationUseCase } from "../create-reservation";

export function makeCreateReservationUseCase() {
  const reservationsRepository = new PrismaReservationsRepository();
  return new CreateReservationUseCase(reservationsRepository);
}
