import type { Prisma, Restaurant } from "../../generated/prisma";

export interface RestaurantsRepository {
  findById(id: string): Promise<Restaurant | null>;
  findByName(name: string): Promise<Restaurant | null>;
  create(data: Prisma.RestaurantCreateInput): Promise<Restaurant>;
  updateById(
    id: string,
    data: {
      name?: string;
      logo?: string | null;
      primaryColor?: string | null;
      settings?: unknown | null;
    },
  ): Promise<Restaurant>;
}
