import { getToken } from "./auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3333";

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async get<T>(path: string, options?: RequestInit): Promise<T> {
    return this.request<T>(path, { ...options, method: "GET" });
  }

  async post<T>(path: string, data?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });
  }

  async put<T>(path: string, data?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: "PUT",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });
  }

  async patch<T>(
    path: string,
    data?: unknown,
    options?: RequestInit,
  ): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: "PATCH",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });
  }

  async request<T>(path: string, options?: RequestInit): Promise<T> {
    const token = getToken();
    const headers: Record<string, string> = {
      ...(options?.headers as Record<string, string> | undefined),
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const res = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers,
      cache: "no-store",
    });

    if (!res.ok) {
      let errorMessage = res.statusText || `API request failed: ${res.status}`;
      
      try {
        const errorBody = await res.json();
        if (errorBody && typeof errorBody === 'object' && 'message' in errorBody) {
          errorMessage = errorBody.message as string;
        }
      } catch {
        errorMessage = res.statusText || `API request failed: ${res.status}`;
      }
      
      throw new Error(errorMessage);
    }

    return res.json() as Promise<T>;
  }
}

export const apiClient = new ApiClient();

