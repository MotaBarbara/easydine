import type { RestaurantsRepository } from "@/repositories/restaurants-repository";
import type { ReservationsRepository } from "@/repositories/reservations-repository";
import type { RestaurantSettings } from "@/types/restaurant-settings";
import { RestaurantNotFound } from "./errors/restaurant-not-found-error";
import { isClosedAt } from "@/utils/reservation-time";

interface GetRestaurantAvailabilityUseCaseRequest {
  restaurantId: string;
  date: Date;
}

interface SlotAvailability {
  from: string;
  to: string;
  maxReservations: number;
  reserved: number;
  remaining: number;
  closed: boolean;
}

interface GetRestaurantAvailabilityUseCaseResponse {
  slots: SlotAvailability[];
}

export class GetRestaurantAvailabilityUseCase {
  constructor(
    private restaurantsRepo: RestaurantsRepository,
    private reservationsRepo: ReservationsRepository,
  ) {}

  async execute({
    restaurantId,
    date,
  }: GetRestaurantAvailabilityUseCaseRequest): Promise<GetRestaurantAvailabilityUseCaseResponse> {
    const restaurant = await this.restaurantsRepo.findById(restaurantId);
    if (!restaurant) throw new RestaurantNotFound();

    const settings = (restaurant.settings ?? {}) as RestaurantSettings;
    const slots = settings.slots ?? [];

    if (slots.length === 0) {
      return { slots: [] };
    }

    const reservations = await this.reservationsRepo.listByRestaurantAndDate(
      restaurantId,
      date,
    );

    const result: SlotAvailability[] = slots.map(slot => {
      const reserved = reservations
        .filter(r => r.time >= slot.from && r.time < slot.to)
        .reduce((sum, r) => sum + r.groupSize, 0);

      const remaining = Math.max(slot.maxReservations - reserved, 0);
      const closed = isClosedAt(settings, date, slot.from);

      return {
        from: slot.from,
        to: slot.to,
        maxReservations: slot.maxReservations,
        reserved,
        remaining,
        closed,
      };
    });

    return { slots: result };
  }
}
