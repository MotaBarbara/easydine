import type { FastifyReply, FastifyRequest } from "fastify";
import z from "zod";
import { makeGetRestaurantAvailabilityUseCase } from "@/use-cases/factories/make-get-restaurant-availability-use-case";
import { RestaurantNotFound } from "@/use-cases/errors/restaurant-not-found-error";

const paramsSchema = z.object({
  restaurantId: z.string().uuid(),
});

const querySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date must be YYYY-MM-DD"),
});

export async function getRestaurantAvailability(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { restaurantId } = paramsSchema.parse(request.params);
  const { date } = querySchema.parse(request.query);

  const useCase = makeGetRestaurantAvailabilityUseCase();

  try {
    const { slots } = await useCase.execute({
      restaurantId,
      date: new Date(`${date}T00:00:00.000Z`),
    });

    return reply.status(200).send({ slots });
  } catch (err) {
    if (err instanceof RestaurantNotFound) {
      return reply.status(404).send({ message: "Restaurant not found" });
    }
    throw err;
  }
}
