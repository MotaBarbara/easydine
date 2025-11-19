import type { FastifyRequest, FastifyReply } from "fastify";
import z from "zod";
import { ResourceNotFoundError } from "@/use-cases/errors/resource-not-found-error";

const paramsSchema = z.object({
  restaurantId: z.string().uuid(),
});

export async function ensureOwner(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const parsed = paramsSchema.safeParse(request.params);
  if (!parsed.success) {
    return reply.status(400).send({ message: "Invalid restaurantId" });
  }
  const { restaurantId } = parsed.data;

  const payload = request.user as
    | {
        sub: string;
        restaurantId?: string;
      }
    | undefined;

  if (!payload?.sub) {
    return reply.status(401).send({ message: "Unauthorized" });
  }

  try {
    const { prisma } = await import("@/lib/prisma");
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
      include: { owners: true },
    });

    if (!restaurant) {
      return reply.status(404).send({ message: "Restaurant not found" });
    }

    const isOwner = restaurant.owners.some(user => user.id === payload.sub);
    if (!isOwner) {
      return reply.status(403).send({ message: "Not owner of this restaurant" });
    }
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: "User not found" });
    }
    throw error;
  }
}
