import type { FastifyRequest, FastifyReply } from "fastify";
import z from "zod";

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

  if (!payload?.restaurantId) {
    return reply.status(401).send({ message: "Unauthorized" });
  }

  if (payload.restaurantId !== restaurantId) {
    return reply.status(403).send({ message: "Not owner of this restaurant" });
  }
}
