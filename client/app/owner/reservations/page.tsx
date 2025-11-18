"use client";
import React from "react";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { utcToZonedTime } from "date-fns-tz";
import { Calendar, Clock, Users, Mail, XCircle } from "lucide-react";
import { getToken } from "../../../lib/auth";

const ptBR = require("date-fns/locale/pt-BR");

type Reservation = {
  id: string;
  date: string;
  time: string;
  customerName: string;
  customerEmail: string;
  groupSize: number;
  status: "confirmed" | "cancelled";
};

export default function OwnerReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "confirmed" | "cancelled"
  >("all");
  const token = getToken();

  console.log("Toker" + token);
  const loadReservations = async () => {
    const restaurantId = "6a284be1-fafe-4e83-be29-2c77148a1a5a";

    if (!token) {
      alert("Please log in again");
      return;
    }

    const params = new URLSearchParams();
    if (filterDate) params.set("date", filterDate);
    if (filterStatus !== "all") params.set("status", filterStatus);

    const res = await fetch(
      `http://localhost:3333/restaurants/${restaurantId}/reservations?${params}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!res.ok) {
      const text = await res.text();
      console.error("Failed:", res.status, text);
      return;
    }

    const data = await res.json();
    console.log("RESERVATIONS FROM BACKEND:", data);
    setReservations(data.reservations || []);
    setLoading(false);
  };

  const cancelReservation = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this reservation?")) return;

    if (!token) {
      alert("No token found");
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:3333/reservations/${id}/cancel`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (res.ok) {
        loadReservations();
      } else {
        const error = await res.json();
        alert(error.message || "Failed to cancel reservation");
      }
    } catch (err) {
      alert("Network error");
    }
  };

  useEffect(() => {
    loadReservations();
  }, [filterDate, filterStatus]);

  const formatDate = (dateStr: string) => {
    const date = utcToZonedTime(dateStr, "America/Sao_Paulo");
    return format(date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR });
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-12 space-y-8">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            Manage Reservations
          </h1>
          <p className="text-sm text-slate-600">
            View and cancel reservations for your restaurant
          </p>
        </header>

        <section className="rounded-xl bg-white p-6 shadow-sm border border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-xs font-medium uppercase text-slate-500 mb-1">
                Filter by date
              </p>
              <input
                type="date"
                value={filterDate}
                onChange={e => setFilterDate(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </div>

            <div>
              <p className="text-xs font-medium uppercase text-slate-500 mb-1">
                Status
              </p>
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value as any)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="all">All reservations</option>
                <option value="confirmed">Confirmed only</option>
                <option value="cancelled">Cancelled only</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setFilterDate("");
                  setFilterStatus("all");
                }}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200 transition"
              >
                Clear filters
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-xl bg-white shadow-sm border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-500">
              Loading reservations...
            </div>
          ) : reservations.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              No reservations found
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {reservations.map(r => (
                <div key={r.id} className="p-6 hover:bg-slate-50 transition">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="space-y-1">
                      <p className="text-xs font-medium uppercase text-slate-500">
                        Date
                      </p>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <p className="text-sm text-slate-900">
                          {formatDate(r.date)}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs font-medium uppercase text-slate-500">
                        Time
                      </p>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <p className="text-sm text-slate-900">{r.time}</p>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs font-medium uppercase text-slate-500">
                        Customer
                      </p>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-slate-900">
                          {r.customerName}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Mail className="w-3.5 h-3.5" />
                          {r.customerEmail}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-xs font-medium uppercase text-slate-500">
                          Guests
                        </p>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-slate-400" />
                          <span className="text-sm text-slate-900">
                            {r.groupSize}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            r.status === "confirmed"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {r.status === "confirmed" ? "Confirmed" : "Cancelled"}
                        </span>

                        {r.status === "confirmed" && (
                          <button
                            onClick={() => cancelReservation(r.id)}
                            className="flex items-center gap-1.5 text-sm font-medium text-red-600 hover:text-red-800 transition"
                          >
                            <XCircle className="w-4 h-4" />
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
