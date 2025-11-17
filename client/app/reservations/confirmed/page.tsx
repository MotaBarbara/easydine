type SearchParams = {
  restaurantName?: string;
  date?: string;
  time?: string;
  guests?: string;
  customerName?: string;
};

type Props = {
  searchParams: Promise<SearchParams> | SearchParams;
};

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

export default async function ReservationConfirmedPage(props: Props) {
  const searchParams =
    props.searchParams instanceof Promise
      ? await props.searchParams
      : props.searchParams;

  const { restaurantName, date, time, guests, customerName } = searchParams;

  const prettyDate = formatDate(date);
  const guestsLabel =
    guests != null ? `${guests} guest${guests === "1" ? "" : "s"}` : null;

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-xl px-4 py-12 space-y-6">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            Reservation confirmed
          </h1>
          <p className="text-sm text-slate-600">
            {customerName
              ? `Thanks, ${customerName}.`
              : "Thanks for your booking."}{" "}
            Your table is confirmed.
          </p>
        </header>

        <section className="rounded-xl bg-white p-4 shadow-sm border border-slate-200 space-y-4">
          <div>
            <p className="text-xs font-medium uppercase text-slate-500">
              Restaurant
            </p>
            <p className="text-sm text-slate-900">{restaurantName ?? ""}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-xs font-medium uppercase text-slate-500">
                Date
              </p>
              <p className="text-sm text-slate-900">{prettyDate ?? "—"}</p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase text-slate-500">
                Time
              </p>
              <p className="text-sm text-slate-900">{time ?? "—"}</p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase text-slate-500">
                Guests
              </p>
              <p className="text-sm text-slate-900">{guestsLabel ?? "—"}</p>
            </div>
          </div>
        </section>

        <p className="text-sm text-slate-600">
          We&apos;ve sent you a confirmation email with a cancellation link. If
          you can&apos;t make it, please cancel your reservation so the
          restaurant can offer your table to someone else.
        </p>
      </div>
    </main>
  );
}
