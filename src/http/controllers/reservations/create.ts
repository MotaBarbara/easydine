import type { FastifyReply, FastifyRequest } from "fastify";
import z, { optional } from "zod";
import { makeCreateReservationUseCase } from "@/use-cases/factories/make-create-reservation-use-case";
import { ReservationConflictError } from "@/use-cases/errors/reservation-conflict-error";
import { RestaurantNotFound } from "@/use-cases/errors/restaurant-not-found-error";
import { RestaurantClosed } from "@/use-cases/errors/restaurant-closed-error";
import { ReservationPastDate } from "@/use-cases/errors/reservation-past-date-error";

export async function createReservation(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const bodySchema = z.object({
    restaurantId: z.string().uuid(),
    date: z.string().datetime(),
    time: z.string().min(1),
    customerName: z.string().min(2),
    customerEmail: z.string().email(),
    groupSize: z.number().min(1),
    status: z.string().optional(),
  });

  const {
    restaurantId,
    date,
    time,
    customerName,
    customerEmail,
    groupSize,
    status,
  } = bodySchema.parse(request.body);

  try {
    const createReservationUseCase = makeCreateReservationUseCase();
    const { reservation } = await createReservationUseCase.execute({
      restaurantId,
      date: new Date(date),
      time,
      customerName,
      customerEmail,
      groupSize,
      status: status ?? "confirmed",
    });
    return reply.status(201).send({ reservation });
  } catch (err) {
    if (err instanceof ReservationConflictError) {
      return reply.status(409).send({ message: err.message });
    }

    if (err instanceof ReservationPastDate) {
      return reply.status(400).send({ message: err.message });
    }

    if (err instanceof RestaurantClosed) {
      return reply.status(400).send({ message: err.message });
    }

    if (err instanceof RestaurantNotFound) {
      return reply.status(404).send({ message: err.message });
    }
    throw err;
  }
}
