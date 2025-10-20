import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
import type { FastifyReply, FastifyRequest } from "fastify";
import z from "zod";

export async function register(request: FastifyRequest, reply: FastifyReply) {
  const registerBodySchema = z.object({
    email: z.email(),
    password: z.string().min(6),
    name: z.string(),
  });

  const { email, password, name } = registerBodySchema.parse(request.body);

  const userWithSameEmail = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (userWithSameEmail) {
    return reply.status(409).send();
  }

  const passwordHash = await hash(password, 6);

  await prisma.user.create({
    data: {
      email,
      passwordHash,
      name,
    },
  });

  return reply.status(201).send();
}
