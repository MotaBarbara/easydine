import { describe, it, expect, vi, beforeEach } from "vitest";
import type { FastifyRequest, FastifyReply } from "fastify";
import { updateRestaurant } from "./update-restaurant";
import { RestaurantNotFound } from "@/use-cases/errors/restaurant-not-found-error";

// Mock the use case factory
vi.mock("@/use-cases/factories/make-update-restaurant-use-case", () => ({
  makeUpdateRestaurantUseCase: vi.fn(),
}));

describe("Update Restaurant Controller", () => {
  const mockReply = {
    status: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
  } as unknown as FastifyReply;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should update restaurant successfully", async () => {
    const mockRestaurant = {
      id: "restaurant-123",
      name: "Updated Restaurant",
      logo: "https://example.com/new-logo.png",
      primaryColor: "#00FF00",
      settings: { slots: [] },
    };

    const mockExecute = vi.fn().mockResolvedValue({ restaurant: mockRestaurant });
    const { makeUpdateRestaurantUseCase } = await import(
      "@/use-cases/factories/make-update-restaurant-use-case"
    );
    vi.mocked(makeUpdateRestaurantUseCase).mockReturnValue({
      execute: mockExecute,
    } as any);

    const mockRequest = {
      params: {
        restaurantId: "restaurant-123",
      },
      body: {
        name: "Updated Restaurant",
        logo: "https://example.com/new-logo.png",
        primaryColor: "#00FF00",
      },
    } as FastifyRequest;

    await updateRestaurant(mockRequest, mockReply);

    expect(mockExecute).toHaveBeenCalledWith({
      restaurantId: "restaurant-123",
      name: "Updated Restaurant",
      logo: "https://example.com/new-logo.png",
      primaryColor: "#00FF00",
    });
    expect(mockReply.status).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({ restaurant: mockRestaurant });
  });

  it("should handle partial updates", async () => {
    const mockRestaurant = {
      id: "restaurant-123",
      name: "Original Name",
      logo: null,
      primaryColor: "#FF0000",
      settings: null,
    };

    const mockExecute = vi.fn().mockResolvedValue({ restaurant: mockRestaurant });
    const { makeUpdateRestaurantUseCase } = await import(
      "@/use-cases/factories/make-update-restaurant-use-case"
    );
    vi.mocked(makeUpdateRestaurantUseCase).mockReturnValue({
      execute: mockExecute,
    } as any);

    const mockRequest = {
      params: {
        restaurantId: "restaurant-123",
      },
      body: {
        name: "Updated Name",
      },
    } as FastifyRequest;

    await updateRestaurant(mockRequest, mockReply);

    expect(mockExecute).toHaveBeenCalledWith({
      restaurantId: "restaurant-123",
      name: "Updated Name",
    });
    expect(mockReply.status).toHaveBeenCalledWith(200);
  });

  it("should handle restaurant not found error", async () => {
    const mockExecute = vi.fn().mockRejectedValue(new RestaurantNotFound());
    const { makeUpdateRestaurantUseCase } = await import(
      "@/use-cases/factories/make-update-restaurant-use-case"
    );
    vi.mocked(makeUpdateRestaurantUseCase).mockReturnValue({
      execute: mockExecute,
    } as any);

    const mockRequest = {
      params: {
        restaurantId: "non-existent-id",
      },
      body: {
        name: "Updated Name",
      },
    } as FastifyRequest;

    await updateRestaurant(mockRequest, mockReply);

    expect(mockReply.status).toHaveBeenCalledWith(404);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: "Restaurant not found",
    });
  });

  it("should handle validation errors for invalid uuid", async () => {
    const mockRequest = {
      params: {
        restaurantId: "invalid-uuid",
      },
      body: {
        name: "Updated Name",
      },
    } as FastifyRequest;

    await updateRestaurant(mockRequest, mockReply);

    expect(mockReply.status).toHaveBeenCalledWith(400);
    expect(mockReply.send).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Validation error",
      }),
    );
  });

  it("should handle validation errors for invalid body", async () => {
    const mockRequest = {
      params: {
        restaurantId: "restaurant-123",
      },
      body: {
        primaryColor: "invalid-color",
      },
    } as FastifyRequest;

    await updateRestaurant(mockRequest, mockReply);

    expect(mockReply.status).toHaveBeenCalledWith(400);
    expect(mockReply.send).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Validation error",
      }),
    );
  });
});




