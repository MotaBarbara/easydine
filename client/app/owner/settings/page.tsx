"use client";

import { useRouter } from "next/navigation";
import { getToken, getRestaurantIdFromToken, getRestaurantIdFromAPI } from "@/lib/auth";
import RestaurantSettingsForm from "./restaurant-settings-form";
import { useEffect, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3333";

type RestaurantSettings = {
  slots?: Array<{
    from: string;
    to: string;
    maxReservations: number;
  }>;
  closedWeekly?: Array<{
    weekday: number;
    from?: string;
    to?: string;
  }>;
  closedDates?: Array<{
    date: string;
    from?: string;
    to?: string;
  }>;
};

type Restaurant = {
  id: string;
  name: string;
  logo: string | null;
  primaryColor: string | null;
  settings: RestaurantSettings | null;
};

export default function RestaurantSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);

  useEffect(() => {
    async function loadRestaurant() {
      const token = getToken();
      if (!token) {
        router.replace("/login");
        return;
      }

      let restaurantId = getRestaurantIdFromToken();
      
      if (!restaurantId) {
        restaurantId = await getRestaurantIdFromAPI();
        
        if (!restaurantId) {
          router.replace("/owner/restaurant/new");
          return;
        }
      }

      try {
        const res = await fetch(`${API_BASE}/restaurants/${restaurantId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(body?.message ?? "Failed to load restaurant");
        }

        const data = await res.json();
        setRestaurant(data.restaurant);
      } catch (err) {
        console.error(err);
        setError(
          err instanceof Error ? err.message : "Failed to load restaurant",
        );
      } finally {
        setLoading(false);
      }
    }

    loadRestaurant();
  }, [router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-3xl px-4 py-12">
          <p className="text-sm text-slate-600">Loading restaurant settings…</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-3xl px-4 py-12">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      </main>
    );
  }

  if (!restaurant) {
    return null;
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">
            Restaurant Settings
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Manage your restaurant details, opening hours, and availability
            rules.
          </p>
        </div>

        <RestaurantSettingsForm restaurant={restaurant} />
      </div>
    </main>
  );
}

