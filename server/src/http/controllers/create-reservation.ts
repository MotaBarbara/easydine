import type { FastifyRequest, FastifyReply } from "fastify";
import { makeCreateReservationUseCase } from "@/use-cases/factories/make-create-reservation-use-case";
import { createReservationBodySchema } from "@/http/schemas/reservation-schemas";
import { handleUseCaseError } from "@/http/middlewares/error-handler";

export async function createReservation(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const { restaurantId, date, time, customerName, customerEmail, groupSize } =
      createReservationBodySchema.parse(request.body);

    const useCase = makeCreateReservationUseCase();

    const { reservation, restaurant } = await useCase.execute({
      restaurantId,
      date,
      time,
      customerName,
      customerEmail,
      groupSize,
    });

    return reply.status(201).send({
      reservation: {
        id: reservation.id,
        date: reservation.date,
        time: reservation.time,
        status: reservation.status,
        groupSize: reservation.groupSize,
        customerName: reservation.customerName,
        customerEmail: reservation.customerEmail,
      },
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
        logo: restaurant.logo,
        primaryColor: restaurant.primaryColor,
      },
    });
  } catch (error) {
    return handleUseCaseError(error, reply);
  }
}
