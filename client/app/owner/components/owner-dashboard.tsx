"use client";

import { useRouter } from "next/navigation";
import { getToken, getRestaurantIdFromToken, getRestaurantIdFromAPI } from "@/lib/auth";
import { useDashboardData } from "../hooks/useDashboardData";
import ReservationsSummary from "./reservations-summary";
import ReservationsList from "./reservations-list";
import { useEffect, useState } from "react";

export default function OwnerDashboard() {
  const router = useRouter();
  const { loading, error, restaurant, reservations } = useDashboardData();

  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      const token = getToken();
      if (!token) {
        router.replace("/login");
        return;
      }

      let restaurantId = getRestaurantIdFromToken();
      
      // If restaurantId is not in token, try to fetch it from API
      if (!restaurantId) {
        restaurantId = await getRestaurantIdFromAPI();
        
        if (!restaurantId) {
          router.replace("/owner/restaurant/new");
          return;
        }
      }

      setIsReady(true);
    }

    checkAuth();
  }, [router]);

  if (!isReady) return null;

  if (loading)
    return (
      <p className="text-sm text-slate-600 mt-4">Loading your restaurant…</p>
    );
  if (error) return <p className="text-sm text-red-600 mt-4">{error}</p>;
  if (!restaurant) return null;

  const getUtcDateString = (dateString: string) => {
    const d = new Date(dateString);
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(
      2,
      "0",
    )}-${String(d.getUTCDate()).padStart(2, "0")}`;
  };

  const todayUtc = new Date();
  todayUtc.setUTCHours(0, 0, 0, 0);
  const todayStr = todayUtc.toISOString().slice(0, 10);

  const tomorrowUtc = new Date(todayUtc);
  tomorrowUtc.setUTCDate(tomorrowUtc.getUTCDate() + 1);
  const tomorrowStr = tomorrowUtc.toISOString().slice(0, 10);

  const reservationsToday = reservations.filter(
    r => getUtcDateString(r.date) === todayStr,
  );
  const reservationsTomorrow = reservations.filter(
    r => getUtcDateString(r.date) === tomorrowStr,
  );

  console.log("All reservations:", reservations);
  console.log("Today string we are looking for:", todayStr);
  console.log("Tomorrow string:", tomorrowStr);
  console.log(
    "First reservation date →",
    reservations[0]?.date,
    "→ becomes",
    getUtcDateString(reservations[0]?.date),
  );

  const upcomingCount = reservations.length;

  return (
    <div className="mt-8 space-y-8 max-w-200 m-auto">
      <ReservationsSummary
        reservations={reservations}
        totalToday={reservationsToday.length}
        totalTomorrow={reservationsTomorrow.length}
      />

      <section className="space-y-4">
        <h2 className="text-sm font-semibold tracking-tight text-slate-900">
          Next upcoming reservations ({upcomingCount})
        </h2>
        <ReservationsList reservations={reservations} />
      </section>

      <div className="flex gap-4">
        <a
          href="/owner/reservations"
          className="text-sm font-medium underline underline-offset-2"
        >
          Manage reservations
        </a>

        <a
          href="/owner/settings"
          className="text-sm font-medium underline underline-offset-2"
        >
          Edit opening hours & capacity
        </a>
      </div>
    </div>
  );
}
