export class RestaurantAlreadyExistsError extends Error {
  constructor() {
    super("Restaurant with this id already exists.");
  }
}
