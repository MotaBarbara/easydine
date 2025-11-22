import { describe, it, expect, vi, beforeEach } from "vitest";
import type { FastifyRequest, FastifyReply } from "fastify";
import { getRestaurantAvailability } from "./get-restaurant-availability";
import { RestaurantNotFound } from "@/use-cases/errors/restaurant-not-found-error";

vi.mock("@/use-cases/factories/make-get-restaurant-availability-use-case", () => ({
  makeGetRestaurantAvailabilityUseCase: vi.fn(),
}));

describe("Get Restaurant Availability Controller", () => {
  const mockReply = {
    status: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
  } as unknown as FastifyReply;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return available slots for a restaurant on a date", async () => {
    const mockSlots = [
      { time: "19:00", available: true },
      { time: "20:00", available: false },
      { time: "21:00", available: true },
    ];

    const mockExecute = vi.fn().mockResolvedValue({ slots: mockSlots });
    const { makeGetRestaurantAvailabilityUseCase } = await import(
      "@/use-cases/factories/make-get-restaurant-availability-use-case"
    );
    vi.mocked(makeGetRestaurantAvailabilityUseCase).mockReturnValue({
      execute: mockExecute,
    } as any);

    const mockRequest = {
      params: {
        restaurantId: "restaurant-123",
      },
      query: {
        date: "2025-12-25",
      },
    } as FastifyRequest;

    await getRestaurantAvailability(mockRequest, mockReply);

    expect(mockExecute).toHaveBeenCalledWith({
      restaurantId: "restaurant-123",
      date: expect.any(Date),
    });
    expect(mockReply.status).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({ slots: mockSlots });
  });

  it("should handle restaurant not found error", async () => {
    const mockExecute = vi.fn().mockRejectedValue(new RestaurantNotFound());
    const { makeGetRestaurantAvailabilityUseCase } = await import(
      "@/use-cases/factories/make-get-restaurant-availability-use-case"
    );
    vi.mocked(makeGetRestaurantAvailabilityUseCase).mockReturnValue({
      execute: mockExecute,
    } as any);

    const mockRequest = {
      params: {
        restaurantId: "non-existent-id",
      },
      query: {
        date: "2025-12-25",
      },
    } as FastifyRequest;

    await getRestaurantAvailability(mockRequest, mockReply);

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
      query: {
        date: "2025-12-25",
      },
    } as FastifyRequest;

    await getRestaurantAvailability(mockRequest, mockReply);

    expect(mockReply.status).toHaveBeenCalledWith(400);
    expect(mockReply.send).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Validation error",
      }),
    );
  });

  it("should handle validation errors for invalid date format", async () => {
    const mockRequest = {
      params: {
        restaurantId: "restaurant-123",
      },
      query: {
        date: "invalid-date",
      },
    } as FastifyRequest;

    await getRestaurantAvailability(mockRequest, mockReply);

    expect(mockReply.status).toHaveBeenCalledWith(400);
    expect(mockReply.send).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Validation error",
      }),
    );
  });
});

