import { apiClient } from "../api-client";
import { saveToken } from "../auth";

export interface LoginResponse {
  token?: string;
  accessToken?: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  message?: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export async function loginWithEmailPassword(
  email: string,
  password: string,
): Promise<{ token: string; user: LoginResponse["user"] | null }> {
  const body = await apiClient.post<LoginResponse>("/sessions", {
    email,
    password,
  });

  const token = body?.token ?? body?.accessToken;
  if (!token) {
    throw new Error("No token returned from server");
  }

  saveToken(token);

  return { token, user: body?.user ?? null };
}

export async function registerUser(data: RegisterRequest): Promise<void> {
  await apiClient.post("/users", data);
}

