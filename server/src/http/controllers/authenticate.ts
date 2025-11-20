import type { FastifyReply, FastifyRequest } from "fastify";
import { makeAuthenticateUseCase } from "@/use-cases/factories/make-authenticate-use-case";
import { authenticateBodySchema } from "@/http/schemas/reservation-schemas";
import { handleUseCaseError } from "@/http/middlewares/error-handler";

export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const { email, password } = authenticateBodySchema.parse(request.body);
    const { user } = await makeAuthenticateUseCase().execute({
      email,
      password,
    });
    const token = await reply.jwtSign({
      sub: user.id,
      email: user.email,
      name: user.name,
    });

    return reply.status(200).send({ token });
  } catch (error) {
    return handleUseCaseError(error, reply);
  }
}
