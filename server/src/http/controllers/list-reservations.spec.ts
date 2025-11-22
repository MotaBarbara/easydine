import { describe, it, expect, vi, beforeEach } from "vitest";
import type { FastifyRequest, FastifyReply } from "fastify";
import { listReservations } from "./list-reservations";
import { RestaurantNotFound } from "@/use-cases/errors/restaurant-not-found-error";

vi.mock("@/use-cases/factories/make-list-reservation-use-case", () => ({
  makeListReservationsUseCase: vi.fn(),
}));

describe("List Reservations Controller", () => {
  const mockReply = {
    status: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
  } as unknown as FastifyReply;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should list reservations for a restaurant", async () => {
    const mockResult = {
      reservations: [
        {
          id: "reservation-1",
          date: new Date("2025-12-25"),
          time: "19:00",
          status: "confirmed",
          groupSize: 4,
          customerName: "John Doe",
          customerEmail: "john@example.com",
        },
      ],
    };

    const mockExecute = vi.fn().mockResolvedValue(mockResult);
    const { makeListReservationsUseCase } = await import(
      "@/use-cases/factories/make-list-reservation-use-case"
    );
    vi.mocked(makeListReservationsUseCase).mockReturnValue({
      execute: mockExecute,
    } as any);

    const mockRequest = {
      params: {
        restaurantId: "restaurant-123",
      },
      query: {},
    } as FastifyRequest;

    await listReservations(mockRequest, mockReply);

    expect(mockExecute).toHaveBeenCalledWith({
      restaurantId: "restaurant-123",
    });
    expect(mockReply.status).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith(mockResult);
  });

  it("should list reservations filtered by date", async () => {
    const mockResult = {
      reservations: [],
    };

    const mockExecute = vi.fn().mockResolvedValue(mockResult);
    const { makeListReservationsUseCase } = await import(
      "@/use-cases/factories/make-list-reservation-use-case"
    );
    vi.mocked(makeListReservationsUseCase).mockReturnValue({
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

    await listReservations(mockRequest, mockReply);

    expect(mockExecute).toHaveBeenCalledWith({
      restaurantId: "restaurant-123",
      date: expect.any(Date),
    });
    expect(mockReply.status).toHaveBeenCalledWith(200);
  });

  it("should handle restaurant not found error", async () => {
    const mockExecute = vi.fn().mockRejectedValue(new RestaurantNotFound());
    const { makeListReservationsUseCase } = await import(
      "@/use-cases/factories/make-list-reservation-use-case"
    );
    vi.mocked(makeListReservationsUseCase).mockReturnValue({
      execute: mockExecute,
    } as any);

    const mockRequest = {
      params: {
        restaurantId: "non-existent-id",
      },
      query: {},
    } as FastifyRequest;

    await listReservations(mockRequest, mockReply);

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
      query: {},
    } as FastifyRequest;

    await listReservations(mockRequest, mockReply);

    expect(mockReply.status).toHaveBeenCalledWith(400);
    expect(mockReply.send).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Validation error",
      }),
    );
  });
});

