"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginWithEmailPassword, registerUser } from "@/lib/api/auth";

type Status =
  | { state: "idle" }
  | { state: "submitting" }
  | { state: "error"; message: string };

export default function RegisterForm() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<Status>({ state: "idle" });

  const isSubmitting = status.state === "submitting";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus({ state: "submitting" });

    try {
      await registerUser({ name, email, password });
      
      await loginWithEmailPassword(email, password);

      router.push("/owner");
    } catch (err) {
      console.error(err);
      setStatus({
        state: "error",
        message:
          err instanceof Error
            ? err.message
            : "Registration failed. Please try again.",
      });
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-xl bg-white p-4 shadow-sm border border-slate-200"
    >
      <label className="space-y-1 text-sm block">
        <span className="block font-medium">Name</span>
        <input
          type="text"
          className="w-full rounded-md border border-slate-300 px-2 py-1 text-sm"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          autoComplete="name"
        />
      </label>

      <label className="space-y-1 text-sm block">
        <span className="block font-medium">Email</span>
        <input
          type="email"
          className="w-full rounded-md border border-slate-300 px-2 py-1 text-sm"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
      </label>

      <label className="space-y-1 text-sm block">
        <span className="block font-medium">Password</span>
        <input
          type="password"
          className="w-full rounded-md border border-slate-300 px-2 py-1 text-sm"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          autoComplete="new-password"
        />
      </label>

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex items-center justify-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-60 w-full"
      >
        {isSubmitting ? "Creating account..." : "Create account"}
      </button>

      {status.state === "error" && (
        <p className="text-sm text-red-600">{status.message}</p>
      )}

      <p className="text-xs text-slate-500 text-center">
        Already have an account?{" "}
        <a
          href="/login"
          className="font-medium text-slate-900 underline underline-offset-2"
        >
          Sign in
        </a>
      </p>
    </form>
  );
}
