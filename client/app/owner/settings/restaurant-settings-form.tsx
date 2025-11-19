"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/auth";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3333";

const WEEKDAYS: { value: number; label: string }[] = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

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

type RestaurantSettings = {
  slots?: Slot[];
  closedWeekly?: ClosedWeekly[];
  closedDates?: ClosedDate[];
};

type Restaurant = {
  id: string;
  name: string;
  logo: string | null;
  primaryColor: string | null;
  settings: RestaurantSettings | null;
};

type Status =
  | { state: "idle" }
  | { state: "submitting" }
  | { state: "error"; message: string }
  | { state: "success" };

interface RestaurantSettingsFormProps {
  restaurant: Restaurant;
}

// Validation functions
function validateTimeFormat(time: string): boolean {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(time);
}

function validateDateFormat(date: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(date);
}

function validateSlot(slot: Slot): string | null {
  if (!validateTimeFormat(slot.from)) {
    return "From time must be in HH:MM format";
  }
  if (!validateTimeFormat(slot.to)) {
    return "To time must be in HH:MM format";
  }
  if (slot.from >= slot.to) {
    return "From time must be before To time";
  }
  if (slot.maxReservations < 1) {
    return "Max reservations must be at least 1";
  }
  return null;
}

function validateSlots(slots: Slot[]): string | null {
  for (const slot of slots) {
    const error = validateSlot(slot);
    if (error) return error;
  }

  // Check for overlaps
  const sorted = [...slots].sort((a, b) => a.from.localeCompare(b.from));
  for (let i = 1; i < sorted.length; i++) {
    const curr = sorted[i]!;
    const prev = sorted[i - 1]!;
    if (curr.from < prev.to) {
      return "Slots must not overlap";
    }
  }

  return null;
}

function validateClosedWeekly(item: ClosedWeekly): string | null {
  if (item.weekday < 0 || item.weekday > 6) {
    return "Weekday must be between 0 and 6";
  }
  if (item.from && !validateTimeFormat(item.from)) {
    return "From time must be in HH:MM format";
  }
  if (item.to && !validateTimeFormat(item.to)) {
    return "To time must be in HH:MM format";
  }
  if (item.from && item.to && item.from >= item.to) {
    return "From time must be before To time";
  }
  return null;
}

function validateClosedDate(item: ClosedDate): string | null {
  if (!validateDateFormat(item.date)) {
    return "Date must be in YYYY-MM-DD format";
  }
  if (item.from && !validateTimeFormat(item.from)) {
    return "From time must be in HH:MM format";
  }
  if (item.to && !validateTimeFormat(item.to)) {
    return "To time must be in HH:MM format";
  }
  if (item.from && item.to && item.from >= item.to) {
    return "From time must be before To time";
  }
  return null;
}

// Human-friendly preview functions
function formatTime(time: string): string {
  const [hours, minutes] = time.split(":");
  const h = parseInt(hours, 10);
  const period = h >= 12 ? "PM" : "AM";
  const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${displayHour}:${minutes} ${period}`;
}

function getWeekdayName(weekday: number): string {
  return WEEKDAYS.find(d => d.value === weekday)?.label ?? "Unknown";
}

function getTimeOfDay(time: string): string {
  const hour = parseInt(time.split(":")[0], 10);
  if (hour >= 6 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "lunch";
  if (hour >= 17 && hour < 21) return "evening";
  return "night";
}

function formatClosedWeeklyPreview(item: ClosedWeekly): string {
  const dayName = getWeekdayName(item.weekday);
  if (!item.from && !item.to) {
    return `Closed every ${dayName}`;
  }
  if (item.from && item.to) {
    const timeOfDay = getTimeOfDay(item.from);
    return `Closed every ${dayName} ${timeOfDay}`;
  }
  if (item.from) {
    return `Closed every ${dayName} from ${formatTime(item.from)}`;
  }
  if (item.to) {
    return `Closed every ${dayName} until ${formatTime(item.to)}`;
  }
  return `Closed every ${dayName}`;
}

function formatDate(date: string): string {
  const d = new Date(date + "T00:00:00");
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${d.getDate()} ${months[d.getMonth()]}`;
}

function formatClosedDatePreview(item: ClosedDate): string {
  const dateStr = formatDate(item.date);
  if (!item.from && !item.to) {
    return `Closed ${dateStr}`;
  }
  if (item.from && item.to) {
    const timeOfDay = getTimeOfDay(item.from);
    return `Closed ${dateStr} (${timeOfDay})`;
  }
  if (item.from) {
    return `Closed ${dateStr} from ${formatTime(item.from)}`;
  }
  if (item.to) {
    return `Closed ${dateStr} until ${formatTime(item.to)}`;
  }
  return `Closed ${dateStr}`;
}

