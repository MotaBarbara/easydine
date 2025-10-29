import type { Prisma, Reservation } from "generated/prisma";

export interface ReservationsRepository {
  findByDateTimeAndRestaurant(
    restaurantId: string,
    date: Date,
    time: string,
  ): Promise<Reservation | null>;
  create(data: Prisma.ReservationCreateInput): Promise<Reservation>;
}
