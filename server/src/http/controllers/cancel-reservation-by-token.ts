import type { FastifyRequest, FastifyReply } from "fastify";
import z from "zod";
import { makeCancelReservationByTokenUseCase } from "@/use-cases/factories/make-cancel-reservation-by-token-use-case";
import { handleUseCaseError } from "@/http/middlewares/error-handler";

const tokenParamSchema = z.object({
  token: z.string().uuid(),
});

export async function cancelReservationByToken(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const { token } = tokenParamSchema.parse(request.params);
    const useCase = makeCancelReservationByTokenUseCase();

    const { reservation } = await useCase.execute({ token });

    return reply.status(200).send({
      message: "Reservation cancelled successfully.",
      reservationId: reservation.id,
    });
  } catch (error) {
    return handleUseCaseError(error, reply);
  }
}
