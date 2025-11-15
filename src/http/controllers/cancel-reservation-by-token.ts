import type { FastifyRequest, FastifyReply } from "fastify";
import z from "zod";
import { makeCancelReservationByTokenUseCase } from "@/use-cases/factories/make-cancel-reservation-by-token-use-case";
import { ReservationNotFoundError } from "@/use-cases/errors/reservation-not-found-error";
import { ReservationAlreadyCancelledError } from "@/use-cases/errors/reservation-already-cancelled-error";

const paramsSchema = z.object({
  token: z.string().uuid(),
});

export async function cancelReservationByToken(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { token } = paramsSchema.parse(request.params);
  const useCase = makeCancelReservationByTokenUseCase();

  try {
    const { reservation } = await useCase.execute({ token });

    return reply.status(200).send({
      message: "Reservation cancelled successfully.",
      reservationId: reservation.id,
    });
  } catch (err) {
    if (err instanceof ReservationNotFoundError) {
      return reply.status(404).send({ message: "Reservation not found" });
    }
    if (err instanceof ReservationAlreadyCancelledError) {
      return reply
        .status(409)
        .send({ message: "Reservation already cancelled" });
    }
    throw err;
  }
}
