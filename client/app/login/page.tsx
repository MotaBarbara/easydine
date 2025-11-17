import LoginForm from "./login-form";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-md px-4 py-12 space-y-6">
        <header className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Login as a Restaurant Owner</h1>
          <p className="text-sm text-slate-600">
            Sign in to manage your restaurant and reservations.
          </p>
        </header>

        <LoginForm />
      </div>
    </main>
  );
}
