export class InvalidReservationTimeError extends Error {
  constructor() {
    super("The reservation time is outside of the restaurant's available slots.");
  }
}