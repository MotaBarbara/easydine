import type { FastifyReply, FastifyRequest } from "fastify";
import { makeGetRestaurantUseCase } from "@/use-cases/factories/make-get-restaurant-use-case";
import { restaurantIdParamSchema } from "@/http/schemas/common-schemas";
import { handleUseCaseError } from "@/http/middlewares/error-handler";

export async function getRestaurant(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const { restaurantId } = restaurantIdParamSchema.parse(request.params);
    const useCase = makeGetRestaurantUseCase();
    const { restaurant } = await useCase.execute({ restaurantId });
    return reply.status(200).send({ restaurant });
  } catch (error) {
    return handleUseCaseError(error, reply);
  }
}
