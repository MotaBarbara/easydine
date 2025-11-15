import { PrismaReservationsRepository } from "@/repositories/prisma-reservations-repository";
import { CancelReservationUseCase } from "../cancel-reservation";

export function makeCancelReservationUseCase() {
  const reservationsRepository = new PrismaReservationsRepository();
  return new CancelReservationUseCase(reservationsRepository);
}
