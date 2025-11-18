"use client";

import OwnerDashboard from "./owner-dashboard";

export default function OwnerDashboardPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-2xl font-semibold tracking-tight">
          Owner dashboard
        </h1>
        <OwnerDashboard />
      </div>
    </main>
  );
}
