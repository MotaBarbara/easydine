import type { RestaurantsRepository } from "@/repositories/restaurants-repository";

interface ListRestaurantsUseCaseResponse {
  restaurants: {
    id: string;
    name: string;
    logo: string | null;
    primaryColor: string | null;
  }[];
}

export class ListRestaurantsUseCase {
  constructor(private restaurantsRepo: RestaurantsRepository) {}

  async execute(): Promise<ListRestaurantsUseCaseResponse> {
    const restaurants = await this.restaurantsRepo.listAll();

    return {
      restaurants: restaurants.map(r => ({
        id: r.id,
        name: r.name,
        logo: r.logo,
        primaryColor: r.primaryColor,
      })),
    };
  }
}
