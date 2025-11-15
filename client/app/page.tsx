import Link from "next/link";
import { apiFetch } from "@/lib/api";
import type { Restaurant } from "@/types/restaurant";

async function getRestaurants() {
  const data = await apiFetch<{ restaurants: Restaurant[] }>("/restaurants");
  return data.restaurants;
}

export default async function HomePage() {
  const restaurants = await getRestaurants();

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">EasyDine</h1>
          <p className="mt-2 text-slate-600">
            Pick a restaurant and book your table in a few clicks.
          </p>
        </header>

        {restaurants.length === 0 ? (
          <p className="text-slate-500">No restaurants available yet.</p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">
            {restaurants.map(r => (
              <li key={r.id}>
                <Link
                  href={`/restaurants/${r.id}`}
                  className="block rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3">
                    {r.logo && (
                      <div className="h-10 w-10 overflow-hidden rounded-full bg-slate-100">
                        {/* you can swap for next/image later */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={r.logo}
                          alt={r.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                    <div>
                      <h2 className="text-lg font-medium">{r.name}</h2>
                      <p className="text-sm text-slate-500">
                        Tap to view times & book
                      </p>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
