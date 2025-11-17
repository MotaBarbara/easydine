import type { FastifyReply, FastifyRequest } from "fastify";
import z from "zod";
import { InvalidCredentialsError } from "@/use-cases/errors/invalid-credentials-error";
import { makeAuthenticateUseCase } from "@/use-cases/factories/make-authenticate-use-case";

export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const authenticateBodySchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
  });

  try {
    const { email, password } = authenticateBodySchema.parse(request.body);
    const { user } = await makeAuthenticateUseCase().execute({
      email,
      password,
    });
    const token = await reply.jwtSign({
      sub: user.id,
      restaurantId: user.restaurantId ?? undefined,
      email: user.email,
      name: user.name,
    });

    return reply.status(200).send({ token });
  } catch (error) {
    if (error instanceof InvalidCredentialsError) {
      return reply
        .status(401)
        .send({ message: "Incorrect email or password." });
    }
    if (error instanceof z.ZodError) {
      return reply
        .status(400)
        .send({ message: "Please enter valid credentials." });
    }
    throw error;
  }
}
