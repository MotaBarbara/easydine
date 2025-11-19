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

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(":").map(Number);
    const hour12 = hours % 12 || 12;
    const ampm = hours >= 12 ? "PM" : "AM";
    return `${hour12}:${String(minutes).padStart(2, "0")} ${ampm}`;
  };

  const formattedTime = reservation.slot ? formatTime(reservation.slot) : "";

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
