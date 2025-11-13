import { prisma } from "@/lib/prisma";
import { Prisma } from "generated/prisma";
import type { RestaurantsRepository } from "./restaurants-repository";

export class PrismaRestaurantsRepository implements RestaurantsRepository {
  async findById(id: string) {
    return prisma.restaurant.findUnique({ where: { id } });
  }

  async findByName(name: string) {
    return prisma.restaurant.findFirst({ where: { name } });
  }

  async create(data: Prisma.RestaurantCreateInput) {
    return prisma.restaurant.create({ data });
  }

  async updateById(
    id: string,
    data: {
      name?: string;
      logo?: string | null;
      primaryColor?: string | null;
      settings?: unknown | null;
    },
  ) {
    const prismaData: Prisma.RestaurantUpdateInput = {};

    if (data.name !== undefined) {
      prismaData.name = data.name!;
    }

    if (data.logo !== undefined) {
      prismaData.logo = data.logo as any;
    }

    if (data.primaryColor !== undefined) {
      prismaData.primaryColor = data.primaryColor as any;
    }

    if (data.settings !== undefined) {
      prismaData.settings = data.settings as any;
    }

    return prisma.restaurant.update({
      where: { id },
      data: prismaData,
    });
  }
}
