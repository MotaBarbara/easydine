import type { FastifyRequest, FastifyReply } from "fastify";
import { makeUpdateRestaurantUseCase } from "@/use-cases/factories/make-update-restaurant-use-case";
import { restaurantIdParamSchema } from "@/http/schemas/common-schemas";
import { updateRestaurantBodySchema } from "@/http/schemas/restaurant-schemas";
import { handleUseCaseError } from "@/http/middlewares/error-handler";

function removeUndefined<T extends Record<string, unknown>>(
  obj: T,
): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, value]) => value !== undefined),
  ) as Partial<T>;
}

export async function updateRestaurant(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const { restaurantId } = restaurantIdParamSchema.parse(request.params);
    const body = updateRestaurantBodySchema.parse(request.body);

    const useCase = makeUpdateRestaurantUseCase();

    const requestData = {
      restaurantId,
      ...removeUndefined(body),
    };

    const { restaurant } = await useCase.execute(requestData);

    return reply.status(200).send({ restaurant });
  } catch (error) {
    return handleUseCaseError(error, reply);
  }
}
