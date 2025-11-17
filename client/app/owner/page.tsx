"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getToken, getRestaurantIdFromToken } from "@/lib/auth";

export default function OwnerDashboardPage() {
  const router = useRouter();

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    const restaurantId = getRestaurantIdFromToken();
    if (!restaurantId) {
      router.replace("/owner/restaurant/new");
      return;
    }
  }, [router]);

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-2xl font-semibold tracking-tight">
          Owner dashboard
        </h1>
        <p className="text-sm text-slate-600">Loading your restaurant…</p>
      </div>
    </main>
  );
}
