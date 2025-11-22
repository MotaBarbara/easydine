import { describe, it, expect, vi, beforeEach } from "vitest";
import type { FastifyRequest, FastifyReply } from "fastify";
import { listOwnerRestaurants } from "./list-owner-restaurants";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    restaurant: {
      findMany: vi.fn(),
    },
  },
}));

describe("List Owner Restaurants Controller", () => {
  const mockReply = {
    status: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
  } as unknown as FastifyReply;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return list of restaurants owned by user", async () => {
    const mockRestaurants = [
      {
        id: "restaurant-1",
        name: "Restaurant 1",
        logo: null,
        primaryColor: "#FF0000",
        settings: null,
        createdAt: new Date(),
      },
      {
        id: "restaurant-2",
        name: "Restaurant 2",
        logo: "https://example.com/logo.png",
        primaryColor: "#00FF00",
        settings: { slots: [] },
        createdAt: new Date(),
      },
    ];

    const { prisma } = await import("@/lib/prisma");
    vi.mocked(prisma.restaurant.findMany).mockResolvedValue(mockRestaurants);

    const mockRequest = {
      user: {
        sub: "user-123",
      },
    } as FastifyRequest;

    await listOwnerRestaurants(mockRequest, mockReply);

    expect(prisma.restaurant.findMany).toHaveBeenCalledWith({
      where: {
        owners: {
          some: {
            id: "user-123",
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    expect(mockReply.status).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      restaurants: [
        {
          id: "restaurant-1",
          name: "Restaurant 1",
          logo: null,
          primaryColor: "#FF0000",
          settings: null,
        },
        {
          id: "restaurant-2",
          name: "Restaurant 2",
          logo: "https://example.com/logo.png",
          primaryColor: "#00FF00",
          settings: { slots: [] },
        },
      ],
    });
  });

  it("should return empty array when user has no restaurants", async () => {
    const { prisma } = await import("@/lib/prisma");
    vi.mocked(prisma.restaurant.findMany).mockResolvedValue([]);

    const mockRequest = {
      user: {
        sub: "user-123",
      },
    } as FastifyRequest;

    await listOwnerRestaurants(mockRequest, mockReply);

    expect(mockReply.status).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({ restaurants: [] });
  });

  it("should return 401 when user is not authenticated", async () => {
    const mockRequest = {
      user: undefined,
    } as unknown as FastifyRequest;

    await listOwnerRestaurants(mockRequest, mockReply);

    expect(mockReply.status).toHaveBeenCalledWith(401);
    expect(mockReply.send).toHaveBeenCalledWith({ message: "Unauthorized" });
  });

  it("should return 401 when user.sub is missing", async () => {
    const mockRequest = {
      user: {},
    } as FastifyRequest;

    await listOwnerRestaurants(mockRequest, mockReply);

    expect(mockReply.status).toHaveBeenCalledWith(401);
    expect(mockReply.send).toHaveBeenCalledWith({ message: "Unauthorized" });
  });
});

