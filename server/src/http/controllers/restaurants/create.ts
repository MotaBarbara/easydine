import type { FastifyReply, FastifyRequest } from "fastify";
import z from "zod";
import { makeCreateRestaurantUseCase } from "@/use-cases/factories/make-create-restaurant-use-case";
import { RestaurantAlreadyExistsError } from "@/use-cases/errors/restaurant-already-exists-error";

export async function createRestaurant(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const bodySchema = z.object({
    name: z.string().min(2),
    logo: z.string().url().optional().nullable(),
    primaryColor: z.string().optional().nullable(),
    settings: z.record(z.any(), z.any()).optional().nullable(),
  });

  const { name, logo, primaryColor, settings } = bodySchema.parse(request.body);

  const payload = request.user as { sub?: string } | undefined;

  const ownerId =
    payload?.sub ?? (request.headers["x-user-id"] as string | undefined);

  if (!ownerId) {
    return reply.status(401).send({ message: "Unauthorized" });
  }

  try {
    const useCase = makeCreateRestaurantUseCase();
    const { restaurant } = await useCase.execute({
      ownerId,
      name,
      logo: logo ?? null,
      primaryColor: primaryColor ?? null,
      settings: settings ?? null,
    });
    return reply.status(201).send({ restaurant });
  } catch (err) {
    if (err instanceof RestaurantAlreadyExistsError) {
      return reply.status(409).send({ message: err.message });
    }
    throw err;
  }
}
