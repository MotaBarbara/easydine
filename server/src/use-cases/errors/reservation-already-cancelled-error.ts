export class ReservationAlreadyCancelledError extends Error {
  constructor() {
    super("Reservation is already cancelled.");
  }
}
