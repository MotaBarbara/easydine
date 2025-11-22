import { describe, it, expect, vi, beforeEach } from "vitest";
import { EmailService } from "./email-service";
import * as mailModule from "@/lib/mail";
import type { Reservation, Restaurant } from "generated/prisma";

vi.mock("@/lib/mail", () => ({
  mail: {
    sendMail: vi.fn(),
  },
}));

describe("EmailService", () => {
  let emailService: EmailService;
  const mockSendMail = vi.mocked(mailModule.mail.sendMail);

  beforeEach(() => {
    vi.clearAllMocks();
    emailService = new EmailService();
    process.env.FRONTEND_BASE_URL = "http://localhost:3000";
    process.env.MAIL_FROM = '"Test" <test@example.com>';
  });

  const mockReservation: Reservation = {
    id: "reservation-1",
    restaurantId: "restaurant-1",
    date: new Date("2025-12-25T18:00:00Z"),
    time: "18:00",
    customerName: "John Doe",
    customerEmail: "john@example.com",
    groupSize: 4,
    status: "confirmed",
    cancelToken: "cancel-token-123",
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Reservation;

  const mockRestaurant: Restaurant = {
    id: "restaurant-1",
    name: "Test Restaurant",
    logo: null,
    primaryColor: null,
    settings: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Restaurant;

  it("sends reservation confirmation email", async () => {
    mockSendMail.mockResolvedValue(undefined);

    await emailService.sendReservationConfirmation({
      reservation: mockReservation,
      restaurant: mockRestaurant,
    });

    expect(mockSendMail).toHaveBeenCalledWith({
      from: '"Test" <test@example.com>',
      to: "john@example.com",
      subject: "Your reservation at Test Restaurant is confirmed",
      html: expect.stringContaining("John Doe"),
    });

    const callArgs = mockSendMail.mock.calls[0]?.[0];
    expect(callArgs?.html).toContain("Test Restaurant");
    expect(callArgs?.html).toContain("2025-12-25");
    expect(callArgs?.html).toContain("18:00");
    expect(callArgs?.html).toContain("4");
    expect(callArgs?.html).toContain(
      "http://localhost:3000/reservations/cancel/cancel-token-123",
    );
  });

  it("uses default FRONTEND_BASE_URL when not set", async () => {
    delete process.env.FRONTEND_BASE_URL;
    mockSendMail.mockResolvedValue(undefined);

    await emailService.sendReservationConfirmation({
      reservation: mockReservation,
      restaurant: mockRestaurant,
    });

    const callArgs = mockSendMail.mock.calls[0]?.[0];
    expect(callArgs?.html).toContain(
      "http://localhost:3000/reservations/cancel/cancel-token-123",
    );
  });

  it("uses default MAIL_FROM when not set", async () => {
    delete process.env.MAIL_FROM;
    mockSendMail.mockResolvedValue(undefined);

    await emailService.sendReservationConfirmation({
      reservation: mockReservation,
      restaurant: mockRestaurant,
    });

    expect(mockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        from: '"EasyDine" <no-reply@easydine.test>',
      }),
    );
  });

  it("handles email sending errors gracefully", async () => {
    const error = new Error("SMTP error");
    mockSendMail.mockRejectedValue(error);

    await expect(
      emailService.sendReservationConfirmation({
        reservation: mockReservation,
        restaurant: mockRestaurant,
      }),
    ).rejects.toThrow("SMTP error");
  });
});

