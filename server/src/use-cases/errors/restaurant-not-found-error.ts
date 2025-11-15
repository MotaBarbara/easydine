export class RestaurantNotFound extends Error {
  constructor() {
    super("The restaurant you search for cannot be found.");
  }
}
