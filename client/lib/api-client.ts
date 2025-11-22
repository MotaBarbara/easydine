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

    const url = `${this.baseUrl}${path}`;

    try {
      const res = await fetch(url, {
        ...options,
        headers,
        cache: "no-store",
      });

      const contentType = res.headers.get("content-type");
      const text = await res.text();

      if (!res.ok) {
        let errorMessage = res.statusText || `API request failed: ${res.status}`;
        
        try {
          if (text && contentType?.includes("application/json")) {
            const errorBody = JSON.parse(text);
            if (errorBody && typeof errorBody === 'object' && 'message' in errorBody) {
              errorMessage = errorBody.message as string;
            }
          }
        } catch {
          errorMessage = text || errorMessage;
        }
        
        throw new Error(errorMessage);
      }
      if (!text) {
        return {} as T;
      }
      
      if (!contentType?.includes("application/json")) {
        return text as T;
      }
      
      try {
        return JSON.parse(text) as T;
      } catch (parseError) {
        console.error("Failed to parse JSON response:", {
          url,
          text: text.substring(0, 100),
          error: parseError,
        });
        throw new Error("Invalid JSON response from server");
      }
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.error('Network error:', {
          url,
          baseUrl: this.baseUrl,
          error: error.message,
        });
        throw new Error(
          `Failed to connect to API. Please check if the backend is running at ${this.baseUrl}`
        );
      }
      throw error;
    }
  }
}

export const apiClient = new ApiClient();

