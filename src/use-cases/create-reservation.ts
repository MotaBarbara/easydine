import type { ReservationsRepository } from "@/repositories/reservations-repository";
import { ReservationConflictError } from "./errors/reservation-conflict-error";
import type { Reservation } from "generated/prisma";
import type { RestaurantsRepository } from "@/repositories/restaurants-repository";

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
  constructor(
    private reservationsRepository: ReservationsRepository,
    private restaurantsRepository: RestaurantsRepository,
  ) {}

  async execute({
    restaurantId,
    date,
    time,
    customerName,
    customerEmail,
    groupSize,
    status,
  }: CreateReservationUseCaseRequest): Promise<CreateReservationUseCaseResponse> {
    const restaurant = await this.restaurantsRepository.findById(restaurantId);
    if (!restaurant) throw new Error("Restaurant not found");

    const settings = (restaurant.settings as any) || {};
    const slots: {
      from: string;
      to: string;
      maxReservations: number;
    }[] = settings.slots || [];

    const currentSlot = slots.find(s => time >= s.from && time < s.to);

    const maxReservations = currentSlot?.maxReservations ?? 1;

    const usedCovers = await this.reservationsRepository.sumGroupSizePerSlot(
      restaurantId,
      date,
      currentSlot?.from ?? time,
      currentSlot?.to ?? time,
    );

    if (usedCovers + groupSize > maxReservations) {
      throw new ReservationConflictError();
    }

    const reservation = await this.reservationsRepository.create({
      date,
      time,
      customerName,
      customerEmail,
      groupSize,
      status: status ?? "confirmed",
      restaurant: { connect: { id: restaurantId } },
    });

    return { reservation };
  }
}
