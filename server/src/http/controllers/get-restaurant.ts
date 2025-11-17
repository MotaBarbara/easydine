import type { FastifyReply, FastifyRequest } from "fastify";
import z from "zod";
import { makeGetRestaurantUseCase } from "@/use-cases/factories/make-get-restaurant-use-case";
import { RestaurantNotFound } from "@/use-cases/errors/restaurant-not-found-error";

const paramsSchema = z.object({
  restaurantId: z.string().uuid(),
});

export async function getRestaurant(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { restaurantId } = paramsSchema.parse(request.params);

  const useCase = makeGetRestaurantUseCase();
  try {
    const { restaurant } = await useCase.execute({ restaurantId });
    return reply.status(200).send({ restaurant });
  } catch (err) {
    if (err instanceof RestaurantNotFound) {
      return reply.status(404).send({ message: "Restaurant not found" });
    }
    throw err;
  }
}
