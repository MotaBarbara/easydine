import type { RestaurantsRepository } from "@/repositories/restaurants-repository";
import type { RestaurantSettings } from "@/types/restaurant-settings";
import { RestaurantNotFound } from "./errors/restaurant-not-found-error";

interface GetRestaurantUseCaseRequest {
  restaurantId: string;
}

interface GetRestaurantUseCaseResponse {
  restaurant: {
    id: string;
    name: string;
    logo: string | null;
    primaryColor: string | null;
    settings: RestaurantSettings | null;
  };
}

export class GetRestaurantUseCase {
  constructor(private restaurantsRepo: RestaurantsRepository) {}

  async execute({
    restaurantId,
  }: GetRestaurantUseCaseRequest): Promise<GetRestaurantUseCaseResponse> {
    const restaurant = await this.restaurantsRepo.findById(restaurantId);
    if (!restaurant) throw new RestaurantNotFound();

    return {
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
        logo: restaurant.logo,
        primaryColor: restaurant.primaryColor,
        settings: (restaurant.settings ?? null) as RestaurantSettings | null,
      },
    };
  }
}
