import type { FastifyReply, FastifyRequest } from "fastify";
import { makeListRestaurantsUseCase } from "@/use-cases/factories/make-list-restaurants-use-case";

export async function listRestaurants(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const useCase = makeListRestaurantsUseCase();
  const { restaurants } = await useCase.execute();

  return reply.status(200).send({ restaurants });
}
