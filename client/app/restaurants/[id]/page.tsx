import { notFound } from "next/navigation";
import { apiFetch } from "../../../lib/api.ts";
import type { Restaurant } from "../../../types/restaurant.ts";
import BookingForm from "./booking-form.tsx";
import React from "react";

type RestaurantDetail = Restaurant & {
  settings?: unknown;
};

async function getRestaurant(id: string) {
  const data = await apiFetch<{ restaurant: RestaurantDetail }>(
    `/restaurants/${id}`,
  );
  return data.restaurant;
}

type Props = {
  params: { id: string };
};

export default async function RestaurantPage({ params }: Props) {
  const restaurant = await getRestaurant(params.id).catch(() => null);

  if (!restaurant) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-xl px-4 py-8 space-y-6">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            {restaurant.name}
          </h1>
          {restaurant.primaryColor && (
            <div
              className="h-1 w-16 rounded-full"
              style={{ backgroundColor: restaurant.primaryColor }}
            />
          )}
          <p className="text-sm text-slate-600">
            Choose a date, time and party size to book a table.
          </p>
        </header>

        <BookingForm restaurantId={restaurant.id} />
      </div>
    </main>
  );
}
