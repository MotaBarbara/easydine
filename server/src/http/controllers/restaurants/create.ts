import type { FastifyReply, FastifyRequest } from "fastify";
import { makeCreateRestaurantUseCase } from "@/use-cases/factories/make-create-restaurant-use-case";
import { createRestaurantBodySchema } from "@/http/schemas/restaurant-schemas";
import { handleUseCaseError } from "@/http/middlewares/error-handler";

export async function createRestaurant(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const { name, logo, primaryColor, settings } =
      createRestaurantBodySchema.parse(request.body);

    const payload = request.user as { sub?: string } | undefined;

    const ownerId =
      payload?.sub ?? (request.headers["x-user-id"] as string | undefined);

    if (!ownerId) {
      return reply.status(401).send({ message: "Unauthorized" });
    }

    const useCase = makeCreateRestaurantUseCase();
    const { restaurant } = await useCase.execute({
      ownerId,
      name,
      logo: logo ?? null,
      primaryColor: primaryColor ?? null,
      settings: settings ?? null,
    });
    return reply.status(201).send({ restaurant });
  } catch (error) {
    return handleUseCaseError(error, reply);
  }
}
