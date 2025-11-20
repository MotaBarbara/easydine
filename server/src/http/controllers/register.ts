import { makeRegisterUseCase } from "@/use-cases/factories/make-register-use-case";
import type { FastifyReply, FastifyRequest } from "fastify";
import { registerBodySchema } from "@/http/schemas/reservation-schemas";
import { handleUseCaseError } from "@/http/middlewares/error-handler";

export async function register(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { email, password, name } = registerBodySchema.parse(request.body);
    const registerUseCase = makeRegisterUseCase();
    await registerUseCase.execute({ name, email, password });
    return reply.status(201).send();
  } catch (error) {
    return handleUseCaseError(error, reply);
  }
}
