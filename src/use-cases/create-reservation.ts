import type { ReservationsRepository } from "@/repositories/reservations-repository";
import { ReservationConflictError } from "./errors/reservation-conflict-error";
import type { Reservation } from "generated/prisma";
import type { RestaurantsRepository } from "@/repositories/restaurants-repository";
import type { RestaurantSettings } from "@/types/restaurant-settings";
import { isPastDay, isClosedAt } from "@/utils/reservation-time";
import { ReservationPastDate } from "./errors/reservation-past-date-error";
import { RestaurantClosed } from "./errors/restaurant-closed-error";
import { RestaurantNotFound } from "./errors/restaurant-not-found-error";

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
    if (!restaurant) {
      throw new RestaurantNotFound();
    }

    const settings = (restaurant.settings as any as RestaurantSettings) ?? {};

    if (isPastDay(date)) {
      throw new ReservationPastDate();
    }

    if (isClosedAt(settings, date, time)) {
      throw new RestaurantClosed();
    }

    const slots = settings.slots ?? [];

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
