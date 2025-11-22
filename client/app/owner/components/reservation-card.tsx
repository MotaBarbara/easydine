"use client";

type Reservation = {
  id: string;
  slot: string;
  date: string;
  customerName: string;
  groupSize: number;
  status?: string;
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
  
  const isCancelled = reservation.status === "cancelled";
  const status = reservation.status || "confirmed";

  return (
    <div
      className={`rounded-lg border p-4 shadow-sm flex justify-between ${
        isCancelled
          ? "border-red-200 bg-red-50"
          : "border-slate-200 bg-white"
      }`}
    >
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-sm font-medium">{reservation.customerName}</p>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              isCancelled
                ? "bg-red-100 text-red-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {status === "cancelled" ? "Cancelled" : "Confirmed"}
          </span>
        </div>
        <p className="text-xs text-slate-500">
          {formattedDate} at {formattedTime}
        </p>
      </div>

      <p className="text-sm text-slate-600">{reservation.groupSize} guests</p>
    </div>
  );
}
