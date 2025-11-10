import type { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { makeListReservationsUseCase } from "@/use-cases/factories/make-list-reservation-use-case";

const querySchema = z.object({
  date: z.string().date().optional(),
});

const paramsSchema = z.object({
  restaurantId: z.string().uuid(),
});

export async function listReservations(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { restaurantId } = paramsSchema.parse(request.params);
  const { date } = querySchema.parse(request.query);

  const listReservationsUseCase = makeListReservationsUseCase();

  const result = await listReservationsUseCase.execute(
    date != null ? { restaurantId, date: new Date(date) } : { restaurantId },
  );

  return reply.status(200).send(result);
}
