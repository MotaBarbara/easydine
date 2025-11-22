import type { FastifyReply, FastifyRequest } from "fastify";
import { makeListRestaurantsUseCase } from "@/use-cases/factories/make-list-restaurants-use-case";
import { handleUseCaseError } from "@/http/middlewares/error-handler";

export async function listRestaurants(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const useCase = makeListRestaurantsUseCase();
    const { restaurants } = await useCase.execute();

    return reply.status(200).send({ restaurants });
  } catch (error) {
    return handleUseCaseError(error, reply);
  }
}
