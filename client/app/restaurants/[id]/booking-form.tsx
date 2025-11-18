"use client";

import { useState } from "react";
import React from "react";
import { useRouter } from "next/navigation";

type BookingFormProps = {
  restaurantId: string;
  restaurantName: string;
};

type Status =
  | { state: "idle" }
  | { state: "submitting" }
  | { state: "error"; message: string };

export default function BookingForm({
  restaurantId,
  restaurantName,
}: BookingFormProps) {
  const router = useRouter();

  const [date, setDate] = useState("");
  const [time, setTime] = useState("19:00");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [groupSize, setGroupSize] = useState(2);
  const [status, setStatus] = useState<Status>({ state: "idle" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus({ state: "submitting" });

    try {
      const apiBase =
        process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3333";

      const isoDate = `${date}T12:00:00.000Z`;

      console.log("Sending date:", isoDate);

      const res = await fetch(`${apiBase}/reservations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          restaurantId,
          date: isoDate,
          time,
          customerName: name,
          customerEmail: email,
          groupSize,
        }),
      });

      const body = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(body?.message ?? "Failed to create reservation");
      }

      const reservation = body?.reservation ?? body ?? {};

      const reservationId: string =
        reservation.id ?? reservation.reservationId ?? "";

      const params = new URLSearchParams({
        reservationId,
        restaurantName,
        date: reservation.date ?? isoDate,
        time: reservation.time ?? time,
        guests: String(reservation.groupSize ?? groupSize),
        customerName: name,
      });

      router.push(`/reservations/confirmed?${params.toString()}`);
      setName("");
      setEmail("");
      setGroupSize(2);
      setDate("");
      setTime("19:00");
      setStatus({ state: "idle" });
    } catch (err) {
      console.error(err);
      setStatus({
        state: "error",
        message:
          err instanceof Error
            ? err.message
            : "Something went wrong. Please try again.",
      });
    }
  }

  const isSubmitting = status.state === "submitting";

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-xl bg-white p-4 shadow-sm border border-slate-200"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span className="block font-medium">Date</span>
          <input
            type="date"
            className="w-full rounded-md border border-slate-300 px-2 py-1 text-sm"
            value={date}
            onChange={e => setDate(e.target.value)}
            required
          />
        </label>

        <label className="space-y-1 text-sm">
          <span className="block font-medium">Time</span>
          <input
            type="time"
            className="w-full rounded-md border border-slate-300 px-2 py-1 text-sm"
            value={time}
            onChange={e => setTime(e.target.value)}
            required
          />
        </label>
      </div>

      <label className="space-y-1 text-sm block">
        <span className="block font-medium">Name</span>
        <input
          type="text"
          className="w-full rounded-md border border-slate-300 px-2 py-1 text-sm"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
      </label>

      <label className="space-y-1 text-sm block">
        <span className="block font-medium">Email</span>
        <input
          type="email"
          className="w-full rounded-md border border-slate-300 px-2 py-1 text-sm"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
      </label>

      <label className="space-y-1 text-sm block max-w-[200px]">
        <span className="block font-medium">Guests</span>
        <input
          type="number"
          min={1}
          className="w-full rounded-md border border-slate-300 px-2 py-1 text-sm"
          value={groupSize}
          onChange={e => setGroupSize(Number(e.target.value))}
          required
        />
      </label>

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex items-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {isSubmitting ? "Booking..." : "Confirm reservation"}
      </button>

      {status.state === "error" && (
        <p className="text-sm text-red-600">{status.message}</p>
      )}
    </form>
  );
}
