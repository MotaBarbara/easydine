const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function apiFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not configured");
  }

  const url = `${API_BASE_URL}${path}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `API request failed: ${res.status} ${res.statusText}\n${text}`,
    );
  }

  return res.json() as Promise<T>;
}
