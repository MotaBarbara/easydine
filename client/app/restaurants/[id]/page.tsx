import { apiFetch } from "@/lib/api";
import BookingForm from "./booking-form";

type Restaurant = {
  id: string;
  name: string;
  logo: string | null;
  primaryColor: string | null;
  settings: unknown | null;
};

async function getRestaurant(id: string) {
  const data = await apiFetch<{ restaurant: Restaurant }>(`/restaurants/${id}`);
  return data.restaurant;
}

type Props = {
  params: Promise<{ id: string }>;
};

export default async function RestaurantPage({ params }: Props) {
  const { id } = await params;

  let restaurant: Restaurant | null = null;
  let error: string | null = null;

  try {
    restaurant = await getRestaurant(id);
  } catch (e) {
    console.error("Failed to load restaurant", e);
    error = "We couldn't load this restaurant. Please try again.";
  }

  if (error) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-xl px-4 py-8">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      </main>
    );
  }

  if (!restaurant) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-xl px-4 py-8">
          <p className="text-sm text-slate-600">Restaurant not found.</p>
        </div>
      </main>
    );
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
