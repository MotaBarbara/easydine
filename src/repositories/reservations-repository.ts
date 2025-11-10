import type { Prisma, Reservation } from "generated/prisma";

export interface ReservationsRepository {
  findByDateTimeAndRestaurant(
    restaurantId: string,
    date: Date,
    time: string,
  ): Promise<Reservation[]>;

  sumGroupSizePerSlot(
    restaurantId: string,
    date: Date,
    from: string,
    to: string,
  ): Promise<number>;

  create(data: Prisma.ReservationCreateInput): Promise<Reservation>;

  findById(id: string): Promise<Reservation | null>;

  updateStatus(
    id: string,
    status: "confirmed" | "cancelled",
  ): Promise<Reservation>;

  listByRestaurantAndDate(
    restaurantId: string,
    date?: Date,
  ): Promise<Reservation[]>;
}
