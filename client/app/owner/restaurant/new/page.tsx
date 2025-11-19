import CreateRestaurantForm from "../../components/create-restaurant-form";

export default function NewRestaurantPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-xl px-4 py-12 space-y-6">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            Create your restaurant
          </h1>
          <p className="text-sm text-slate-600">
            Add your restaurant details and basic booking settings.
          </p>
        </header>

        <CreateRestaurantForm />
      </div>
    </main>
  );
}
