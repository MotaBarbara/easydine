import type { FastifyRequest, FastifyReply } from "fastify";
import { makeListReservationsUseCase } from "@/use-cases/factories/make-list-reservation-use-case";
import { restaurantIdParamSchema } from "@/http/schemas/common-schemas";
import { dateQuerySchema } from "@/http/schemas/common-schemas";
import { handleUseCaseError } from "@/http/middlewares/error-handler";

export async function listReservations(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const { restaurantId } = restaurantIdParamSchema.parse(request.params);
    const { date } = dateQuerySchema.parse(request.query);

    const listReservationsUseCase = makeListReservationsUseCase();

    const result = await listReservationsUseCase.execute(
      date != null ? { restaurantId, date: new Date(date) } : { restaurantId },
    );

    return reply.status(200).send(result);
  } catch (error) {
    return handleUseCaseError(error, reply);
  }
}
