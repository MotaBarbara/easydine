import type { RestaurantsRepository } from "@/repositories/restaurants-repository";
import {
  restaurantSettingsSchema,
  type RestaurantSettings,
} from "@/types/restaurant-settings";
import { RestaurantNotFound } from "./errors/restaurant-not-found-error";

interface UpdateRestaurantUseCaseRequest {
  restaurantId: string;
  name?: string;
  logo?: string | null;
  primaryColor?: string | null;
  settings?: RestaurantSettings | null;
}

export class UpdateRestaurantUseCase {
  constructor(private restaurantsRepo: RestaurantsRepository) {}

  async execute({
    restaurantId,
    name,
    logo,
    primaryColor,
    settings,
  }: UpdateRestaurantUseCaseRequest) {
    const restaurant = await this.restaurantsRepo.findById(restaurantId);
    if (!restaurant) throw new RestaurantNotFound();

    let validatedSettings: RestaurantSettings | null | undefined = settings;

    if (settings !== undefined && settings !== null) {
      validatedSettings = restaurantSettingsSchema.parse(settings);
    }

    const updateData: {
      name?: string;
      logo?: string | null;
      primaryColor?: string | null;
      settings?: unknown | null;
    } = {};

    if (name !== undefined) {
      updateData.name = name;
    }

    if (logo !== undefined) {
      updateData.logo = logo;
    }

    if (primaryColor !== undefined) {
      updateData.primaryColor = primaryColor;
    }

    if (validatedSettings !== undefined) {
      updateData.settings = validatedSettings;
    }

    const updated = await this.restaurantsRepo.updateById(restaurantId, updateData);

    return { restaurant: updated };
  }
}
