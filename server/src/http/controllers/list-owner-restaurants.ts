import type { FastifyReply, FastifyRequest } from "fastify";
import { ResourceNotFoundError } from "@/use-cases/errors/resource-not-found-error";

export async function listOwnerRestaurants(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const payload = request.user as { sub?: string } | undefined;

  if (!payload?.sub) {
    return reply.status(401).send({ message: "Unauthorized" });
  }

  try {
    const { prisma } = await import("@/lib/prisma");
    
    const restaurantsData = await prisma.restaurant.findMany({
      where: {
        owners: {
          some: {
            id: payload.sub,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const restaurants = restaurantsData.map(r => ({
      id: r.id,
      name: r.name,
      logo: r.logo,
      primaryColor: r.primaryColor,
      settings: r.settings,
    }));

    return reply.status(200).send({ restaurants });
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: "User not found" });
    }
    throw error;
  }
}

