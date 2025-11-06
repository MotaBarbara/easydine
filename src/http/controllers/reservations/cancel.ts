import type { FastifyReply, FastifyRequest } from "fastify";
import { makeCancelReservationUseCase } from "@/use-cases/factories/make-cancel-reservation-use-case";
import { ReservationNotFoundError } from "@/use-cases/errors/reservation-not-found-error";
import { ReservationAlreadyCancelledError } from "@/use-cases/errors/reservation-already-cancelled-error";
import z from "zod";

export async function cancelReservation(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const paramsSchema = z.object({ id: z.string().uuid() });
  const { id } = paramsSchema.parse(request.params);

  try {
    const useCase = makeCancelReservationUseCase();
    const { reservation } = await useCase.execute(id);
    return reply.status(200).send({ reservation });
  } catch (error) {
    if (error instanceof ReservationNotFoundError) {
      return reply.status(404).send({ message: error.message });
    }
    if (error instanceof ReservationAlreadyCancelledError) {
      return reply.status(409).send({ message: error.message });
    }
    throw error;
  }
}
