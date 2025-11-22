import type { FastifyReply } from "fastify";
import { ZodError } from "zod";
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
import { InvalidReservationTimeError } from "@/use-cases/errors/invalid-reservation-time-error";

export function handleUseCaseError(error: unknown, reply: FastifyReply) {
  if (error instanceof InvalidCredentialsError) {
    return reply.status(401).send({ message: "Incorrect email or password." });
  }

  if (error instanceof RestaurantNotFound) {
    return reply.status(404).send({ message: "Restaurant not found" });
  }

  if (error instanceof UserAlreadyExistsError) {
    return reply.status(409).send({ message: error.message });
  }

  if (error instanceof RestaurantAlreadyExistsError) {
    return reply.status(409).send({ message: error.message });
  }

  if (error instanceof ReservationConflictError) {
    return reply.status(409).send({ message: error.message });
  }

  if (error instanceof ReservationPastDate) {
    return reply.status(400).send({ message: error.message });
  }

  if (error instanceof RestaurantClosed) {
    return reply.status(400).send({ message: error.message });
  }

  if (error instanceof InvalidReservationTimeError) {
    return reply.status(400).send({ message: error.message });
  }

  if (error instanceof ReservationNotFoundError) {
    return reply.status(404).send({ message: error.message });
  }

  if (error instanceof ReservationAlreadyCancelledError) {
    return reply.status(400).send({ message: error.message });
  }

  if (error instanceof ResourceNotFoundError) {
    return reply.status(404).send({ message: error.message });
  }

  if (error instanceof ZodError) {
    return reply.status(400).send({
      message: "Validation error",
      issues: error.issues,
    });
  }

  console.error("Unhandled error in use case:", error);
  
  throw error;
}

