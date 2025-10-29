import type { Prisma, Restaurant } from "../../generated/prisma";

export interface RestaurantsRepository {
  findById(id: string): Promise<Restaurant | null>;
  create(data: Prisma.RestaurantCreateInput): Promise<Restaurant>;
}
