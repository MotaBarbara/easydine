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
    // ask help how to validate
    settings: z.record(z.any(), z.any()).optional().nullable(),
  });

  const { name, logo, primaryColor, settings } = bodySchema.parse(
    request.body,
  );

  const userId =
    // @ts-expect-error auth typing depends on your plugin
    request.user?.sub ??
    (request.headers["x-user-id"] as string | undefined);

  if (!userId) {
    return reply.status(401).send({ message: "Unauthorized" });
  }

  try {
    const useCase = makeCreateRestaurantUseCase();
    const { restaurant } = await useCase.execute({
      userId,
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
