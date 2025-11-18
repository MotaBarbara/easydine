"use client";

import { useEffect, useState } from "react";
import { getToken, getRestaurantIdFromToken } from "@/lib/auth";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3333";

export type Restaurant = {
  id: string;
  name: string;
  logo?: string;
  primaryColor?: string;
};

export type Reservation = {
  id: string;
  slot: string;
  date: string;
  customerName: string;
  groupSize: number;
};

export function useDashboardData() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);

  useEffect(() => {
    async function load() {
      const token = getToken();
      const restaurantId = getRestaurantIdFromToken();
      if (!token || !restaurantId) return;

      try {
        const [restaurantRes, reservationsRes] = await Promise.all([
          fetch(`${API_BASE}/restaurants/${restaurantId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE}/restaurants/${restaurantId}/reservations`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const restaurantData = await restaurantRes.json().catch(() => null);
        const reservationsData = await reservationsRes.json().catch(() => null);

        if (!restaurantRes.ok)
          throw new Error(
            restaurantData?.message ?? "Failed to load restaurant",
          );
        if (!reservationsRes.ok)
          throw new Error(
            reservationsData?.message ?? "Failed to load reservations",
          );

        const normalizedReservations: Reservation[] = Array.isArray(
          reservationsData,
        )
          ? reservationsData
          : reservationsData?.reservations ?? [];

        setRestaurant(restaurantData);
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
  }, []);

  return { loading, error, restaurant, reservations };
}
