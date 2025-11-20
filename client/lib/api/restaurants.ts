import { apiClient } from "../api-client";

export interface Restaurant {
  id: string;
  name: string;
  logo?: string | null;
  primaryColor?: string | null;
  settings?: unknown;
}

export interface RestaurantResponse {
  restaurant: Restaurant;
}

export interface RestaurantsResponse {
  restaurants: Restaurant[];
}

export async function getRestaurant(
  restaurantId: string,
): Promise<RestaurantResponse> {
  return apiClient.get<RestaurantResponse>(`/restaurants/${restaurantId}`);
}

export async function getRestaurantReservations(
  restaurantId: string,
  date?: string,
): Promise<{ reservations: Reservation[] }> {
  const query = date ? `?date=${date}` : "";
  return apiClient.get<{ reservations: Reservation[] }>(
    `/restaurants/${restaurantId}/reservations${query}`,
  );
}

export async function getRestaurantAvailability(
  restaurantId: string,
  date: string,
): Promise<{ slots: Array<{ time: string; available: boolean }> }> {
  return apiClient.get<{ slots: Array<{ time: string; available: boolean }> }>(
    `/restaurants/${restaurantId}/availability?date=${date}`,
  );
}

export async function listRestaurants(): Promise<RestaurantsResponse> {
  return apiClient.get<RestaurantsResponse>("/restaurants");
}

export interface Reservation {
  id: string;
  slot: string;
  date: string;
  customerName: string;
  groupSize: number;
}

