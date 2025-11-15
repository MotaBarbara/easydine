export class ReservationPastDate extends Error {
  constructor() {
    super("Cannot create reservations in the past.");
  }
}
