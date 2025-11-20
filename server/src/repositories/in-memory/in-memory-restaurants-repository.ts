import type { Prisma, Restaurant } from "generated/prisma";
import crypto from "node:crypto";
import type { RestaurantsRepository } from "../restaurants-repository";

export class InMemoryRestaurantsRepository implements RestaurantsRepository {
  public items: Restaurant[] = [];

  async updateById(
    id: string,
    data: {
      name?: string;
      logo?: string | null;
      primaryColor?: string | null;
      settings?: unknown | null;
    },
  ): Promise<Restaurant> {
    const r = this.items.find(i => i.id === id);
    if (!r) throw new Error("Restaurant not found");
    if (data.name !== undefined) r.name = data.name;
    if (data.logo !== undefined) r.logo = data.logo as any;
    if (data.primaryColor !== undefined)
      r.primaryColor = data.primaryColor as any;
    if (data.settings !== undefined) r.settings = data.settings as any;
    return r;
  }

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
  async listAll() {
    return this.items;
  }
}
