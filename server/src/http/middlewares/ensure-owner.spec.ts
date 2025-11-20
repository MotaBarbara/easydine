import { describe, it, beforeAll, expect, vi, beforeEach } from "vitest";
import Fastify from "fastify";
import jwtPlugin from "@/http/plugins/jwt";
import { verifyJWT } from "./verify-jwt";
import { ensureOwner } from "./ensure-owner";

// Mock Prisma
vi.mock("@/lib/prisma", () => ({
  prisma: {
    restaurant: {
      findUnique: vi.fn(),
    },
  },
}));

describe("Ownership & Auth Guards", () => {
  let app: ReturnType<typeof Fastify>;
  let mockPrisma: any;

  beforeAll(async () => {
    process.env.JWT_SECRET = "test-secret";
    app = Fastify();
    await app.register(jwtPlugin);

    app.get(
      "/restaurants/:restaurantId/protected",
      { preHandler: [verifyJWT, ensureOwner] },
      async () => ({ ok: true }),
    );

    await app.ready();
  });

  beforeEach(async () => {
    const prismaModule = await import("@/lib/prisma");
    mockPrisma = prismaModule.prisma;
    vi.clearAllMocks();
  });

  it("returns 401 when no token is provided", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/restaurants/550e8400-e29b-41d4-a716-446655440000/protected",
    });

    expect(response.statusCode).toBe(401);
  });

  it("returns 403 when user is not owner of restaurant", async () => {
    const restaurantId = "550e8400-e29b-41d4-a716-446655440002";
    const userId = "user-1";
    
    const token = app.jwt.sign({
      sub: userId,
      email: "owner@example.com",
      name: "Owner",
    });

    // Mock restaurant with different owner
    mockPrisma.restaurant.findUnique.mockResolvedValue({
      id: restaurantId,
      owners: [{ id: "different-user-id" }],
    });

    const response = await app.inject({
      method: "GET",
      url: `/restaurants/${restaurantId}/protected`,
      headers: { authorization: `Bearer ${token}` },
    });

    expect(response.statusCode).toBe(403);
  });

  it("returns 404 when restaurant does not exist", async () => {
    const restaurantId = "550e8400-e29b-41d4-a716-446655440004";
    const userId = "user-1";
    
    const token = app.jwt.sign({
      sub: userId,
      email: "owner@example.com",
      name: "Owner",
    });

    // Mock restaurant not found
    mockPrisma.restaurant.findUnique.mockResolvedValue(null);

    const response = await app.inject({
      method: "GET",
      url: `/restaurants/${restaurantId}/protected`,
      headers: { authorization: `Bearer ${token}` },
    });

    expect(response.statusCode).toBe(404);
  });

  it("returns 200 when user is owner of restaurant", async () => {
    const restaurantId = "550e8400-e29b-41d4-a716-446655440003";
    const userId = "user-1";
    
    const token = app.jwt.sign({
      sub: userId,
      email: "owner@example.com",
      name: "Owner",
    });

    // Mock restaurant with matching owner
    mockPrisma.restaurant.findUnique.mockResolvedValue({
      id: restaurantId,
      owners: [{ id: userId }],
    });

    const response = await app.inject({
      method: "GET",
      url: `/restaurants/${restaurantId}/protected`,
      headers: { authorization: `Bearer ${token}` },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ ok: true });
  });
});
