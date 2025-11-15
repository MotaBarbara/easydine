import type { Reservation } from "generated/prisma";
import type { Restaurant } from "generated/prisma";
import { sendMail } from "@/lib/mailer";

const APP_BASE_URL = process.env.APP_BASE_URL ?? "http://localhost:3333";

export async function sendReservationConfirmationEmail(params: {
  reservation: Reservation;
  restaurant: Restaurant;
}) {
  const { reservation, restaurant } = params;

  const cancelUrl = `${APP_BASE_URL}/reservations/cancel/${reservation.cancelToken}`;

  const subject = `Your reservation at ${restaurant.name} is confirmed`;

  const html = `
    <p>Hi ${reservation.customerName},</p>
    <p>Your reservation is confirmed at <strong>${restaurant.name}</strong>.</p>
    <p>
      <strong>Date:</strong> ${reservation.date.toISOString().slice(0, 10)}<br/>
      <strong>Time:</strong> ${reservation.time}<br/>
      <strong>Guests:</strong> ${reservation.groupSize}
    </p>
    <p>If you need to cancel, click the link below:</p>
    <p><a href="${cancelUrl}">Cancel this reservation</a></p>
    <p>If you didn’t make this reservation, you can safely ignore this email.</p>
  `;

  await sendMail({
    to: reservation.customerEmail,
    subject,
    html,
  });
}
