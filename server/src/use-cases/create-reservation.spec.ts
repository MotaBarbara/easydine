import { beforeEach, describe, expect, it, vi } from "vitest";
import { InMemoryReservationsRepository } from "@/repositories/in-memory/in-memory-reservations-repository";
import { InMemoryRestaurantsRepository } from "@/repositories/in-memory/in-memory-restaurants-repository";
import { CreateReservationUseCase } from "./create-reservation";
import { ReservationConflictError } from "./errors/reservation-conflict-error";
import { EmailService } from "@/services/email-service";

let reservationsRepo: InMemoryReservationsRepository;
let restaurantsRepo: InMemoryRestaurantsRepository;
let emailService: EmailService;
let sut: CreateReservationUseCase;
let restaurantId: string;

describe("Create Reservation Use Case", () => {
  beforeEach(async () => {
    reservationsRepo = new InMemoryReservationsRepository();
    restaurantsRepo = new InMemoryRestaurantsRepository();
    emailService = new EmailService();
    sut = new CreateReservationUseCase(
      reservationsRepo,
      restaurantsRepo,
      emailService,
    );

    const restaurant = await restaurantsRepo.create({
      name: "Restaurant Zé",
      logo: null,
      primaryColor: null,
      settings: {
        slots: [
          { from: "18:00", to: "20:00", maxReservations: 10 },
          { from: "20:00", to: "22:00", maxReservations: 10 },
        ],
      },
    } as any);

    restaurantId = restaurant.id;
  });

  it("creates a reservation", async () => {
    const { reservation } = await sut.execute({
      restaurantId,
      date: "2099-11-10T18:00:00Z",
      time: "18:00",
      customerName: "Jane Doe",
      customerEmail: "jane@example.com",
      groupSize: 2,
    });

    expect(reservation.id).toEqual(expect.any(String));
  });

  it("prevents overbooking", async () => {
    await sut.execute({
      restaurantId,
      date: "2099-11-10T18:00:00Z",
      time: "18:00",
      customerName: "John",
      customerEmail: "john@example.com",
      groupSize: 8,
    });

    await expect(() =>
      sut.execute({
        restaurantId,
        date: "2099-11-10T18:00:00Z",
        time: "18:00",
        customerName: "Alice",
        customerEmail: "alice@example.com",
        groupSize: 5,
      }),
    ).rejects.toBeInstanceOf(ReservationConflictError);
  });

  it("sends confirmation email when email service is provided", async () => {
    const sendSpy = vi
      .spyOn(emailService, "sendReservationConfirmation")
      .mockResolvedValue(undefined);

    await sut.execute({
      restaurantId,
      date: "2099-11-10T18:00:00Z",
      time: "18:00",
      customerName: "Jane Doe",
      customerEmail: "jane@example.com",
      groupSize: 2,
    });

    expect(sendSpy).toHaveBeenCalled();
  });

  it("handles email sending errors", async () => {
    const sendSpy = vi
      .spyOn(emailService, "sendReservationConfirmation")
      .mockRejectedValue(new Error("Email failed"));

    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    await sut.execute({
      restaurantId,
      date: "2099-11-10T18:00:00Z",
      time: "18:00",
      customerName: "Jane Doe",
      customerEmail: "jane@example.com",
      groupSize: 2,
    });

    expect(sendSpy).toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Failed to send confirmation email:",
      expect.any(Error),
    );

    consoleErrorSpy.mockRestore();
  });
});
