"use client";

import { useState } from "react";
import ReservationCard from "./reservation-card";
import { Reservation } from "../../hooks/useDashboardData";

type Props = {
  reservations: Reservation[];
  pageSize?: number;
};

export default function ReservationsList({
  reservations,
  pageSize = 5,
}: Props) {
  const [currentPage, setCurrentPage] = useState(0);
  const [search, setSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  // 🔍 Apply filters
  const filtered = reservations.filter(r => {
    const matchesName = r.customerName
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesDate = selectedDate ? r.date.startsWith(selectedDate) : true;
    return matchesName && matchesDate;
  });

  // 📄 Pagination after filters
  const totalPages = Math.ceil(filtered.length / pageSize);
  const startIndex = currentPage * pageSize;
  const endIndex = startIndex + pageSize;
  const paginated = filtered.slice(startIndex, endIndex);

  return (
    <div className="space-y-4">
      {/* FILTER BAR */}
      <div className="flex gap-3 items-center">
        <input
          type="text"
          placeholder="Search by name..."
          className="border rounded px-2 py-1 text-sm"
          value={search}
          onChange={e => {
            setCurrentPage(0);
            setSearch(e.target.value);
          }}
        />

        <input
          type="date"
          className="border rounded px-2 py-1 text-sm"
          value={selectedDate}
          onChange={e => {
            setCurrentPage(0);
            setSelectedDate(e.target.value);
          }}
        />
      </div>

      {/* LIST */}
      <div className="space-y-3">
        {paginated.length === 0 && (
          <p className="text-sm text-slate-500">No reservations found.</p>
        )}

        {paginated.map(r => (
          <ReservationCard key={r.id} reservation={r} />
        ))}
      </div>

      {/* PAGINATION */}
      {filtered.length > pageSize && (
        <div className="flex justify-between mt-4">
          <button
            className="px-4 py-2 rounded bg-slate-200 disabled:opacity-50"
            disabled={currentPage === 0}
            onClick={() => setCurrentPage(prev => prev - 1)}
          >
            Previous
          </button>

          <button
            className="px-4 py-2 rounded bg-slate-200 disabled:opacity-50"
            disabled={currentPage + 1 >= totalPages}
            onClick={() => setCurrentPage(prev => prev + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
