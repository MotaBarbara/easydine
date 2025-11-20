import { notFound } from "next/navigation";
import { getRestaurant } from "@/lib/api/restaurants";
import type { Restaurant } from "../../../types/restaurant";
import BookingForm from "./booking-form";

type RestaurantDetail = Restaurant & {
  settings?: unknown;
};

async function fetchRestaurant(id: string) {
  const data = await getRestaurant(id);
  return data.restaurant as RestaurantDetail;
}

type Props = {
  params: Promise<{ id: string }>;
};

export default async function RestaurantPage(props: Props) {
  const { id } = await props.params;

  const restaurant = await fetchRestaurant(id).catch(() => null);
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

        <BookingForm
          restaurantId={restaurant.id}
          restaurantName={restaurant.name}
        />
      </div>
    </main>
  );
}
