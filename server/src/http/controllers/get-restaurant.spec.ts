import { describe, it, expect, vi, beforeEach } from "vitest";
import type { FastifyRequest, FastifyReply } from "fastify";
import { getRestaurant } from "./get-restaurant";
import { RestaurantNotFound } from "@/use-cases/errors/restaurant-not-found-error";

vi.mock("@/use-cases/factories/make-get-restaurant-use-case", () => ({
  makeGetRestaurantUseCase: vi.fn(),
}));

describe("Get Restaurant Controller", () => {
  const mockReply = {
    status: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
  } as unknown as FastifyReply;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return restaurant by id", async () => {
    const mockRestaurant = {
      id: "restaurant-123",
      name: "Test Restaurant",
      logo: "https://example.com/logo.png",
      primaryColor: "#FF0000",
      settings: null,
    };

    const mockExecute = vi.fn().mockResolvedValue({ restaurant: mockRestaurant });
    const { makeGetRestaurantUseCase } = await import(
      "@/use-cases/factories/make-get-restaurant-use-case"
    );
    vi.mocked(makeGetRestaurantUseCase).mockReturnValue({
      execute: mockExecute,
    } as any);

    const mockRequest = {
      params: {
        restaurantId: "restaurant-123",
      },
    } as FastifyRequest;

    await getRestaurant(mockRequest, mockReply);

    expect(mockExecute).toHaveBeenCalledWith({
      restaurantId: "restaurant-123",
    });
    expect(mockReply.status).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({ restaurant: mockRestaurant });
  });

  it("should handle restaurant not found error", async () => {
    const mockExecute = vi.fn().mockRejectedValue(new RestaurantNotFound());
    const { makeGetRestaurantUseCase } = await import(
      "@/use-cases/factories/make-get-restaurant-use-case"
    );
    vi.mocked(makeGetRestaurantUseCase).mockReturnValue({
      execute: mockExecute,
    } as any);

    const mockRequest = {
      params: {
        restaurantId: "550e8400-e29b-41d4-a716-446655440000",
      },
    } as FastifyRequest;

    await getRestaurant(mockRequest, mockReply);

    expect(mockReply.status).toHaveBeenCalledWith(404);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: "The restaurant you search for cannot be found.",
    });
  });

  it("should handle validation errors for invalid uuid", async () => {
    const mockRequest = {
      params: {
        restaurantId: "invalid-uuid",
      },
    } as FastifyRequest;

    await getRestaurant(mockRequest, mockReply);

    expect(mockReply.status).toHaveBeenCalledWith(400);
    expect(mockReply.send).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Validation error",
      }),
    );
  });
});
