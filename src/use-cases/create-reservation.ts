import type { ReservationsRepository } from "@/repositories/reservations-repository";
import { ReservationConflictError } from "./errors/reservation-conflict-error";
import type { Reservation } from "generated/prisma";

interface CreateReservationUseCaseRequest {
  restaurantId: string;
  date: Date;
  time: string;
  customerName: string;
  customerEmail: string;
  groupSize: number;
  status?: string;
}

interface CreateReservationUseCaseResponse {
  reservation: Reservation;
}

export class CreateReservationUseCase {
  constructor(private reservationsRepository: ReservationsRepository) {}

  async execute({
    restaurantId,
    date,
    time,
    customerName,
    customerEmail,
    groupSize,
    status,
  }: CreateReservationUseCaseRequest): Promise<CreateReservationUseCaseResponse> {
    const existing =
      await this.reservationsRepository.findByDateTimeAndRestaurant(
        restaurantId,
        date,
        time,
      );

    if (existing) throw new ReservationConflictError();

    const reservation = await this.reservationsRepository.create({
      date,
      time,
      customerName,
      customerEmail,
      groupSize,
      status: status ?? "pending",
      restaurant: { connect: { id: restaurantId } },
    });

    return { reservation };
  }
}
