"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { getToken } from "@/lib/auth";

type Status =
  | { state: "idle" }
  | { state: "submitting" }
  | { state: "error"; message: string };

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3333";

type Slot = {
  from: string;

  to: string;

  maxReservations: number;
};

type ClosedWeekly = {
  weekday: number;

  from?: string;

  to?: string;
};

type ClosedDate = {
  date: string;

  from?: string;

  to?: string;
};

const WEEKDAYS: { value: number; label: string }[] = [
  { value: 0, label: "Sunday" },

  { value: 1, label: "Monday" },

  { value: 2, label: "Tuesday" },

  { value: 3, label: "Wednesday" },

  { value: 4, label: "Thursday" },

  { value: 5, label: "Friday" },

  { value: 6, label: "Saturday" },
];

export default function CreateRestaurantForm() {
  const router = useRouter();

  const [status, setStatus] = useState<Status>({ state: "idle" });

  const [name, setName] = useState("");

  const [logoUrl, setLogoUrl] = useState("");

  const [primaryColor, setPrimaryColor] = useState("#000000");

  const [slots, setSlots] = useState<Slot[]>([
    { from: "18:00", to: "20:00", maxReservations: 10 },
  ]);

  const [closedWeekly, setClosedWeekly] = useState<ClosedWeekly[]>([]);

  const [closedDates, setClosedDates] = useState<ClosedDate[]>([]);

  const isSubmitting = status.state === "submitting";

  function updateSlot(index: number, patch: Partial<Slot>) {
    setSlots(prev =>
      prev.map((slot, i) => (i === index ? { ...slot, ...patch } : slot)),
    );
  }

  function removeSlot(index: number) {
    setSlots(prev => prev.filter((_, i) => i !== index));
  }

  function addSlot() {
    setSlots(prev => [
      ...prev,

      { from: "20:00", to: "22:00", maxReservations: 10 },
    ]);
  }

  function updateClosedWeekly(index: number, patch: Partial<ClosedWeekly>) {
    setClosedWeekly(prev =>
      prev.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    );
  }

  function removeClosedWeekly(index: number) {
    setClosedWeekly(prev => prev.filter((_, i) => i !== index));
  }

  function addClosedWeekly() {
    setClosedWeekly(prev => [
      ...prev,

      { weekday: 1, from: "00:00", to: "23:59" },
    ]);
  }

  function updateClosedDate(index: number, patch: Partial<ClosedDate>) {
    setClosedDates(prev =>
      prev.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    );
  }

  function removeClosedDate(index: number) {
    setClosedDates(prev => prev.filter((_, i) => i !== index));
  }

  function addClosedDate() {
    setClosedDates(prev => [...prev, { date: "", from: "00:00", to: "23:59" }]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const token = getToken();

    if (!token) {
      setStatus({
        state: "error",

        message: "You must be logged in to create a restaurant.",
      });

      return;
    }

    setStatus({ state: "submitting" });

    try {
      const settings: {
        slots?: Slot[];

        closedWeekly?: ClosedWeekly[];

        closedDates?: ClosedDate[];
      } = {};

      const cleanedSlots = slots.filter(
        s => s.from && s.to && s.maxReservations > 0,
      );

      if (cleanedSlots.length > 0) {
        settings.slots = cleanedSlots;
      }

      const cleanedClosedWeekly = closedWeekly.filter(
        c => c.weekday !== undefined && c.weekday !== null,
      );

      if (cleanedClosedWeekly.length > 0) {
        settings.closedWeekly = cleanedClosedWeekly;
      }

      const cleanedClosedDates = closedDates.filter(c => c.date);

      if (cleanedClosedDates.length > 0) {
        settings.closedDates = cleanedClosedDates;
      }

      const res = await fetch(`${API_BASE}/restaurants`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",

          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          name,

          logo: logoUrl || undefined,

          primaryColor: primaryColor || undefined,

          settings,
        }),
      });

      const body = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(body?.message ?? "Failed to create restaurant");
      }

      if (body?.restaurant?.id) {
        router.push(`/owner/${body.restaurant.id}`);
      } else {
        router.push("/owner");
      }
    } catch (err) {
      console.error(err);

      setStatus({
        state: "error",

        message:
          err instanceof Error
            ? err.message
            : "Something went wrong while creating the restaurant.",
      });
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-xl bg-white p-4 shadow-sm border border-slate-200"
    >
      <div className="space-y-4">
        <h2 className="text-sm font-semibold tracking-tight text-slate-900">
          Restaurant details
        </h2>

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
          <span className="block font-medium">Logo URL</span>

          <input
            type="url"
            className="w-full rounded-md border border-slate-300 px-2 py-1 text-sm"
            placeholder="https://example.com/logo.png"
            value={logoUrl}
            onChange={e => setLogoUrl(e.target.value)}
          />
        </label>

        <label className="space-y-1 text-sm block">
          <span className="block font-medium">Primary color</span>

          <div className="flex items-center gap-2">
            <input
              type="color"
              className="h-8 w-10 rounded border border-slate-300"
              value={primaryColor}
              onChange={e => setPrimaryColor(e.target.value)}
            />

            <input
              type="text"
              className="flex-1 rounded-md border border-slate-300 px-2 py-1 text-sm font-mono"
              value={primaryColor}
              onChange={e => setPrimaryColor(e.target.value)}
            />
          </div>
        </label>
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold tracking-tight text-slate-900 mb-1">
          Booking slots
        </h2>

        <p className="text-xs text-slate-500">
          Define the time slots you want to accept reservations for, and how
          many reservations are allowed per slot.
        </p>

        <div className="space-y-3">
          {slots.map((slot, index) => (
            <div key={index} className="grid gap-4 sm:grid-cols-3">
              <label className="space-y-1 text-sm block">
                <span className="block font-medium">From</span>

                <input
                  type="time"
                  className="w-full rounded-md border border-slate-300 px-2 py-1 text-sm"
                  value={slot.from}
                  onChange={e => updateSlot(index, { from: e.target.value })}
                  required
                />
              </label>

              <label className="space-y-1 text-sm block">
                <span className="block font-medium">To</span>

                <input
                  type="time"
                  className="w-full rounded-md border border-slate-300 px-2 py-1 text-sm"
                  value={slot.to}
                  onChange={e => updateSlot(index, { to: e.target.value })}
                  required
                />
              </label>

              <label className="space-y-1 text-sm block">
                <span className="block font-medium">Max reservations</span>

                <input
                  type="number"
                  min={1}
                  className="w-full rounded-md border border-slate-300 px-2 py-1 text-sm"
                  value={slot.maxReservations}
                  onChange={e =>
                    updateSlot(index, {
                      maxReservations: Number(e.target.value),
                    })
                  }
                  required
                />
              </label>

              <button
                type="button"
                onClick={() => removeSlot(index)}
                className="text-xs text-slate-500 hover:text-red-600 text-left
"
                disabled={slots.length === 1}
              >
                Remove slot
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addSlot}
          className="text-xs font-medium text-slate-900 underline underline-offset-2"
        >
          + Add another slot
        </button>
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold tracking-tight text-slate-900 mb-1">
          Weekly closed periods
        </h2>

        <p className="text-xs text-slate-500">
          Add recurring times when you&apos;re closed every week (e.g. closed
          all day Monday, or closed Monday lunch).
        </p>

        <div className="space-y-3">
          {closedWeekly.map((item, index) => (
            <div key={index} className="grid gap-4 sm:grid-cols-3">
              <label className="space-y-1 text-sm block">
                <span className="block font-medium">Weekday</span>

                <select
                  className="w-full rounded-md border border-slate-300 px-2 py-1 text-sm"
                  value={item.weekday}
                  onChange={e =>
                    updateClosedWeekly(index, {
                      weekday: Number(e.target.value),
                    })
                  }
                >
                  {WEEKDAYS.map(day => (
                    <option key={day.value} value={day.value}>
                      {day.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-1 text-sm block">
                <span className="block font-medium">From (optional)</span>

                <input
                  type="time"
                  className="w-full rounded-md border border-slate-300 px-2 py-1 text-sm"
                  value={item.from ?? ""}
                  onChange={e =>
                    updateClosedWeekly(index, {
                      from: e.target.value || undefined,
                    })
                  }
                />
              </label>

              <label className="space-y-1 text-sm block">
                <span className="block font-medium">To (optional)</span>

                <input
                  type="time"
                  className="w-full rounded-md border border-slate-300 px-2 py-1 text-sm"
                  value={item.to ?? ""}
                  onChange={e =>
                    updateClosedWeekly(index, {
                      to: e.target.value || undefined,
                    })
                  }
                />
              </label>

              <button
                type="button"
                onClick={() => removeClosedWeekly(index)}
                className="text-xs text-slate-500 hover:text-red-600 text-left
"
              >
                Remove date
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addClosedWeekly}
          className="text-xs font-medium text-slate-900 underline underline-offset-2"
        >
          + Add weekly closed period
        </button>
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold tracking-tight text-slate-900 mb-1">
          Special closed dates
        </h2>

        <p className="text-xs text-slate-500">
          Add specific dates you&apos;re closed (e.g. Christmas, private
          events). Leave times empty to close the whole day.
        </p>

        <div className="space-y-3">
          {closedDates.map((item, index) => (
            <div key={index} className="grid gap-4 sm:grid-cols-3">
              <label className="space-y-1 text-sm block">
                <span className="block font-medium">Date</span>

                <input
                  type="date"
                  className="w-full rounded-md border border-slate-300 px-2 py-1 text-sm"
                  value={item.date}
                  onChange={e =>
                    updateClosedDate(index, { date: e.target.value })
                  }
                  required
                />
              </label>

              <label className="space-y-1 text-sm block">
                <span className="block font-medium">From (optional)</span>

                <input
                  type="time"
                  className="w-full rounded-md border border-slate-300 px-2 py-1 text-sm"
                  value={item.from ?? ""}
                  onChange={e =>
                    updateClosedDate(index, {
                      from: e.target.value || undefined,
                    })
                  }
                />
              </label>

              <label className="space-y-1 text-sm block">
                <span className="block font-medium">To (optional)</span>

                <input
                  type="time"
                  className="w-full rounded-md border border-slate-300 px-2 py-1 text-sm"
                  value={item.to ?? ""}
                  onChange={e =>
                    updateClosedDate(index, {
                      to: e.target.value || undefined,
                    })
                  }
                />
              </label>

              <button
                type="button"
                onClick={() => removeClosedDate(index)}
                className="text-xs text-slate-500 hover:text-red-600 text-left
"
              >
                Remove date
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addClosedDate}
          className="text-xs font-medium text-slate-900 underline underline-offset-2"
        >
          + Add special closed date
        </button>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex items-center justify-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-60 w-full"
      >
        {isSubmitting ? "Creating restaurant..." : "Create restaurant"}
      </button>

      {status.state === "error" && (
        <p className="text-sm text-red-600">{status.message}</p>
      )}
    </form>
  );
}
