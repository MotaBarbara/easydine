import { prisma } from "@/lib/prisma";
import type { Prisma } from "generated/prisma";
import type { RestaurantsRepository } from "./restaurants-repository";

export class PrismaRestaurantsRepository implements RestaurantsRepository {
  async findById(id: string) {
    return prisma.restaurant.findUnique({ where: { id } });
  }

  async create(data: Prisma.RestaurantCreateInput) {
    return prisma.restaurant.create({ data });
  }
}
