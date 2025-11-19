"use client";

type Reservation = {
  id: string;
  slot: string;
  date: string;
  customerName: string;
  groupSize: number;
};

export default function ReservationCard({
  reservation,
}: {
  reservation: Reservation;
}) {
  const dateObj = new Date(reservation.date);

  const formattedDate = dateObj.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  const formattedTime = dateObj.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm flex justify-between">
      <div>
        <p className="text-sm font-medium">{reservation.customerName}</p>
        <p className="text-xs text-slate-500">
          {formattedDate} at {formattedTime}
        </p>
      </div>

      <p className="text-sm text-slate-600">{reservation.groupSize} guests</p>
    </div>
  );
}
