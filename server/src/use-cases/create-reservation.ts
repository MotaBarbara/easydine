import type { ReservationsRepository } from "@/repositories/reservations-repository";
import { ReservationConflictError } from "./errors/reservation-conflict-error";
import type { Reservation, Restaurant } from "generated/prisma";
import type { RestaurantsRepository } from "@/repositories/restaurants-repository";
import type { RestaurantSettings } from "@/types/restaurant-settings";
import { isPastDateTime, isClosedAt } from "@/utils/reservation-time";
import { ReservationPastDate } from "./errors/reservation-past-date-error";
import { RestaurantClosed } from "./errors/restaurant-closed-error";
import { RestaurantNotFound } from "./errors/restaurant-not-found-error";
import type { EmailService } from "@/services/email-service";

interface CreateReservationUseCaseRequest {
  restaurantId: string;
  date: string;
  time: string;
  customerName: string;
  customerEmail: string;
  groupSize: number;
  status?: string;
}

interface CreateReservationUseCaseResponse {
  reservation: Reservation;
  restaurant: Restaurant;
}

export class CreateReservationUseCase {
  constructor(
    private reservationsRepository: ReservationsRepository,
    private restaurantsRepository: RestaurantsRepository,
    private emailService?: EmailService,
  ) {}

  async execute({
    restaurantId,
    date: dateString,
    time,
    customerName,
    customerEmail,
    groupSize,
    status,
  }: CreateReservationUseCaseRequest): Promise<CreateReservationUseCaseResponse> {
    const date = new Date(
      dateString.endsWith("Z") || dateString.includes("+")
        ? dateString
        : dateString + "Z",
    );


    const restaurant = await this.restaurantsRepository.findById(restaurantId);
    if (!restaurant) throw new RestaurantNotFound();

    const settings = (restaurant.settings as any as RestaurantSettings) ?? {};

    if (isPastDateTime(date, time)) throw new ReservationPastDate();
    if (isClosedAt(settings, date, time)) throw new RestaurantClosed();

    const slots = settings.slots ?? [];
    const currentSlot = slots.find(s => time >= s.from && time < s.to);

    const maxReservations = currentSlot?.maxReservations ?? 9000;

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
      restaurant: { connect: { id: restaurantId } },
      date,
      time,
      customerName,
      customerEmail,
      groupSize,
      status: status ?? "confirmed",
    });

    if (this.emailService) {
      this.emailService
        .sendReservationConfirmation({
          reservation,
          restaurant,
        })
        .catch(err => {
          console.error("Failed to send confirmation email:", err);
        });
    }

    return { reservation, restaurant };
  }
}
