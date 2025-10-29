import crypto from "node:crypto";
import type { Prisma, Reservation } from "generated/prisma";
import type { ReservationsRepository } from "../reservations-repository";

export class InMemoryReservationsRepository implements ReservationsRepository {
  public items: Reservation[] = [];

  async findByDateTimeAndRestaurant(
    restaurantId: string,
    date: Date,
    time: string,
  ) {
    return (
      this.items.find(
        r =>
          r.restaurantId === restaurantId &&
          r.date.getTime() === date.getTime() &&
          r.time === time,
      ) ?? null
    );
  }

  async create(data: Prisma.ReservationCreateInput) {
    const reservation: Reservation = {
      id: crypto.randomUUID(),
      restaurantId: data.restaurant.connect?.id ?? "unknown",
      date: (data.date as any) ?? new Date(),
      time: data.time as any,
      customerName: data.customerName as any,
      customerEmail: data.customerEmail as any,
      groupSize: data.groupSize as any,
      status: data.status as any,
      createdAt: new Date(),
    };

    this.items.push(reservation);
    return reservation;
  }
}
