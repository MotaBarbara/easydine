import { prisma } from "@/lib/prisma";
import type { Prisma, Reservation } from "generated/prisma";
import type { ReservationsRepository } from "./reservations-repository";

export class PrismaReservationsRepository implements ReservationsRepository {
  async findByDateTimeAndRestaurant(
    restaurantId: string,
    date: Date,
    time: string,
  ) {
    return prisma.reservation.findMany({
      where: { restaurantId, date, time },
    });
  }

  async sumGroupSizePerSlot(
    restaurantId: string,
    date: Date,
    from: string,
    to: string,
  ) {
    const total = await prisma.reservation.aggregate({
      _sum: { groupSize: true },
      where: {
        restaurantId,
        date,
        time: { gte: from, lt: to },
      },
    });
    return total._sum.groupSize ?? 0;
  }

  async create(data: Prisma.ReservationCreateInput) {
    return prisma.reservation.create({ data });
  }

  async findById(id: string) {
    return prisma.reservation.findUnique({ where: { id } });
  }

  async updateStatus(
    id: string,
    status: "confirmed" | "cancelled",
  ) {
    return prisma.reservation.update({
      where: { id },
      data: { status },
    });
  }
}
