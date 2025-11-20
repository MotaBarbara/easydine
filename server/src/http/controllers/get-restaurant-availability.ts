import type { FastifyReply, FastifyRequest } from "fastify";
import z from "zod";
import { makeGetRestaurantAvailabilityUseCase } from "@/use-cases/factories/make-get-restaurant-availability-use-case";
import { restaurantIdParamSchema } from "@/http/schemas/common-schemas";
import { handleUseCaseError } from "@/http/middlewares/error-handler";

const availabilityQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date must be YYYY-MM-DD"),
});

export async function getRestaurantAvailability(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const { restaurantId } = restaurantIdParamSchema.parse(request.params);
    const { date } = availabilityQuerySchema.parse(request.query);

    const useCase = makeGetRestaurantAvailabilityUseCase();

    const { slots } = await useCase.execute({
      restaurantId,
      date: new Date(`${date}T00:00:00.000Z`),
    });

    return reply.status(200).send({ slots });
  } catch (error) {
    return handleUseCaseError(error, reply);
  }
}
