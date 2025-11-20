"use client";

import { useEffect, useState } from "react";
import {
  getRestaurant,
  getRestaurantReservations,
  type Restaurant,
  type Reservation,
} from "@/lib/api/restaurants";

export type { Restaurant, Reservation };

export function useDashboardData(restaurantId: string) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);

  useEffect(() => {
    async function load() {
      if (!restaurantId) return;

      try {
        const [restaurantRes, reservationsRes] = await Promise.all([
          getRestaurant(restaurantId),
          getRestaurantReservations(restaurantId),
        ]);

        const rawReservations = Array.isArray(reservationsRes.reservations)
          ? reservationsRes.reservations
          : [];

        const normalizedReservations: Reservation[] = rawReservations.map(
          (r: { id: string; time?: string; slot?: string; date: string; customerName: string; groupSize: number }) => ({
            id: r.id,
            slot: r.slot || r.time || "",
            date: r.date,
            customerName: r.customerName,
            groupSize: r.groupSize,
          }),
        );

        setRestaurant(restaurantRes.restaurant);
        setReservations(normalizedReservations);
      } catch (err) {
        console.error(err);
        setError(
          err instanceof Error ? err.message : "Failed to load dashboard",
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [restaurantId]);

  return { loading, error, restaurant, reservations };
}
