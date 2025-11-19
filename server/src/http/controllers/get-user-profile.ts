import type { FastifyReply, FastifyRequest } from "fastify";
import { makeGetUserProfileUseCase } from "@/use-cases/factories/make-get-user-profile-use-case";
import { ResourceNotFoundError } from "@/use-cases/errors/resource-not-found-error";

export async function getUserProfile(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const payload = request.user as { sub?: string } | undefined;

  if (!payload?.sub) {
    return reply.status(401).send({ message: "Unauthorized" });
  }

  try {
    const useCase = makeGetUserProfileUseCase();
    const { user } = await useCase.execute({ userId: payload.sub });

    return reply.status(200).send({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        restaurantId: user.restaurantId,
      },
    });
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: "User not found" });
    }
    throw error;
  }
}

