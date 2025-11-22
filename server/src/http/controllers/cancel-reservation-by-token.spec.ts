import { describe, it, expect, vi, beforeEach } from "vitest";
import type { FastifyRequest, FastifyReply } from "fastify";
import { cancelReservationByToken } from "./cancel-reservation-by-token";
import { ReservationNotFoundError } from "@/use-cases/errors/reservation-not-found-error";
import { ReservationAlreadyCancelledError } from "@/use-cases/errors/reservation-already-cancelled-error";

vi.mock("@/use-cases/factories/make-cancel-reservation-by-token-use-case", () => ({
  makeCancelReservationByTokenUseCase: vi.fn(),
}));

describe("Cancel Reservation By Token Controller", () => {
  const mockReply = {
    status: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
  } as unknown as FastifyReply;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should cancel reservation by token successfully", async () => {
    const mockReservation = {
      id: "reservation-123",
      status: "cancelled",
    };

    const mockExecute = vi.fn().mockResolvedValue({
      reservation: mockReservation,
    });
    const { makeCancelReservationByTokenUseCase } = await import(
      "@/use-cases/factories/make-cancel-reservation-by-token-use-case"
    );
    vi.mocked(makeCancelReservationByTokenUseCase).mockReturnValue({
      execute: mockExecute,
    } as any);

    const mockRequest = {
      params: {
        token: "550e8400-e29b-41d4-a716-446655440000",
      },
    } as FastifyRequest;

    await cancelReservationByToken(mockRequest, mockReply);

    expect(mockExecute).toHaveBeenCalledWith({
      token: "550e8400-e29b-41d4-a716-446655440000",
    });
    expect(mockReply.status).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: "Reservation cancelled successfully.",
      reservationId: "reservation-123",
    });
  });

  it("should handle reservation not found error", async () => {
    const mockExecute = vi
      .fn()
      .mockRejectedValue(new ReservationNotFoundError());
    const { makeCancelReservationByTokenUseCase } = await import(
      "@/use-cases/factories/make-cancel-reservation-by-token-use-case"
    );
    vi.mocked(makeCancelReservationByTokenUseCase).mockReturnValue({
      execute: mockExecute,
    } as any);

    const mockRequest = {
      params: {
        token: "550e8400-e29b-41d4-a716-446655440000",
      },
    } as FastifyRequest;

    await cancelReservationByToken(mockRequest, mockReply);

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
    const { makeCancelReservationByTokenUseCase } = await import(
      "@/use-cases/factories/make-cancel-reservation-by-token-use-case"
    );
    vi.mocked(makeCancelReservationByTokenUseCase).mockReturnValue({
      execute: mockExecute,
    } as any);

    const mockRequest = {
      params: {
        token: "550e8400-e29b-41d4-a716-446655440000",
      },
    } as FastifyRequest;

    await cancelReservationByToken(mockRequest, mockReply);

    expect(mockReply.status).toHaveBeenCalledWith(400);
    expect(mockReply.send).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.any(String),
      }),
    );
  });

  it("should handle validation errors for invalid token format", async () => {
    const mockRequest = {
      params: {
        token: "invalid-token",
      },
    } as FastifyRequest;

    await cancelReservationByToken(mockRequest, mockReply);

    expect(mockReply.status).toHaveBeenCalledWith(400);
    expect(mockReply.send).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Validation error",
      }),
    );
  });
});

