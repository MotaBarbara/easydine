"use client";

import type { Reservation } from "../../hooks/useDashboardData";

type Props = {
  reservations: Reservation[];
  totalToday: number;
  totalTomorrow: number;
};

export default function ReservationsSummary({
  totalToday,
  totalTomorrow,
}: Props) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <p className="text-xs text-slate-500">Reservations today</p>
        <p className="text-xl font-semibold">{totalToday}</p>
      </div>

      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <p className="text-xs text-slate-500">Reservations tomorrow</p>
        <p className="text-xl font-semibold">{totalTomorrow}</p>
      </div>
    </div>
  );
}
