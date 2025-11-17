import RegisterForm from "./register-from";

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-md px-4 py-12 space-y-6">
        <header className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Register as a Restaurant Owner
          </h1>
          <p className="text-sm text-slate-600">
            Create an account to configure your restaurant and manage
            reservations.
          </p>
        </header>

        <RegisterForm />
      </div>
    </main>
  );
}
