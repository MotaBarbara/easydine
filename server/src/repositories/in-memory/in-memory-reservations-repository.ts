import crypto, { randomUUID } from "node:crypto";
import type { Prisma, Reservation } from "generated/prisma";
import type { ReservationsRepository } from "../reservations-repository";
import { prisma } from "@/lib/prisma";

export class InMemoryReservationsRepository implements ReservationsRepository {
  public items: Reservation[] = [];

  async findByDateTimeAndRestaurant(
    restaurantId: string,
    date: Date,
    time: string,
  ) {
    return (
      this.items.filter(
        r =>
          r.restaurantId === restaurantId &&
          r.date.getTime() === date.getTime() &&
          r.time === time,
      ) ?? null
    );
  }

  async sumGroupSizePerSlot(
    restaurantId: string,
    date: Date,
    from: string,
    to: string,
  ) {
    return this.items
      .filter(
        r =>
          r.restaurantId === restaurantId &&
          r.date.getTime() === date.getTime() &&
          r.time >= from &&
          r.time < to,
      )
      .reduce((acc, r) => acc + r.groupSize, 0);
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
      cancelToken: randomUUID(),
    };

    this.items.push(reservation);
    return reservation;
  }

  async findById(id: string) {
    return this.items.find(r => r.id === id) ?? null;
  }

  async updateStatus(
    id: string,
    status: "confirmed" | "cancelled",
  ): Promise<Reservation> {
    const index = this.items.findIndex(r => r.id === id);
    if (index === -1) throw new Error("Reservation not found");

    const updated: Reservation = { ...this.items[index]!, status };
    this.items[index] = updated;
    return updated;
  }

  async listByRestaurantAndDate(restaurantId: string, date?: Date) {
    return this.items
      .filter(r => r.restaurantId === restaurantId)
      .filter(r => {
        if (!date) return true;

        const d = r.date instanceof Date ? r.date : new Date(r.date);
        const target = new Date(date);
        return (
          d.getUTCFullYear() === target.getUTCFullYear() &&
          d.getUTCMonth() === target.getUTCMonth() &&
          d.getUTCDate() === target.getUTCDate()
        );
      })
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }
  async findByCancelToken(token: string) {
    return this.items.find(r => r.cancelToken === token) ?? null;
  }
}
