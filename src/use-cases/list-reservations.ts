import type { ReservationsRepository } from "@/repositories/reservations-repository";

export interface ListReservationsUseCaseRequest {
  restaurantId: string;
  date?: Date;
}

interface ListReservationsUseCaseResponse {
  reservations: {
    id: string;
    restaurantId: string;
    date: Date;
    time: string;
    customerName: string;
    customerEmail: string;
    groupSize: number;
    status: string;
  }[];
}

export class ListReservationsUseCase {
  constructor(private reservationsRepository: ReservationsRepository) {}

  async execute(
    request: ListReservationsUseCaseRequest,
  ): Promise<ListReservationsUseCaseResponse> {
    const reservations =
      await this.reservationsRepository.listByRestaurantAndDate(
        request.restaurantId,
        request.date,
      );

    return { reservations };
  }
}
