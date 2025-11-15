import type { ReservationsRepository } from "@/repositories/reservations-repository";
import { CancelReservationUseCase } from "./cancel-reservation";
import { ReservationNotFoundError } from "./errors/reservation-not-found-error";
import type { Reservation } from "generated/prisma";

interface CancelReservationByTokenRequest {
  token: string;
}

interface CancelReservationByTokenResponse {
  reservation: Reservation;
}

export class CancelReservationByTokenUseCase {
  constructor(
    private reservationsRepo: ReservationsRepository,
    private cancelReservation: CancelReservationUseCase,
  ) {}

  async execute({
    token,
  }: CancelReservationByTokenRequest): Promise<CancelReservationByTokenResponse> {
    const reservation = await this.reservationsRepo.findByCancelToken(token);
    if (!reservation) {
      throw new ReservationNotFoundError();
    }

    return this.cancelReservation.execute(reservation.id);
  }
}