export default function RestaurantSettingsForm({
  restaurant,
}: RestaurantSettingsFormProps) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>({ state: "idle" });

  const [name, setName] = useState(restaurant.name);
  const [logoUrl, setLogoUrl] = useState(restaurant.logo ?? "");
  const [primaryColor, setPrimaryColor] = useState(
    restaurant.primaryColor ?? "#000000",
  );

  const [slots, setSlots] = useState<Slot[]>(
    restaurant.settings?.slots ?? [
      { from: "18:00", to: "20:00", maxReservations: 10 },
    ],
  );

  const [closedWeekly, setClosedWeekly] = useState<ClosedWeekly[]>(
    restaurant.settings?.closedWeekly ?? [],
  );

  const [closedDates, setClosedDates] = useState<ClosedDate[]>(
    restaurant.settings?.closedDates ?? [],
  );

  const [slotErrors, setSlotErrors] = useState<Record<number, string>>({});
  const [closedWeeklyErrors, setClosedWeeklyErrors] = useState<
    Record<number, string>
  >({});
  const [closedDateErrors, setClosedDateErrors] = useState<
    Record<number, string>
  >({});

  useEffect(() => {
    // Validate slots on change
    const errors: Record<number, string> = {};
    slots.forEach((slot, index) => {
      const error = validateSlot(slot);
      if (error) errors[index] = error;
    });
    const overlapError = validateSlots(slots);
    if (overlapError) {
      // Mark all slots as having overlap error
      slots.forEach((_, index) => {
        errors[index] = overlapError;
      });
    }
    setSlotErrors(errors);
  }, [slots]);

  useEffect(() => {
    // Validate closedWeekly on change
    const errors: Record<number, string> = {};
    closedWeekly.forEach((item, index) => {
      const error = validateClosedWeekly(item);
      if (error) errors[index] = error;
    });
    setClosedWeeklyErrors(errors);
  }, [closedWeekly]);

  useEffect(() => {
    // Validate closedDates on change
    const errors: Record<number, string> = {};
    closedDates.forEach((item, index) => {
      const error = validateClosedDate(item);
      if (error) errors[index] = error;
    });
    setClosedDateErrors(errors);
  }, [closedDates]);

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
      { weekday: 1, from: undefined, to: undefined },
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
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().slice(0, 10);
    setClosedDates(prev => [...prev, { date: dateStr, from: undefined, to: undefined }]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const token = getToken();

    if (!token) {
      setStatus({
        state: "error",
        message: "You must be logged in to update restaurant settings.",
      });
      return;
    }

    // Final validation
    const slotsError = validateSlots(slots);
    if (slotsError) {
      setStatus({
        state: "error",
        message: slotsError,
      });
      return;
    }

    for (const item of closedWeekly) {
      const error = validateClosedWeekly(item);
      if (error) {
        setStatus({
          state: "error",
          message: error,
        });
        return;
      }
    }

    for (const item of closedDates) {
      const error = validateClosedDate(item);
      if (error) {
        setStatus({
          state: "error",
          message: error,
        });
        return;
      }
    }

    setStatus({ state: "submitting" });

    try {
      const settings: RestaurantSettings = {};

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

      const res = await fetch(`${API_BASE}/restaurants/${restaurant.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          logo: logoUrl || null,
          primaryColor: primaryColor || null,
          settings: Object.keys(settings).length > 0 ? settings : null,
        }),
      });

      const body = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(body?.message ?? "Failed to update restaurant");
      }

      setStatus({ state: "success" });
      setTimeout(() => {
        router.push("/owner");
      }, 1500);
    } catch (err) {
      console.error(err);
      setStatus({
        state: "error",
        message:
          err instanceof Error
            ? err.message
            : "Something went wrong while updating the restaurant.",
      });
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-xl bg-white p-6 shadow-sm border border-slate-200"
    >
      <div className="space-y-4">
        <h2 className="text-sm font-semibold tracking-tight text-slate-900">
          Basic Information
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
              pattern="^#[0-9a-fA-F]{6}$"
            />
          </div>
        </label>
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold tracking-tight text-slate-900 mb-1">
          Opening hours / slots
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
                  className={`w-full rounded-md border px-2 py-1 text-sm ${
                    slotErrors[index]
                      ? "border-red-300"
                      : "border-slate-300"
                  }`}
                  value={slot.from}
                  onChange={e => updateSlot(index, { from: e.target.value })}
                  required
                />
              </label>

              <label className="space-y-1 text-sm block">
                <span className="block font-medium">To</span>
                <input
                  type="time"
                  className={`w-full rounded-md border px-2 py-1 text-sm ${
                    slotErrors[index]
                      ? "border-red-300"
                      : "border-slate-300"
                  }`}
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
                  className={`w-full rounded-md border px-2 py-1 text-sm ${
                    slotErrors[index]
                      ? "border-red-300"
                      : "border-slate-300"
                  }`}
                  value={slot.maxReservations}
                  onChange={e =>
                    updateSlot(index, {
                      maxReservations: Number(e.target.value),
                    })
                  }
                  required
                />
              </label>

              {slotErrors[index] && (
                <p className="text-xs text-red-600 col-span-3">
                  {slotErrors[index]}
                </p>
              )}

              <button
                type="button"
                onClick={() => removeSlot(index)}
                className="text-xs text-slate-500 hover:text-red-600 text-left"
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
          + Add slot
        </button>
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold tracking-tight text-slate-900 mb-1">
          Closed weekly rules
        </h2>
        <p className="text-xs text-slate-500">
          Add recurring times when you&apos;re closed every week (e.g. closed
          all day Monday, or closed Monday lunch).
        </p>

        <div className="space-y-3">
          {closedWeekly.map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="grid gap-4 sm:grid-cols-3">
                <label className="space-y-1 text-sm block">
                  <span className="block font-medium">Weekday</span>
                  <select
                    className={`w-full rounded-md border px-2 py-1 text-sm ${
                      closedWeeklyErrors[index]
                        ? "border-red-300"
                        : "border-slate-300"
                    }`}
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
                    className={`w-full rounded-md border px-2 py-1 text-sm ${
                      closedWeeklyErrors[index]
                        ? "border-red-300"
                        : "border-slate-300"
                    }`}
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
                    className={`w-full rounded-md border px-2 py-1 text-sm ${
                      closedWeeklyErrors[index]
                        ? "border-red-300"
                        : "border-slate-300"
                    }`}
                    value={item.to ?? ""}
                    onChange={e =>
                      updateClosedWeekly(index, {
                        to: e.target.value || undefined,
                      })
                    }
                  />
                </label>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-600 italic">
                  {formatClosedWeeklyPreview(item)}
                </p>
                {closedWeeklyErrors[index] && (
                  <p className="text-xs text-red-600">
                    {closedWeeklyErrors[index]}
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => removeClosedWeekly(index)}
                  className="text-xs text-slate-500 hover:text-red-600"
                >
                  Remove
                </button>
              </div>
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
            <div key={index} className="space-y-2">
              <div className="grid gap-4 sm:grid-cols-3">
                <label className="space-y-1 text-sm block">
                  <span className="block font-medium">Date</span>
                  <input
                    type="date"
                    className={`w-full rounded-md border px-2 py-1 text-sm ${
                      closedDateErrors[index]
                        ? "border-red-300"
                        : "border-slate-300"
                    }`}
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
                    className={`w-full rounded-md border px-2 py-1 text-sm ${
                      closedDateErrors[index]
                        ? "border-red-300"
                        : "border-slate-300"
                    }`}
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
                    className={`w-full rounded-md border px-2 py-1 text-sm ${
                      closedDateErrors[index]
                        ? "border-red-300"
                        : "border-slate-300"
                    }`}
                    value={item.to ?? ""}
                    onChange={e =>
                      updateClosedDate(index, {
                        to: e.target.value || undefined,
                      })
                    }
                  />
                </label>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-600 italic">
                  {formatClosedDatePreview(item)}
                </p>
                {closedDateErrors[index] && (
                  <p className="text-xs text-red-600">
                    {closedDateErrors[index]}
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => removeClosedDate(index)}
                  className="text-xs text-slate-500 hover:text-red-600"
                >
                  Remove
                </button>
              </div>
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

      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {isSubmitting ? "Saving..." : "Save changes"}
        </button>

        <a
          href="/owner"
          className="inline-flex items-center justify-center rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Cancel
        </a>
      </div>

      {status.state === "error" && (
        <p className="text-sm text-red-600">{status.message}</p>
      )}

      {status.state === "success" && (
        <p className="text-sm text-green-600">
          Settings saved successfully! Redirecting...
        </p>
      )}
    </form>
  );
}

