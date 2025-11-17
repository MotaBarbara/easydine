import { saveToken } from "./auth";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3333";

type LoginResponseBody = {
  token?: string;
  accessToken?: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  message?: string;
};

export async function loginWithEmailPassword(email: string, password: string) {
  const res = await fetch(`${API_BASE}/sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const body = (await res.json().catch(() => null)) as LoginResponseBody | null;

  if (!res.ok) {
    const message = body?.message ?? "Invalid credentials";
    throw new Error(message);
  }

  const token = body?.token ?? body?.accessToken;
  if (!token) {
    throw new Error("No token returned from server");
  }

  saveToken(token);

  return { token, user: body?.user ?? null };
}
