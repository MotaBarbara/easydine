"use client";

import { useRouter, useParams } from "next/navigation";
import { getToken } from "@/lib/auth";
import OwnerDashboard from "../components/owner-dashboard";

export default function RestaurantDashboardPage() {
  const router = useRouter();
  const params = useParams();
  const restaurantId = params.restaurantId as string;

  if (!restaurantId) {
    router.replace("/owner");
    return null;
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <OwnerDashboard restaurantId={restaurantId} />
      </div>
    </main>
  );
}

