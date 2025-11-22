import { describe, it, expect, vi, beforeEach } from "vitest";
import type { FastifyRequest, FastifyReply } from "fastify";
import { createReservation } from "./create-reservation";
import { RestaurantNotFound } from "@/use-cases/errors/restaurant-not-found-error";
import { ReservationConflictError } from "@/use-cases/errors/reservation-conflict-error";
import { ReservationPastDate } from "@/use-cases/errors/reservation-past-date-error";

// Mock the use case factory
vi.mock("@/use-cases/factories/make-create-reservation-use-case", () => ({
  makeCreateReservationUseCase: vi.fn(),
}));

describe("Create Reservation Controller", () => {
  const mockReply = {
    status: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
  } as unknown as FastifyReply;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create a reservation successfully", async () => {
    const mockReservation = {
      id: "reservation-123",
      date: new Date("2025-12-25"),
      time: "19:00",
      status: "confirmed",
      groupSize: 4,
      customerName: "John Doe",
      customerEmail: "john@example.com",
    };

    const mockRestaurant = {
      id: "restaurant-123",
      name: "Test Restaurant",
      logo: null,
      primaryColor: "#FF0000",
    };

    const mockExecute = vi.fn().mockResolvedValue({
      reservation: mockReservation,
      restaurant: mockRestaurant,
    });

    const { makeCreateReservationUseCase } = await import(
      "@/use-cases/factories/make-create-reservation-use-case"
    );
    vi.mocked(makeCreateReservationUseCase).mockReturnValue({
      execute: mockExecute,
    } as any);

    const mockRequest = {
      body: {
        restaurantId: "restaurant-123",
        date: "2025-12-25T00:00:00.000Z",
        time: "19:00",
        customerName: "John Doe",
        customerEmail: "john@example.com",
        groupSize: 4,
      },
    } as FastifyRequest;

    await createReservation(mockRequest, mockReply);

    expect(mockExecute).toHaveBeenCalledWith({
      restaurantId: "restaurant-123",
      date: "2025-12-25T00:00:00.000Z",
      time: "19:00",
      customerName: "John Doe",
      customerEmail: "john@example.com",
      groupSize: 4,
    });
    expect(mockReply.status).toHaveBeenCalledWith(201);
    expect(mockReply.send).toHaveBeenCalledWith({
      reservation: {
        id: "reservation-123",
        date: mockReservation.date,
        time: "19:00",
        status: "confirmed",
        groupSize: 4,
        customerName: "John Doe",
        customerEmail: "john@example.com",
      },
      restaurant: {
        id: "restaurant-123",
        name: "Test Restaurant",
        logo: null,
        primaryColor: "#FF0000",
      },
    });
  });

  it("should handle restaurant not found error", async () => {
    const mockExecute = vi.fn().mockRejectedValue(new RestaurantNotFound());
    const { makeCreateReservationUseCase } = await import(
      "@/use-cases/factories/make-create-reservation-use-case"
    );
    vi.mocked(makeCreateReservationUseCase).mockReturnValue({
      execute: mockExecute,
    } as any);

    const mockRequest = {
      body: {
        restaurantId: "non-existent-id",
        date: "2025-12-25T00:00:00.000Z",
        time: "19:00",
        customerName: "John Doe",
        customerEmail: "john@example.com",
        groupSize: 4,
      },
    } as FastifyRequest;

    await createReservation(mockRequest, mockReply);

    expect(mockReply.status).toHaveBeenCalledWith(404);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: "Restaurant not found",
    });
  });

  it("should handle reservation conflict error", async () => {
    const mockExecute = vi
      .fn()
      .mockRejectedValue(new ReservationConflictError());
    const { makeCreateReservationUseCase } = await import(
      "@/use-cases/factories/make-create-reservation-use-case"
    );
    vi.mocked(makeCreateReservationUseCase).mockReturnValue({
      execute: mockExecute,
    } as any);

    const mockRequest = {
      body: {
        restaurantId: "restaurant-123",
        date: "2025-12-25T00:00:00.000Z",
        time: "19:00",
        customerName: "John Doe",
        customerEmail: "john@example.com",
        groupSize: 4,
      },
    } as FastifyRequest;

    await createReservation(mockRequest, mockReply);

    expect(mockReply.status).toHaveBeenCalledWith(409);
    expect(mockReply.send).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.any(String),
      }),
    );
  });

  it("should handle past date error", async () => {
    const mockExecute = vi.fn().mockRejectedValue(new ReservationPastDate());
    const { makeCreateReservationUseCase } = await import(
      "@/use-cases/factories/make-create-reservation-use-case"
    );
    vi.mocked(makeCreateReservationUseCase).mockReturnValue({
      execute: mockExecute,
    } as any);

    const mockRequest = {
      body: {
        restaurantId: "restaurant-123",
        date: "2020-01-01T00:00:00.000Z",
        time: "19:00",
        customerName: "John Doe",
        customerEmail: "john@example.com",
        groupSize: 4,
      },
    } as FastifyRequest;

    await createReservation(mockRequest, mockReply);

    expect(mockReply.status).toHaveBeenCalledWith(400);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: "Cannot create reservations in the past.",
    });
  });

  it("should handle validation errors", async () => {
    const mockRequest = {
      body: {
        restaurantId: "invalid-uuid",
        date: "invalid-date",
        time: "",
        customerName: "",
        customerEmail: "invalid-email",
        groupSize: 0,
      },
    } as FastifyRequest;

    await createReservation(mockRequest, mockReply);

    expect(mockReply.status).toHaveBeenCalledWith(400);
    expect(mockReply.send).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Validation error",
      }),
    );
  });
});




