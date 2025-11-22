import type { Reservation } from "generated/prisma";
import type { Restaurant } from "generated/prisma";
import { sendMail } from "@/lib/mailer";

export interface SendReservationConfirmationParams {
  reservation: Reservation;
  restaurant: Restaurant;
}

export class EmailService {
  async sendReservationConfirmation({
    reservation,
    restaurant,
  }: SendReservationConfirmationParams): Promise<void> {
    const frontendBase = process.env.FRONTEND_BASE_URL ?? "http://localhost:3000";
    const cancelUrl = `${frontendBase}/reservations/cancel/${reservation.cancelToken}`;

    const html = this.getReservationConfirmationTemplate({
      reservation,
      restaurant,
      cancelUrl,
    });

    await sendMail({
      to: reservation.customerEmail,
      subject: `Your reservation at ${restaurant.name} is confirmed`,
      html,
    });
  }

  private getReservationConfirmationTemplate({
    reservation,
    restaurant,
    cancelUrl,
  }: SendReservationConfirmationParams & { cancelUrl: string }): string {
    return `
      <p>Hi ${reservation.customerName},</p>
      <p>Your reservation is confirmed at <strong>${restaurant.name}</strong>.</p>
      <p>
        <strong>Date:</strong> ${reservation.date.toISOString().slice(0, 10)}<br/>
        <strong>Time:</strong> ${reservation.time}<br/>
        <strong>Guests:</strong> ${reservation.groupSize}
      </p>
      <p>If you need to cancel, click the link below:</p>
      <p><a href="${cancelUrl}">Cancel this reservation</a></p>
    `;
  }
}

