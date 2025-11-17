import CancelReservationScreen from "./cancel-reservation-screen";

type RawParams = { token: string };

type Props = {
  params: RawParams | Promise<RawParams>;
};

export default async function CancelReservationPage({ params }: Props) {
  const resolved = params instanceof Promise ? await params : params;
  const { token } = resolved;

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-xl px-4 py-12">
        <CancelReservationScreen token={token} />
      </div>
    </main>
  );
}
