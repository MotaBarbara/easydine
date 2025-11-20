import type { FastifyReply, FastifyRequest } from "fastify";
import { makeCancelReservationUseCase } from "@/use-cases/factories/make-cancel-reservation-use-case";
import { reservationIdParamSchema } from "@/http/schemas/common-schemas";
import { handleUseCaseError } from "@/http/middlewares/error-handler";

export async function cancelReservation(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const { reservationId } = reservationIdParamSchema.parse(request.params);
    const useCase = makeCancelReservationUseCase();
    const { reservation } = await useCase.execute(reservationId);
    return reply.status(200).send({ reservation });
  } catch (error) {
    return handleUseCaseError(error, reply);
  }
}
