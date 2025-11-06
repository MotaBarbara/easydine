import type { Prisma, Restaurant } from "generated/prisma";
import crypto from "node:crypto";
import type { RestaurantsRepository } from "../restaurants-repository";

export class InMemoryRestaurantsRepository implements RestaurantsRepository {
  public items: Restaurant[] = [];

  async findById(id: string): Promise<Restaurant | null> {
    return this.items.find(r => r.id === id) ?? null;
  }

  async findByName(name: string) {
    return this.items.find(r => r.name === name) ?? null;
  }

  async create(data: Prisma.RestaurantCreateInput) {
    const restaurant: Restaurant = {
      id: crypto.randomUUID(),
      name: data.name!,
      logo: (data as any).logo ?? null,
      primaryColor: (data as any).primaryColor ?? null,
      settings: (data as any).settings ?? null,
      createdAt: new Date(),
    };
    this.items.push(restaurant);
    return restaurant;
  }
}
