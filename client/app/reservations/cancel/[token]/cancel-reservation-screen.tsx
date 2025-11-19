"use client";

import { useState } from "react";

type Props = {
  token: string;
};

type ReservationSummary = {
  id?: string;
  restaurantName?: string;
  date?: string;
  time?: string;
  groupSize?: number;
};

type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; reservation: ReservationSummary | null }
  | { status: "already-cancelled" }
  | { status: "invalid" }
  | { status: "error"; message: string };

function formatDate(dateString?: string) {
  if (!dateString) return null;
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return null;

  return d.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function CancelReservationScreen({ token }: Props) {
  const [state, setState] = useState<State>({ status: "idle" });

  const apiBase =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3333";

  async function handleConfirmCancel() {
    setState({ status: "loading" });

    try {
      const res = await fetch(`${apiBase}/reservations/cancel/${token}`);
      const body = await res.json().catch(() => null);

      const reservation: ReservationSummary | null =
        body && typeof body === "object"
          ? {
              id: body.reservation?.id ?? body.id,
              restaurantName:
                body.reservation?.restaurant?.name ??
                body.restaurant?.name ??
                body.restaurantName,
              date: body.reservation?.date ?? body.date,
              time: body.reservation?.time ?? body.time,
              groupSize: body.reservation?.groupSize ?? body.groupSize,
            }
          : null;

      if (res.ok) {
        setState({ status: "success", reservation });
        return;
      }

      if (res.status === 409) {
        setState({ status: "already-cancelled" });
        return;
      }

      if (res.status === 400 || res.status === 404) {
        setState({ status: "invalid" });
        return;
      }

      setState({
        status: "error",
        message: body?.message ?? "Failed to cancel the reservation.",
      });
    } catch (err) {
      console.error(err);
      setState({
        status: "error",
        message:
          err instanceof Error
            ? err.message
            : "Something went wrong. Please try again.",
      });
    }
  }

  const isLoading = state.status === "loading";

  function ReservationDetails({
    reservation,
  }: {
    reservation: ReservationSummary | null;
  }) {
    if (!reservation) return null;

    const prettyDate = formatDate(reservation.date);
    const guestsLabel =
      reservation.groupSize != null
        ? `${reservation.groupSize} guest${
            reservation.groupSize === 1 ? "" : "s"
          }`
        : null;
  }

  return (
    <div className="space-y-4">
      {state.status === "idle" && (
        <>
          <h1 className="text-2xl font-semibold tracking-tight">
            Cancel reservation
          </h1>
          <p className="text-sm text-slate-600">
            Are you sure you want to cancel this reservation?
          </p>
          <button
            type="button"
            onClick={handleConfirmCancel}
            disabled={isLoading}
            className="inline-flex items-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-60 mt-4"
          >
            {isLoading ? "Cancelling…" : "Yes, cancel reservation"}
          </button>
        </>
      )}

      {state.status === "loading" && (
        <>
          <h1 className="text-2xl font-semibold tracking-tight">
            Cancelling reservation…
          </h1>
          <p className="text-sm text-slate-600">
            Please wait while we cancel your reservation.
          </p>
        </>
      )}

      {state.status === "success" && (
        <>
          <h1 className="text-2xl font-semibold tracking-tight text-emerald-700">
            Reservation cancelled
          </h1>
          <p className="text-sm text-slate-600">
            Your reservation has been cancelled successfully.
          </p>
          <ReservationDetails reservation={state.reservation} />
        </>
      )}

      {state.status === "already-cancelled" && (
        <>
          <h1 className="text-2xl font-semibold tracking-tight text-amber-700">
            Reservation already cancelled
          </h1>
          <p className="text-sm text-slate-600">
            This reservation was already cancelled.
          </p>
        </>
      )}

      {state.status === "invalid" && (
        <>
          <h1 className="text-2xl font-semibold tracking-tight text-red-700">
            Invalid or expired link
          </h1>
          <p className="text-sm text-slate-600">
            This cancellation link is invalid or has expired. Please contact the
            restaurant if you still need to cancel.
          </p>
        </>
      )}

      {state.status === "error" && (
        <>
          <h1 className="text-2xl font-semibold tracking-tight text-red-700">
            Something went wrong
          </h1>
          <p className="text-sm text-slate-600">{state.message}</p>
        </>
      )}
    </div>
  );
}
