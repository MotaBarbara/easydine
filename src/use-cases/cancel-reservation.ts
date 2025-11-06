import type { ReservationsRepository } from "@/repositories/reservations-repository";
import type { Reservation } from "generated/prisma";
import { ReservationNotFoundError } from "./errors/reservation-not-found-error";
import { ReservationAlreadyCancelledError } from "./errors/reservation-already-cancelled-error";

interface CancelReservationUseCaseResponse {
  reservation: Reservation;
}

export class CancelReservationUseCase {
  constructor(private reservationsRepository: ReservationsRepository) {}

  async execute(id: string): Promise<CancelReservationUseCaseResponse> {
    const reservation = await this.reservationsRepository.findById(id);
    if (!reservation) {
      throw new ReservationNotFoundError();
    }

    if (reservation.status === "cancelled") {
      throw new ReservationAlreadyCancelledError();
    }

    const updated = await this.reservationsRepository.updateStatus(
      id,
      "cancelled",
    );

    return { reservation: updated };
  }
}
