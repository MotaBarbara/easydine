import { PrismaReservationsRepository } from "@/repositories/prisma-reservations-repository";
import { CancelReservationUseCase } from "../cancel-reservation";
import { CancelReservationByTokenUseCase } from "../cancel-reservation-by-token";

export function makeCancelReservationByTokenUseCase() {
  const reservationsRepo = new PrismaReservationsRepository();
  const cancelReservation = new CancelReservationUseCase(reservationsRepo);

  return new CancelReservationByTokenUseCase(
    reservationsRepo,
    cancelReservation,
  );
}
