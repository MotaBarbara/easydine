import { describe, it, expect, vi, beforeEach } from "vitest";
import type { FastifyRequest, FastifyReply } from "fastify";
import { cancelReservation } from "./cancel";
import { ReservationNotFoundError } from "@/use-cases/errors/reservation-not-found-error";
import { ReservationAlreadyCancelledError } from "@/use-cases/errors/reservation-already-cancelled-error";

vi.mock("@/use-cases/factories/make-cancel-reservation-use-case", () => ({
  makeCancelReservationUseCase: vi.fn(),
}));

describe("Cancel Reservation Controller", () => {
  const mockReply = {
    status: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
  } as unknown as FastifyReply;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should cancel reservation successfully", async () => {
    const mockReservation = {
      id: "reservation-123",
      status: "cancelled",
      date: new Date("2025-12-25"),
      time: "19:00",
    };

    const mockExecute = vi.fn().mockResolvedValue({
      reservation: mockReservation,
    });
    const { makeCancelReservationUseCase } = await import(
      "@/use-cases/factories/make-cancel-reservation-use-case"
    );
    vi.mocked(makeCancelReservationUseCase).mockReturnValue({
      execute: mockExecute,
    } as any);

    const mockRequest = {
      params: {
        reservationId: "reservation-123",
      },
    } as FastifyRequest;

    await cancelReservation(mockRequest, mockReply);

    expect(mockExecute).toHaveBeenCalledWith("reservation-123");
    expect(mockReply.status).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      reservation: mockReservation,
    });
  });

  it("should handle reservation not found error", async () => {
    const mockExecute = vi
      .fn()
      .mockRejectedValue(new ReservationNotFoundError());
    const { makeCancelReservationUseCase } = await import(
      "@/use-cases/factories/make-cancel-reservation-use-case"
    );
    vi.mocked(makeCancelReservationUseCase).mockReturnValue({
      execute: mockExecute,
    } as any);

    const mockRequest = {
      params: {
        reservationId: "non-existent-id",
      },
    } as FastifyRequest;

    await cancelReservation(mockRequest, mockReply);

    expect(mockReply.status).toHaveBeenCalledWith(404);
    expect(mockReply.send).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.any(String),
      }),
    );
  });

  it("should handle already cancelled reservation error", async () => {
    const mockExecute = vi
      .fn()
      .mockRejectedValue(new ReservationAlreadyCancelledError());
    const { makeCancelReservationUseCase } = await import(
      "@/use-cases/factories/make-cancel-reservation-use-case"
    );
    vi.mocked(makeCancelReservationUseCase).mockReturnValue({
      execute: mockExecute,
    } as any);

    const mockRequest = {
      params: {
        reservationId: "reservation-123",
      },
    } as FastifyRequest;

    await cancelReservation(mockRequest, mockReply);

    expect(mockReply.status).toHaveBeenCalledWith(409);
    expect(mockReply.send).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.any(String),
      }),
    );
  });

  it("should handle validation errors for invalid uuid", async () => {
    const mockRequest = {
      params: {
        reservationId: "invalid-uuid",
      },
    } as FastifyRequest;

    await cancelReservation(mockRequest, mockReply);

    expect(mockReply.status).toHaveBeenCalledWith(400);
    expect(mockReply.send).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Validation error",
      }),
    );
  });
});

