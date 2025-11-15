import type { FastifyRequest, FastifyReply } from "fastify";
import z from "zod";
import { makeUpdateRestaurantUseCase } from "@/use-cases/factories/make-update-restaurant-use-case";
import {
  restaurantSettingsSchema,
  type RestaurantSettings,
} from "@/types/restaurant-settings";

const paramsSchema = z.object({
  restaurantId: z.string().uuid(),
});

const bodySchema = z.object({
  name: z.string().min(1).optional().nullable(),
  logo: z.string().url().optional().nullable().or(z.literal(null)),
  primaryColor: z
    .string()
    .regex(/^#([0-9a-fA-F]{6})$/, "hex color like #RRGGBB")
    .optional()
    .nullable(),
  settings: restaurantSettingsSchema.optional().nullable(),
});

export async function updateRestaurant(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { restaurantId } = paramsSchema.parse(request.params);
  const body = bodySchema.parse(request.body);

  const useCase = makeUpdateRestaurantUseCase();

  const requestData: {
    restaurantId: string;
    name?: string;
    logo?: string | null;
    primaryColor?: string | null;
    settings?: RestaurantSettings | null;
  } = {
    restaurantId,
  };

  if (body.name !== null && body.name !== undefined) {
    requestData.name = body.name;
  }

  if (body.logo !== undefined) {
    requestData.logo = body.logo;
  }

  if (body.primaryColor !== undefined) {
    requestData.primaryColor = body.primaryColor;
  }

  if (body.settings !== undefined) {
    requestData.settings = body.settings;
  }

  const { restaurant } = await useCase.execute(requestData);

  return reply.status(200).send({ restaurant });
}
