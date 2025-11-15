export class ReservationConflictError extends Error {
  constructor() {
    super("Time slot not available.");
  }
}
