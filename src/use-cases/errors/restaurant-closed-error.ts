export class RestaurantClosed extends Error {
  constructor() {
    super("The restaurant is closed at this date and time.");
  }
}
