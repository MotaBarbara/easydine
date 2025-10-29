import { prisma } from "@/lib/prisma";
import type { Prisma } from "generated/prisma";
import type { ReservationsRepository } from "./reservations-repository";

export class PrismaReservationsRepository implements ReservationsRepository {
  async findByDateTimeAndRestaurant(
    restaurantId: string,
    date: Date,
    time: string,
  ) {
    return prisma.reservation.findFirst({
      where: { restaurantId, date, time },
    });
  }

  async create(data: Prisma.ReservationCreateInput) {
    return prisma.reservation.create({ data });
  }
}
