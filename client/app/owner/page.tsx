"use client";

import { useRouter } from "next/navigation";
import { getToken } from "@/lib/auth";
import { useEffect, useState } from "react";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3333";

type Restaurant = {
  id: string;
  name: string;
  logo: string | null;
  primaryColor: string | null;
};

export default function OwnerRestaurantsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);

  useEffect(() => {
    async function loadRestaurants() {
      const token = getToken();

      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/me/restaurants`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(body?.message ?? "Failed to load restaurants");
        }

        const data = await res.json();
        setRestaurants(data.restaurants || []);
      } catch (err) {
        console.error(err);
        setError(
          err instanceof Error ? err.message : "Failed to load restaurants",
        );
      } finally {
        setLoading(false);
      }
    }

    loadRestaurants();
  }, [router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-4xl px-4 py-12">
          <p className="text-sm text-slate-600">Loading your restaurants…</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-4xl px-4 py-12">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              My Restaurants
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Select a restaurant to view its dashboard and manage reservations
            </p>
          </div>
          <Link
            href="/owner/restaurant/new"
            className="inline-flex items-center justify-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            + New Restaurant
          </Link>
        </div>

        {restaurants.length === 0 ? (
          <div className="rounded-xl bg-white p-12 text-center shadow-sm border border-slate-200">
            <p className="text-sm text-slate-600 mb-4">
              You don&apos;t have any restaurants yet.
            </p>
            <Link
              href="/owner/restaurant/new"
              className="inline-flex items-center justify-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              Create your first restaurant
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {restaurants.map(restaurant => (
              <Link
                key={restaurant.id}
                href={`/owner/${restaurant.id}`}
                className="group rounded-xl bg-white p-6 shadow-sm border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all"
              >
                <div className="space-y-4">
                  {restaurant.logo && (
                    <div className="flex items-center justify-center h-16 w-16 rounded-lg overflow-hidden bg-slate-100">
                      <img
                        src={restaurant.logo}
                        alt={restaurant.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <h3 className="text-lg font-semibold text-slate-900 group-hover:text-slate-700">
                    {restaurant.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
