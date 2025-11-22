import { describe, it, expect, vi, beforeEach } from "vitest";
import type { FastifyReply } from "fastify";
import { handleUseCaseError } from "./error-handler";
import { InvalidCredentialsError } from "@/use-cases/errors/invalid-credentials-error";
import { RestaurantNotFound } from "@/use-cases/errors/restaurant-not-found-error";
import { UserAlreadyExistsError } from "@/use-cases/errors/user-already-exists-error";
import { RestaurantAlreadyExistsError } from "@/use-cases/errors/restaurant-already-exists-error";
import { ReservationConflictError } from "@/use-cases/errors/reservation-conflict-error";
import { ReservationPastDate } from "@/use-cases/errors/reservation-past-date-error";
import { RestaurantClosed } from "@/use-cases/errors/restaurant-closed-error";
import { ReservationNotFoundError } from "@/use-cases/errors/reservation-not-found-error";
import { ReservationAlreadyCancelledError } from "@/use-cases/errors/reservation-already-cancelled-error";
import { ResourceNotFoundError } from "@/use-cases/errors/resource-not-found-error";
import { ZodError } from "zod";

describe("Error handler", () => {
  const mockReply = {
    status: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
  } as unknown as FastifyReply;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("handles InvalidCredentialsError with 401", () => {
    const error = new InvalidCredentialsError();
    handleUseCaseError(error, mockReply);

    expect(mockReply.status).toHaveBeenCalledWith(401);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: "Incorrect email or password.",
    });
  });

  it("handles RestaurantNotFound with 404", () => {
    const error = new RestaurantNotFound();
    handleUseCaseError(error, mockReply);

    expect(mockReply.status).toHaveBeenCalledWith(404);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: "Restaurant not found",
    });
  });

  it("handles UserAlreadyExistsError with 409", () => {
    const error = new UserAlreadyExistsError();
    handleUseCaseError(error, mockReply);

    expect(mockReply.status).toHaveBeenCalledWith(409);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: error.message,
    });
  });

  it("handles RestaurantAlreadyExistsError with 409", () => {
    const error = new RestaurantAlreadyExistsError();
    handleUseCaseError(error, mockReply);

    expect(mockReply.status).toHaveBeenCalledWith(409);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: error.message,
    });
  });

  it("handles ReservationConflictError with 409", () => {
    const error = new ReservationConflictError();
    handleUseCaseError(error, mockReply);

    expect(mockReply.status).toHaveBeenCalledWith(409);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: error.message,
    });
  });

  it("handles ReservationPastDate with 400", () => {
    const error = new ReservationPastDate();
    handleUseCaseError(error, mockReply);

    expect(mockReply.status).toHaveBeenCalledWith(400);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: error.message,
    });
  });

  it("handles RestaurantClosed with 400", () => {
    const error = new RestaurantClosed();
    handleUseCaseError(error, mockReply);

    expect(mockReply.status).toHaveBeenCalledWith(400);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: error.message,
    });
  });

  it("handles ReservationNotFoundError with 404", () => {
    const error = new ReservationNotFoundError();
    handleUseCaseError(error, mockReply);

    expect(mockReply.status).toHaveBeenCalledWith(404);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: error.message,
    });
  });

  it("handles ReservationAlreadyCancelledError with 400", () => {
    const error = new ReservationAlreadyCancelledError();
    handleUseCaseError(error, mockReply);

    expect(mockReply.status).toHaveBeenCalledWith(400);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: error.message,
    });
  });

  it("handles ResourceNotFoundError with 404", () => {
    const error = new ResourceNotFoundError();
    handleUseCaseError(error, mockReply);

    expect(mockReply.status).toHaveBeenCalledWith(404);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: error.message,
    });
  });

  it("handles ZodError with 400 and validation issues", () => {
    const zodError = new ZodError([
      {
        code: "invalid_type",
        expected: "string",
        received: "number" as any,
        path: ["email"],
        message: "Expected string, received number",
      } as any,
    ]);
    handleUseCaseError(zodError, mockReply);

    expect(mockReply.status).toHaveBeenCalledWith(400);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: "Validation error",
      issues: zodError.issues,
    });
  });

  it("throws unknown errors", () => {
    const unknownError = new Error("Unknown error");

    expect(() => handleUseCaseError(unknownError, mockReply)).toThrow(
      unknownError,
    );
  });
});

