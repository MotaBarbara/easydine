import type { FastifyReply, FastifyRequest } from "fastify";
import { makeGetUserProfileUseCase } from "@/use-cases/factories/make-get-user-profile-use-case";
import { handleUseCaseError } from "@/http/middlewares/error-handler";

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
      },
    });
  } catch (error) {
    return handleUseCaseError(error, reply);
  }
}

