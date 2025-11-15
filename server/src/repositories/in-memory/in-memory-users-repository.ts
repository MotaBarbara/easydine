import type { Prisma, User } from "generated/prisma";
import crypto from "node:crypto";
import type { UsersRepository } from "../users-repository";

export class InMemoryUsersRepository implements UsersRepository {
  public items: User[] = [];

  async findById(id: string) {
    const user = this.items.find(user => user.id === id);

    if (!user) {
      return null;
    }

    return user;
  }

  async findByEmail(email: string) {
    const user = this.items.find(user => user.email === email);

    if (!user) {
      return null;
    }

    return user;
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    const user: User = {
      id: crypto.randomUUID(),
      email: data.email,
      name: data.name!,
      passwordHash: (data as any).passwordHash,
      createdAt: new Date(),
      restaurantId: null,
    };

    this.items.push(user);
    return user;
  }

  async setRestaurantId(userId: string, restaurantId: string): Promise<void> {
    const u = this.items.find(u => u.id === userId);
    if (u) u.restaurantId = restaurantId;
  }
}
