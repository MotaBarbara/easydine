import type { FastifyRequest, FastifyReply } from "fastify";
import z from "zod";
import { makeCreateReservationUseCase } from "@/use-cases/factories/make-create-reservation-use-case";
import { PrismaRestaurantsRepository } from "@/repositories/prisma-restaurants-repository";
import { mail } from "@/lib/mail";

const bodySchema = z.object({
  restaurantId: z.string().uuid(),
  date: z.string().datetime(),
  time: z.string(),
  customerName: z.string().min(1),
  customerEmail: z.string().email(),
  groupSize: z.number().int().min(1),
});

export async function createReservation(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  console.log("is it running?");
  const { restaurantId, date, time, customerName, customerEmail, groupSize } =
    bodySchema.parse(request.body);

  console.log("✅ [HTTP] parsed body", {
    restaurantId,
    date,
    time,
    customerName,
    customerEmail,
    groupSize,
  });

  const useCase = makeCreateReservationUseCase();

  const { reservation } = await useCase.execute({
    restaurantId,
    date: new Date(date),
    time,
    customerName,
    customerEmail,
    groupSize,
  });

  const restaurantsRepo = new PrismaRestaurantsRepository();
  const restaurant = await restaurantsRepo.findById(restaurantId);

  const frontendBase = process.env.FRONTEND_BASE_URL ?? "http://localhost:3000";

  if (restaurant) {
    const cancelUrl = `${frontendBase}/reservations/cancel/${reservation.cancelToken}`;

    console.log("[EMAIL] about to send", {
      to: reservation.customerEmail,
      restaurantId,
      cancelToken: reservation.cancelToken,
    });

    mail
      .sendMail({
        from: process.env.MAIL_FROM ?? '"EasyDine" <no-reply@easydine.test>',
        to: reservation.customerEmail,
        subject: `Your reservation at ${restaurant.name} is confirmed`,
        html: `
          <p>Hi ${reservation.customerName},</p>
          <p>Your reservation is confirmed at <strong>${
            restaurant.name
          }</strong>.</p>
          <p>
            <strong>Date:</strong> ${reservation.date
              .toISOString()
              .slice(0, 10)}<br/>
            <strong>Time:</strong> ${reservation.time}<br/>
            <strong>Guests:</strong> ${reservation.groupSize}
          </p>
          <p>If you need to cancel, click the link below:</p>
          <p><a href="${cancelUrl}">Cancel this reservation</a></p>
        `,
      })
      .catch(err => {
        console.error("Failed to send confirmation email:", err);
      });
  }

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
      id: restaurant?.id,
      name: restaurant?.name,
      logo: restaurant?.logo,
      primaryColor: restaurant?.primaryColor,
    },
  });
}
